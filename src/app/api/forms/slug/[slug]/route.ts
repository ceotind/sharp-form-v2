import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FORMS_COLLECTION } from '@/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Server-side only check
    if (typeof window !== 'undefined') {
      return NextResponse.json({ error: 'This API is only available server-side' }, { status: 400 });
    }
    
    console.log('Checking slug:', params.slug);
    
    // Ensure we have a valid slug
    if (!params.slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }
    
    // Use the FORMS_COLLECTION constant for consistency
    const formsRef = adminDb.collection(FORMS_COLLECTION);
    
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
      console.log('Found form with direct query:', { id: formDoc.id });
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