// app/api/test-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    // Test upload
    const testContent = `Test upload at ${new Date().toISOString()}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `test/test-${Date.now()}.txt`,
      Body: testContent,
      ContentType: 'text/plain',
    });

    await r2Client.send(command);

    return NextResponse.json({
      success: true,
      message: '✅ R2 upload test successful!',
      config: {
        bucket: process.env.R2_BUCKET_NAME,
        endpoint: process.env.R2_ENDPOINT,
        hasCredentials: !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY),
        publicUrl: process.env.R2_PUBLIC_URL,
      }
    });

  } catch (error) {
    console.error('❌ R2 test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: '❌ R2 upload test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        bucket: process.env.R2_BUCKET_NAME || 'NOT_SET',
        endpoint: process.env.R2_ENDPOINT || 'NOT_SET',
        hasCredentials: !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY),
        publicUrl: process.env.R2_PUBLIC_URL || 'NOT_SET',
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testMessage } = await request.json();
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `test/post-test-${Date.now()}.txt`,
      Body: testMessage || 'POST test upload',
      ContentType: 'text/plain',
    });

    await r2Client.send(command);

    return NextResponse.json({
      success: true,
      message: '✅ R2 POST test successful!',
    });

  } catch (error) {
    console.error('❌ R2 POST test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: '❌ R2 POST test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}