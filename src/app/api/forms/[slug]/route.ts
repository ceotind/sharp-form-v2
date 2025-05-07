import { NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const formsRef = collection(db, 'forms');
    const q = query(formsRef, where('customSlug', '==', params.slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const formDoc = querySnapshot.docs[0];
    return NextResponse.json({
      id: formDoc.id,
      ...formDoc.data()
    });
  } catch (error) {
    console.error('Error fetching form by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
} 