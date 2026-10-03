package com.barangay.eservices.util;

public final class SqlSearchUtil {

    public static final int MAX_SEARCH_LENGTH = 100;

    private SqlSearchUtil() {
        // Utility class private constructor
    }

    /**
     * Escapes SQL LIKE special wildcard characters ('\', '%', '_') and trims whitespace.
     * Replaces '\' with '\\', '%' with '\%', and '_' with '\_'.
     *
     * @param input Raw search term from user request
     * @return Sanitized string safe for CONCAT('%', :param, '%') with ESCAPE '\\', or null if input is empty
     */
    public static String escapeLikeWildcards(String input) {
        if (input == null) {
            return null;
        }

        String trimmed = input.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        if (trimmed.length() > MAX_SEARCH_LENGTH) {
            trimmed = trimmed.substring(0, MAX_SEARCH_LENGTH);
        }

        return trimmed
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}
