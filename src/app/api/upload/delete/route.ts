// app/api/upload/delete/route.ts
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

// Initialize R2 client (this was missing!)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(request: NextRequest) {
  try {
    const { fileName } = await request.json();

    // Validate fileName
    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        { error: 'fileName is required and must be a string' },
        { status: 400 }
      );
    }

    // Security check: ensure fileName doesn't contain path traversal
    if (fileName.includes('..') || fileName.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid fileName' },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
    });

    await r2Client.send(command);

    return NextResponse.json({ 
      success: true,
      message: `File ${fileName} deleted successfully`
    });

  } catch (error) {
    console.error('Delete error:', error);
    
    // Handle specific S3/R2 errors
    if (error instanceof Error) {
      if (error.name === 'NoSuchKey') {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      
      if (error.name === 'AccessDenied') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Delete failed. Please try again.' },
      { status: 500 }
    );
  }
}