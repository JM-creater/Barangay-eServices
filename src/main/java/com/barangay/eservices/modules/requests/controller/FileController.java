package com.barangay.eservices.modules.requests.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.util.FileStorageService;
import com.barangay.eservices.util.S3Resource;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Files", description = "File storage and retrieval API (Railway Bucket S3 & Local)")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/download/{fileName:.+}")
    @Operation(summary = "Download or view uploaded attachment")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
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

        ResponseEntity.BodyBuilder responseBuilder = ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"");

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
    @Operation(summary = "Get resolved access URL for an attachment")
    public ResponseEntity<ApiResponse<Map<String, String>>> getFileUrl(@PathVariable String fileName) {
        String fileUrl = fileStorageService.getFileUrl(fileName);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "fileName", fileName,
                "fileUrl", fileUrl != null ? fileUrl : ""
        )));
    }
}
