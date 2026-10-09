import { getApiBaseUrl } from '../services/api';

/**
 * Helper utility to resolve file attachment download and preview URLs.
 * Supports Railway S3 Bucket object URLs, custom API Base URLs, and local fallback paths.
 * Automatically attaches authenticated JWT or public tracking reference token
 * so that standard <a> browser tabs can securely stream/preview attachments.
 */
export const getFileDownloadUrl = (
  storedFileName: string,
  fileUrl?: string,
  referenceNumber?: string
): string => {
  let url = '';
  const apiBase = getApiBaseUrl();

  if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
    url = fileUrl;
  } else if (fileUrl && fileUrl.startsWith('/api/')) {
    if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
      url = `${apiBase}${fileUrl.substring(4)}`;
    } else {
      url = fileUrl;
    }
  } else {
    url = `${apiBase}/files/download/${encodeURIComponent(storedFileName)}`;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && !url.includes('token=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}token=${encodeURIComponent(token)}`;
  } else if (referenceNumber && !url.includes('ref=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}ref=${encodeURIComponent(referenceNumber)}`;
  }

  return url;
};
