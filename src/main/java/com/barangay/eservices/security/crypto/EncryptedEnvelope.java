package com.barangay.eservices.security.crypto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class EncryptedEnvelope {

    private boolean encrypted = true;

    private String iv;

    private String data;

    private long timestamp;

    public EncryptedEnvelope() {
        this.timestamp = Instant.now().toEpochMilli();
    }

    public EncryptedEnvelope(String iv, String data) {
        this.iv = iv;
        this.data = data;
        this.timestamp = Instant.now().toEpochMilli();
    }
}
