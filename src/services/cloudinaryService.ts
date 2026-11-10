import { imageUploadService, ImageUploadOptions } from './imageUploadService';

export type { ImageUploadOptions };

/**
 * Backwards compatible alias forwarding to unified imageUploadService
 */
export const cloudinaryService = {
  validateFile: imageUploadService.validateFile.bind(imageUploadService),
  uploadImage: imageUploadService.uploadImage.bind(imageUploadService),
};
