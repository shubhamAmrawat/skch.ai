import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '../config/r2Client.js';

/**
 * Upload a buffer to R2.
 * @param {string} key - e.g. "sketches/abc123/thumbnail.png"
 * @param {Buffer} body - file content
 * @param {string} contentType - e.g. "image/png" or "application/json"
 * @returns {Promise<string>} public URL
 */
export const uploadToR2 = async (key, body, contentType) => {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${R2_PUBLIC_URL}/${key}`;
};

/**
 * Delete an object from R2.
 * @param {string} key
 */
export const deleteFromR2 = async (key) => {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })
  );
};
