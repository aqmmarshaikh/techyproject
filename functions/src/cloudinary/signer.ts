import { v2 as cloudinary } from 'cloudinary';

export function createCloudinarySignature(params: {
  folder: string;
  timestamp: number;
  apiSecret: string;
}): string {
  const paramsToSign = {
    folder: params.folder,
    timestamp: params.timestamp,
  };

  return cloudinary.utils.api_sign_request(paramsToSign, params.apiSecret);
}

