import { APP_CONFIG } from '../app/config';

export interface ImageUploadOptions {
  folder: 'covers' | 'screenshots' | 'avatars';
  maxSizeMb?: number;
  onProgress?: (percent: number) => void;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const cloudinaryService = {
  validateFile(file: File, maxSizeMb: number = 5): void {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type (${file.type}). Allowed types are JPEG, PNG, and WebP.`);
    }

    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of ${maxSizeMb} MB.`);
    }
  },

  async uploadImage(file: File, options: ImageUploadOptions): Promise<string> {
    const maxSize = options.maxSizeMb || 5;
    this.validateFile(file, maxSize);

    const cloudName = APP_CONFIG.cloudinary.cloudName;
    const apiKey = APP_CONFIG.cloudinary.apiKey;

    // If Cloudinary credentials are configured in production:
    if (cloudName && apiKey && cloudName !== 'demo-company') {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'project_hub_unsigned'); // or signed with backend signature
        formData.append('folder', `project_hub/${options.folder}`);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary');
        }

        const data = await response.json();
        return data.secure_url;
      } catch (err: unknown) {
        console.warn('[Cloudinary] Remote upload failed, falling back to local object URL:', err);
      }
    }

    // Development / Local fallback: convert to base64 Data URL or Object URL for immediate local preview
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file data'));
        }
      };
      reader.onerror = () => reject(new Error('File reader error'));
      reader.readAsDataURL(file);
    });
  },
};

