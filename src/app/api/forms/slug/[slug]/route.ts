import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('Checking slug:', params.slug);
    
    const formsRef = adminDb.collection('forms');
    
    // Query for the specific slug
    const snapshot = await formsRef.where('settings.customSlug', '==', params.slug).get();
    console.log('Query result:', snapshot.empty ? 'No matches found' : 'Found match');

    if (snapshot.empty) {
      // If not found in settings.customSlug, try direct customSlug field
      const directSnapshot = await formsRef.where('customSlug', '==', params.slug).get();
      console.log('Direct query result:', directSnapshot.empty ? 'No matches found' : 'Found match');

      if (directSnapshot.empty) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 });
      }

      const formDoc = directSnapshot.docs[0];
      console.log('Found form with direct query:', { id: formDoc.id, data: formDoc.data() });
      return NextResponse.json({ id: formDoc.id });
    }

    const formDoc = snapshot.docs[0];
    console.log('Found form with settings query:', { id: formDoc.id, data: formDoc.data() });
    
    return NextResponse.json({ id: formDoc.id });
  } catch (error) {
    console.error('Error fetching form by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
} 