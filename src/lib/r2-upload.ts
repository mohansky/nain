// lib/r2-upload.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(
  file: File, 
  folder: string = 'children',
  userId?: string
): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    // Create organized path: folder/userId/timestamp-random.ext
    const fileName = userId 
      ? `${folder}/${userId}/${timestamp}-${randomString}.${extension}`
      : `${folder}/${timestamp}-${randomString}.${extension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      // Metadata for tracking
      Metadata: {
        originalName: file.name,
        uploadedBy: userId || 'anonymous',
        uploadedAt: new Date().toISOString(),
      },
    });

    await r2Client.send(command);

    // Return public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error('Failed to upload file to R2');
  }
}

/**
 * Delete a file from R2 by URL
 */
export async function deleteFromR2(fileUrl: string): Promise<boolean> {
  try {
    // Extract the file key from the URL
    const urlParts = fileUrl.split('/');
    const baseUrlParts = process.env.R2_PUBLIC_URL!.split('/');
    const keyStartIndex = baseUrlParts.length - 1;
    const fileKey = urlParts.slice(keyStartIndex).join('/');

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileKey,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('R2 delete error:', error);
    return false;
  }
}

/**
 * Validate file for upload
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Please upload JPEG, PNG, or WebP images only.' 
    };
  }

  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'File too large. Please upload files smaller than 5MB.' 
    };
  }

  return { isValid: true };
}