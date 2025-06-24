// app/api/test-delete/route.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

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
    const testFileName = `test/delete-test-${Date.now()}.txt`;
    
    // Step 1: Upload a test file
    console.log('📤 Step 1: Creating test file...');
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: testFileName,
      Body: 'This file will be deleted in a moment...',
      ContentType: 'text/plain',
    });
    
    await r2Client.send(uploadCommand);
    console.log(`✅ Test file created: ${testFileName}`);

    // Step 2: Verify file exists
    console.log('🔍 Step 2: Verifying file exists...');
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: testFileName,
    });
    
    await r2Client.send(headCommand);
    console.log('✅ File exists and is accessible');

    // Step 3: Delete the file
    console.log('🗑️ Step 3: Deleting test file...');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: testFileName,
    });
    
    await r2Client.send(deleteCommand);
    console.log('✅ File deleted successfully');

    // Step 4: Verify file is gone
    console.log('🔍 Step 4: Verifying file is deleted...');
    try {
      await r2Client.send(headCommand);
      throw new Error('File still exists after deletion!');
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFound') {
        console.log('✅ File confirmed deleted');
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      message: '✅ Delete functionality test passed!',
      testFile: testFileName,
      steps: [
        '✅ Created test file',
        '✅ Verified file exists', 
        '✅ Deleted file',
        '✅ Verified file is gone'
      ]
    });

  } catch (error) {
    console.error('❌ Delete test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: '❌ Delete test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileName } = await request.json();
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName is required' },
        { status: 400 }
      );
    }

    // Test the delete endpoint logic
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
    });

    await r2Client.send(deleteCommand);

    return NextResponse.json({
      success: true,
      message: `✅ Successfully deleted: ${fileName}`,
    });

  } catch (error) {
    console.error('❌ Delete failed:', error);
    
    if (error instanceof Error && error.name === 'NoSuchKey') {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: false,
      message: '❌ Delete failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}