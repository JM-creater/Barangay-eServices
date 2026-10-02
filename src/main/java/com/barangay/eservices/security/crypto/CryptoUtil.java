package com.barangay.eservices.security.crypto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Component
@NoArgsConstructor
@AllArgsConstructor
public class CryptoUtil {

    private static final Logger logger = LoggerFactory.getLogger(CryptoUtil.class);

    private static final String ALGORITHM = "AES";

    private static final String CIPHER_TRANSFORMATION = "AES/GCM/NoPadding";

    private static final int GCM_TAG_LENGTH_BITS = 128;

    private static final int IV_LENGTH_BYTES = 12;

    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    private EncryptionProperties properties;

    /*
    * Derives a consistent 256-bit (32-byte) AES key from the secret passphrase via SHA-256.
    * */
    private SecretKey getSecretKey() {
        try  {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(properties.getSecretKey().getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(keyBytes, ALGORITHM);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available on JVM", e);
        }
    }

    public EncryptedEnvelope encrypt(String plainText) {
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, getSecretKey(), parameterSpec);

            byte[] cipherBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            String base64Iv = Base64.getEncoder().encodeToString(iv);
            String base64Data = Base64.getEncoder().encodeToString(cipherBytes);

            return new EncryptedEnvelope(base64Iv, base64Data);
        } catch (Exception e) {
            logger.error("Failed to encrypt payload: {}", e.getMessage(), e);
            throw new RuntimeException("Payload encryption failure", e);
        }
    }

    public String decrypt(String base64Iv, String base64Data) {
        try {
            byte[] iv = Base64.getDecoder().decode(base64Iv);
            byte[] cipherBytes = Base64.getDecoder().decode(base64Data);

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), parameterSpec);

            byte[] plainBytes = cipher.doFinal(cipherBytes);
            return new String(plainBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("Failed to decrypt payload: {}", e.getMessage(), e);
            throw new RuntimeException("Payload decryption failure", e);
        }
    }


}
