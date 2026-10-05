export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const validateAttachedFile = (file: File): FileValidationResult => {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  // Check 0-byte file
  if (file.size <= 0) {
    return { isValid: false, error: `File "${file.name}" is empty or corrupted (0 bytes).` };
  }

  // Check file size (<= 5MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File "${file.name}" exceeds maximum allowed size of 5 MB (Current size: ${sizeInMb} MB).`,
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_FILE_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ".${extension}" is not supported. Please upload JPG, PNG, WEBP, or PDF.`,
    };
  }

  // Check MIME type if available
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not supported. Please upload clear images or PDF documents.`,
    };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
