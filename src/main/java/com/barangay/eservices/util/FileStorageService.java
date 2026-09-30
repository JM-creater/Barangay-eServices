package com.barangay.eservices.util;

import com.barangay.eservices.config.S3StorageProperties;
import com.barangay.eservices.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaTypeFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    private final Path fileStorageLocation;
    private final S3StorageProperties s3Properties;
    private S3Client s3Client;

    public FileStorageService(
            S3StorageProperties s3Properties,
            @Value("${file.upload-dir:./uploads/barangay_requests}") String uploadDir) {
        this.s3Properties = s3Properties;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new ApiException("Could not create the directory where the uploaded files will be stored: " + ex.getMessage());
        }

        if (s3Properties.isConfigured()) {
            initS3Client();
        } else if (!s3Properties.isEnabled()) {
            logger.info("Railway S3 storage is disabled (app.storage.s3.enabled=false). Operating in local storage mode at: {}", this.fileStorageLocation);
        } else {
            logger.info("Railway S3 credentials not configured. Operating in local storage mode at: {}", this.fileStorageLocation);
        }
    }

    private synchronized void initS3Client() {
        try {
            logger.info("Initializing Railway S3 Client for endpoint: {}, bucket: {}, region: {}",
                    s3Properties.getEndpoint(), s3Properties.getBucket(), s3Properties.getRegion());

            this.s3Client = S3Client.builder()
                    .endpointOverride(URI.create(s3Properties.getEndpoint()))
                    .region(Region.of(s3Properties.getRegion()))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(s3Properties.getAccessKeyId(), s3Properties.getSecretAccessKey())
                    ))
                    .serviceConfiguration(S3Configuration.builder()
                            .pathStyleAccessEnabled(s3Properties.isPathStyleAccess())
                            .build())
                    .build();

            logger.info("Railway S3 Client connected successfully.");
        } catch (Exception ex) {
            logger.error("Failed to initialize Railway S3 Client, will fallback to local storage: {}", ex.getMessage());
            this.s3Client = null;
        }
    }

    public boolean isS3Active() {
        if (!s3Properties.isEnabled()) {
            return false;
        }
        if (s3Client == null && s3Properties.isConfigured()) {
            initS3Client();
        }
        return s3Client != null;
    }

    public StoredFile storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");

        if (originalFileName.contains("..")) {
            throw new ApiException("Filename contains invalid path sequence " + originalFileName);
        }

        String fileExtension = "";
        int extensionIndex = originalFileName.lastIndexOf(".");
        if (extensionIndex > 0) {
            fileExtension = originalFileName.substring(extensionIndex);
        }

        String storedFileName = UUID.randomUUID().toString() + fileExtension;
        String contentType = file.getContentType() != null ? file.getContentType() : probeContentType(originalFileName);
        long fileSize = file.getSize();

        // 1. Try uploading to Railway S3 Bucket if active
        if (isS3Active()) {
            try {
                String s3Key = s3Properties.getPrefix() + storedFileName;
                PutObjectRequest putRequest = PutObjectRequest.builder()
                        .bucket(s3Properties.getBucket())
                        .key(s3Key)
                        .contentType(contentType)
                        .contentLength(fileSize)
                        .build();

                s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), fileSize));

                String storagePath = "s3://" + s3Properties.getBucket() + "/" + s3Key;
                logger.info("File uploaded to Railway S3 bucket [{}]: key={}", s3Properties.getBucket(), s3Key);

                return new StoredFile(originalFileName, storedFileName, storagePath, contentType, fileSize);
            } catch (Exception ex) {
                logger.error("Railway S3 upload failed for file {}, falling back to local disk storage: {}",
                        originalFileName, ex.getMessage());
                // Fallback to local disk storage to avoid failing resident requests
            }
        }

        // 2. Local disk storage fallback
        try {
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            logger.info("File stored in local directory: {}", targetLocation);
            return new StoredFile(originalFileName, storedFileName, targetLocation.toString(), contentType, fileSize);
        } catch (IOException ex) {
            throw new ApiException("Could not store file " + originalFileName + ". Please try again! " + ex.getMessage());
        }
    }

    public Resource loadFileAsResource(String fileName) {
        // 1. Try loading from Railway S3 Bucket if active
        if (isS3Active()) {
            String s3Key = s3Properties.getPrefix() + fileName;
            try {
                GetObjectRequest getRequest = GetObjectRequest.builder()
                        .bucket(s3Properties.getBucket())
                        .key(s3Key)
                        .build();

                ResponseInputStream<GetObjectResponse> s3Stream = s3Client.getObject(getRequest);
                GetObjectResponse response = s3Stream.response();
                long contentLength = response.contentLength() != null ? response.contentLength() : -1;
                String contentType = response.contentType() != null ? response.contentType() : probeContentType(fileName);

                return new S3Resource(s3Stream, fileName, contentLength, contentType);
            } catch (NoSuchKeyException ex) {
                logger.warn("File {} not found with prefix {} in S3 bucket, checking without prefix...", fileName, s3Properties.getPrefix());
                try {
                    GetObjectRequest fallbackRequest = GetObjectRequest.builder()
                            .bucket(s3Properties.getBucket())
                            .key(fileName)
                            .build();

                    ResponseInputStream<GetObjectResponse> s3Stream = s3Client.getObject(fallbackRequest);
                    GetObjectResponse response = s3Stream.response();
                    return new S3Resource(s3Stream, fileName,
                            response.contentLength() != null ? response.contentLength() : -1,
                            response.contentType() != null ? response.contentType() : probeContentType(fileName));
                } catch (Exception inner) {
                    logger.debug("File {} not found in S3 bucket: {}", fileName, inner.getMessage());
                }
            } catch (S3Exception ex) {
                logger.warn("S3 retrieval error for {}: {}", fileName, ex.getMessage());
            } catch (Exception ex) {
                logger.error("Unexpected error retrieving {} from S3: {}", fileName, ex.getMessage());
            }
        }

        // 2. Local disk fallback (also handles pre-existing files stored on disk)
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new ApiException("File not found: " + fileName, HttpStatus.NOT_FOUND);
            }
        } catch (MalformedURLException ex) {
            throw new ApiException("File not found: " + fileName, ex, HttpStatus.NOT_FOUND);
        }
    }

    public String probeContentType(String fileName) {
        if (!StringUtils.hasText(fileName)) {
            return "application/octet-stream";
        }

        // Spring MediaTypeFactory
        var mediaType = MediaTypeFactory.getMediaType(fileName);
        if (mediaType.isPresent()) {
            return mediaType.get().toString();
        }

        // URLConnection MIME guess
        String guessed = URLConnection.guessContentTypeFromName(fileName);
        if (guessed != null) {
            return guessed;
        }

        return "application/octet-stream";
    }

    public String getFileUrl(String fileName) {
        if (!StringUtils.hasText(fileName)) {
            return null;
        }
        return "/api/files/download/" + fileName;
    }

    public static class StoredFile {
        private final String originalFileName;
        private final String storedFileName;
        private final String storagePath;
        private final String fileType;
        private final long fileSize;

        public StoredFile(String originalFileName, String storedFileName, String storagePath, String fileType, long fileSize) {
            this.originalFileName = originalFileName;
            this.storedFileName = storedFileName;
            this.storagePath = storagePath;
            this.fileType = fileType;
            this.fileSize = fileSize;
        }

        public String getOriginalFileName() {
            return originalFileName;
        }

        public String getStoredFileName() {
            return storedFileName;
        }

        public String getStoragePath() {
            return storagePath;
        }

        public String getFileType() {
            return fileType;
        }

        public long getFileSize() {
            return fileSize;
        }
    }
}
