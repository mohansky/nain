// utils/deleteImage.ts
export async function deleteImage(fileName: string): Promise<boolean> {
  try {
    const response = await fetch('/api/upload/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}