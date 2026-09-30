package com.barangay.eservices.exception;

import org.springframework.http.HttpStatus;

public class SlotFullException extends ApiException {
    public SlotFullException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
