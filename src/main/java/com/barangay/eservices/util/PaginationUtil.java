package com.barangay.eservices.util;

import com.barangay.eservices.exception.BadRequestException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

/**
 * Utility for safe pagination and sort validation.
 * Prevents ORDER BY SQL injection, invalid entity property exceptions, and pagination memory exhaustion.
 */
public final class PaginationUtil {

    public static final int DEFAULT_PAGE = 0;
    public static final int DEFAULT_SIZE = 15;
    public static final int MAX_PAGE_SIZE = 100;
    public static final int MIN_PAGE_SIZE = 1;

    private PaginationUtil() {
        // Utility class private constructor
    }

    /**
     * Normalizes page index within safe bounds (>= 0).
     */
    public static int sanitizePage(int page) {
        return Math.max(page, DEFAULT_PAGE);
    }

    /**
     * Normalizes page size within safe bounds (1 <= size <= 100).
     * If size is less than 1, returns DEFAULT_SIZE (15).
     */
    public static int sanitizeSize(int size) {
        return sanitizeSize(size, DEFAULT_SIZE);
    }

    /**
     * Normalizes page size within safe bounds with a custom default size.
     */
    public static int sanitizeSize(int size, int defaultSize) {
        if (size < MIN_PAGE_SIZE) {
            return defaultSize > 0 ? Math.min(defaultSize, MAX_PAGE_SIZE) : DEFAULT_SIZE;
        }
        return Math.min(size, MAX_PAGE_SIZE);
    }

    /**
     * Builds a safe Pageable with pre-configured Sort.
     */
    public static Pageable createSafePageRequest(int page, int size, Sort sort) {
        return PageRequest.of(sanitizePage(page), sanitizeSize(size), sort != null ? sort : Sort.unsorted());
    }

    /**
     * Builds a safe Pageable with whitelisted sorting.
     *
     * @param page          Requested page index
     * @param size          Requested page size
     * @param sortBy        Requested sort property name
     * @param direction     Requested sort direction ("asc" or "desc")
     * @param defaultSort   Default sort property if sortBy is null/blank
     * @param allowedFields Set of allowed property names permitted for sorting
     * @return Validated Pageable instance
     * @throws BadRequestException if sortBy is provided but not in allowedFields
     */
    public static Pageable createSafePageRequest(int page, int size, String sortBy, String direction,
                                                 String defaultSort, Set<String> allowedFields) {
        int safePage = sanitizePage(page);
        int safeSize = sanitizeSize(size);

        String property = defaultSort;
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            String trimmedSort = sortBy.trim();
            if (allowedFields != null && !allowedFields.contains(trimmedSort)) {
                throw new BadRequestException("Invalid sort field: '" + trimmedSort + "'. Allowed fields: " + allowedFields);
            }
            property = trimmedSort;
        }

        Sort.Direction sortDirection = Sort.Direction.DESC;
        if (direction != null && "asc".equalsIgnoreCase(direction.trim())) {
            sortDirection = Sort.Direction.ASC;
        }

        Sort sort = (property != null && !property.isEmpty())
                ? Sort.by(sortDirection, property)
                : Sort.unsorted();

        return PageRequest.of(safePage, safeSize, sort);
    }
}
