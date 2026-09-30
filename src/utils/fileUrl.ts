import { getApiBaseUrl } from '../services/api';

/**
 * Helper utility to resolve file attachment download and preview URLs.
 * Supports Railway S3 Bucket object URLs, custom API Base URLs, and local fallback paths.
 */
export const getFileDownloadUrl = (storedFileName: string, fileUrl?: string): string => {
  if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
    return fileUrl;
  }

  const apiBase = getApiBaseUrl();

  if (fileUrl && fileUrl.startsWith('/api/')) {
    // If backend provided a relative API path like "/api/files/download/xyz"
    if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
      return `${apiBase}${fileUrl.substring(4)}`;
    }
    return fileUrl;
  }

  return `${apiBase}/files/download/${encodeURIComponent(storedFileName)}`;
};
