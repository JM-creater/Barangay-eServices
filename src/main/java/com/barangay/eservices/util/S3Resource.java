package com.barangay.eservices.util;

import org.springframework.core.io.AbstractResource;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.io.IOException;
import java.io.InputStream;

public class S3Resource extends AbstractResource {

    private final ResponseInputStream<GetObjectResponse> inputStream;
    private final String filename;
    private final long contentLength;
    private final String contentType;

    public S3Resource(ResponseInputStream<GetObjectResponse> inputStream, String filename, long contentLength, String contentType) {
        this.inputStream = inputStream;
        this.filename = filename;
        this.contentLength = contentLength;
        this.contentType = contentType;
    }

    @Override
    public String getDescription() {
        return "S3Object [" + filename + "]";
    }

    @Override
    public InputStream getInputStream() throws IOException {
        return inputStream;
    }

    @Override
    public String getFilename() {
        return filename;
    }

    @Override
    public long contentLength() throws IOException {
        return contentLength >= 0 ? contentLength : super.contentLength();
    }

    @Override
    public boolean exists() {
        return true;
    }

    public String getContentType() {
        return contentType;
    }
}
