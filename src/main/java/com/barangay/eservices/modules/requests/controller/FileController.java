package com.barangay.eservices.modules.requests.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.exception.ApiException;
import com.barangay.eservices.modules.requests.entity.DocumentRequest;
import com.barangay.eservices.modules.requests.entity.RequestFile;
import com.barangay.eservices.modules.requests.repository.RequestFileRepository;
import com.barangay.eservices.security.SecurityUtil;
import com.barangay.eservices.util.FileStorageService;
import com.barangay.eservices.util.S3Resource;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Files", description = "File storage and retrieval API (Railway Bucket S3 & Local)")
public class FileController {

    private static final Set<String> SAFE_INLINE_MEDIA_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/pdf"
    );

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private RequestFileRepository requestFileRepository;

    @GetMapping("/download/{fileName:.+}")
    @Operation(summary = "Download or view uploaded attachment with strict ownership/tracking authorization")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileName,
            @RequestParam(required = false) String ref,
            HttpServletRequest request) {

        validateFileAccess(fileName, ref);

        Resource resource = fileStorageService.loadFileAsResource(fileName);

        String contentType = null;
        if (resource instanceof S3Resource) {
            contentType = ((S3Resource) resource).getContentType();
        }

        if (contentType == null) {
            contentType = request.getServletContext().getMimeType(fileName);
        }

        if (contentType == null) {
            contentType = fileStorageService.probeContentType(fileName);
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        // Sanitize filename to prevent HTTP header injection
        String rawFilename = resource.getFilename() != null ? resource.getFilename() : fileName;
        String safeFilename = rawFilename.replaceAll("[\\r\\n;\"\\\\]", "_");

        // Serve only safe preview types (images, pdf) inline. Everything else must be an attachment.
        boolean isSafeInline = isSafeInlinePreview(contentType);
        String dispositionType = isSafeInline ? "inline" : "attachment";

        ResponseEntity.BodyBuilder responseBuilder = ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, dispositionType + "; filename=\"" + safeFilename + "\"")
                .header("X-Content-Type-Options", "nosniff")
                .header(HttpHeaders.CACHE_CONTROL, "private, no-cache, no-store, must-revalidate")
                .header("Pragma", "no-cache");

        try {
            long len = resource.contentLength();
            if (len > 0) {
                responseBuilder.contentLength(len);
            }
        } catch (IOException ignored) {
        }

        return responseBuilder.body(resource);
    }

    @GetMapping("/url/{fileName:.+}")
    @Operation(summary = "Get resolved access URL for an attachment with ownership verification")
    public ResponseEntity<ApiResponse<Map<String, String>>> getFileUrl(
            @PathVariable String fileName,
            @RequestParam(required = false) String ref) {

        validateFileAccess(fileName, ref);

        String fileUrl = fileStorageService.getFileUrl(fileName);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "fileName", fileName,
                "fileUrl", fileUrl != null ? fileUrl : ""
        )));
    }

    /**
     * Enforces fine-grained file access control:
     * 1. Staff, Approvers, and Admins can view any file attachment.
     * 2. Logged-in Residents can view files attached to their own document requests.
     * 3. Applicants tracking via reference number can access their application's attachments if matching ?ref= is provided.
     * 4. Any unauthorized attempt is rejected with HTTP 403 Forbidden.
     */
    private void validateFileAccess(String fileName, String ref) {
        Optional<RequestFile> requestFileOpt = requestFileRepository.findByStoredFileName(fileName);

        // 1. If file is associated with a document request
        if (requestFileOpt.isPresent()) {
            RequestFile requestFile = requestFileOpt.get();
            DocumentRequest docReq = requestFile.getDocumentRequest();

            // Staff, Approvers, and Admins have full access
            boolean isStaffOrAdmin = SecurityUtil.hasRole("ROLE_STAFF")
                    || SecurityUtil.hasRole("ROLE_APPROVER")
                    || SecurityUtil.hasRole("ROLE_ADMIN");

            if (isStaffOrAdmin) {
                return;
            }

            // Check if current user is the resident owner
            Long currentUserId = SecurityUtil.getCurrentUserId();
            if (currentUserId != null && docReq != null && docReq.getResident() != null
                    && currentUserId.equals(docReq.getResident().getId())) {
                return;
            }

            // Check if valid reference number was provided (for citizen tracking view)
            if (StringUtils.hasText(ref) && docReq != null && docReq.getReferenceNumber() != null
                    && docReq.getReferenceNumber().equalsIgnoreCase(ref.trim())) {
                return;
            }

            throw new ApiException("Access denied: You do not have permission to access this file.", HttpStatus.FORBIDDEN);
        }

        // 2. If file is not in request_files table (e.g. administrative/system asset), allow only staff/admin
        boolean isStaffOrAdmin = SecurityUtil.hasRole("ROLE_STAFF")
                || SecurityUtil.hasRole("ROLE_APPROVER")
                || SecurityUtil.hasRole("ROLE_ADMIN");

        if (!isStaffOrAdmin) {
            throw new ApiException("File not found or access denied.", HttpStatus.NOT_FOUND);
        }
    }

    private boolean isSafeInlinePreview(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            return false;
        }
        String normalized = contentType.split(";")[0].trim().toLowerCase();
        return SAFE_INLINE_MEDIA_TYPES.contains(normalized);
    }
}
