import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the path matches /forms/[slug]
  if (pathname.startsWith('/forms/') && pathname.split('/').length === 3) {
    const slug = pathname.split('/')[2];
    
    // Skip if it's a known path (edit, step, etc.)
    if (['edit', 'step'].includes(slug)) {
      return NextResponse.next();
    }

    // Check if it's a UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);

    // If it's not a UUID, try to resolve the custom slug
    if (!isUUID) {
      try {
        // Get the form from the forms collection by its custom slug
        const formRef = doc(db, 'form_slugs', slug);
        const slugDoc = await getDoc(formRef);

        if (slugDoc.exists()) {
          const { formId } = slugDoc.data();
          // Redirect to the form ID URL
          return NextResponse.redirect(new URL(`/forms/${formId}${request.nextUrl.search}`, request.url));
        }
      } catch (error) {
        console.error('Error checking custom slug:', error);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/forms/:path*',
};