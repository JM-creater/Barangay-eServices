package com.barangay.eservices.security.crypto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.MethodParameter;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.net.URI;

@ControllerAdvice
@AllArgsConstructor
public class EncryptedResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    private static final Logger logger = LoggerFactory.getLogger(EncryptedResponseBodyAdvice.class);

    private final CryptoUtil cryptoUtil;

    private final EncryptionProperties encryptionProperties;

    private final ObjectMapper objectMapper;

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {

        if (!encryptionProperties.isEnabled()) {
            return false;
        }

        if (!MappingJackson2HttpMessageConverter.class.isAssignableFrom(converterType)) {
            return false;
        }

        Class<?> paramType = returnType.getParameterType();
        if (Resource.class.isAssignableFrom(paramType) || byte[].class.isAssignableFrom(paramType)) {
            return false;
        }

        if (returnType.hasMethodAnnotation(NoEncryption.class) ||
                (returnType.getDeclaringClass() != null && returnType.getDeclaringClass().isAnnotationPresent(NoEncryption.class))) {
            return false;
        }

        return true;
    }

    @Override
    public Object beforeBodyWrite(
            Object body,
            MethodParameter returnType,
            MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response
    ) {
        if (body == null || body instanceof EncryptedEnvelope) {
            return body;
        }

        URI uri = request.getURI();
        String path = uri.getPath();
        if (path != null) {
            for (String excluded : encryptionProperties.getExcludedPaths()) {
                if (path.startsWith(excluded)) {
                    return body;
                }
            }
        }

        try {
            String json;
            if (body instanceof String) {
                json = (String) body;
            } else {
                json = objectMapper.writeValueAsString(body);
            }

            EncryptedEnvelope envelope = cryptoUtil.encrypt(json);

            response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

            return envelope;
        } catch (JsonProcessingException e) {
            logger.error("JSON serialization failed during encryption: {}", e.getMessage(), e);
            // Fallback
            return body;
        } catch (Exception e) {
            logger.error("Error during response encryption: {}", e.getMessage(), e);
            return body;
        }
    }
}
