package com.barangay.eservices.util;

import com.barangay.eservices.exception.BadRequestException;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public class FileValidationUtil {

    public static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    public static final String MAX_FILE_SIZE_LABEL = "5 MB";

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "webp", "pdf"
    );

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
    );

    /**
     * Validates a single uploaded file against file size, extension, MIME type, and magic bytes.
     * Throws BadRequestException on any violation.
     */
    public static void validateFile(MultipartFile file, String fieldName) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(String.format("File for '%s' is empty or was not received.", fieldName));
        }

        // 1. File size check
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException(String.format(
                    "File '%s' exceeds the maximum allowed size of %s (Uploaded size: %.2f MB).",
                    file.getOriginalFilename(),
                    MAX_FILE_SIZE_LABEL,
                    file.getSize() / (1024.0 * 1024.0)
            ));
        }

        if (file.getSize() <= 0) {
            throw new BadRequestException(String.format("File '%s' is corrupted or has 0 bytes.", file.getOriginalFilename()));
        }

        // 2. Extension check
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Invalid path sequence in filename: " + originalFilename);
        }

        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex <= 0 || dotIndex == originalFilename.length() - 1) {
            throw new BadRequestException(String.format("File '%s' does not have a valid extension.", originalFilename));
        }

        String extension = originalFilename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException(String.format(
                    "File extension '.%s' is not supported for '%s'. Allowed formats: JPG, PNG, WEBP, PDF.",
                    extension,
                    originalFilename
            ));
        }

        // 3. MIME Content-Type header check
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isBlank()) {
            String normalizedMime = contentType.toLowerCase(Locale.ROOT).split(";")[0].trim();
            if (!ALLOWED_CONTENT_TYPES.contains(normalizedMime)) {
                throw new BadRequestException(String.format(
                        "File format '%s' for '%s' is not allowed. Only images (JPG, PNG, WEBP) and PDF documents are accepted.",
                        contentType,
                        originalFilename
                ));
            }
        }

        // 4. Magic byte signature check
        verifyMagicBytes(file, extension);
    }

    /**
     * Inspects the first bytes of the file to guarantee the content matches the extension.
     */
    private static void verifyMagicBytes(MultipartFile file, String extension) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[8];
            int bytesRead = is.read(header);
            if (bytesRead < 4) {
                throw new BadRequestException("File header is too short or corrupted: " + file.getOriginalFilename());
            }

            if ("pdf".equals(extension)) {
                // PDF magic bytes: %PDF (0x25, 0x50, 0x44, 0x46)
                if (header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46) {
                    throw new BadRequestException("File is not a valid PDF document despite its extension: " + file.getOriginalFilename());
                }
            } else if ("jpg".equals(extension) || "jpeg".equals(extension)) {
                // JPEG magic bytes: 0xFF, 0xD8, 0xFF
                if ((header[0] & 0xFF) != 0xFF || (header[1] & 0xFF) != 0xD8 || (header[2] & 0xFF) != 0xFF) {
                    throw new BadRequestException("File is not a valid JPEG image despite its extension: " + file.getOriginalFilename());
                }
            } else if ("png".equals(extension)) {
                // PNG magic bytes: 0x89, 0x50, 0x4E, 0x47
                if ((header[0] & 0xFF) != 0x89 || (header[1] & 0xFF) != 0x50 || (header[2] & 0xFF) != 0x4E || (header[3] & 0xFF) != 0x47) {
                    throw new BadRequestException("File is not a valid PNG image despite its extension: " + file.getOriginalFilename());
                }
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to verify file integrity for: " + file.getOriginalFilename());
        }
    }
}
