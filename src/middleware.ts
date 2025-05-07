import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log('Middleware processing path:', pathname);

  // Check if the path matches /forms/[slug]
  if (pathname.startsWith('/forms/') && pathname.split('/').length === 3) {
    const slug = pathname.split('/')[2];
    console.log('Checking slug:', slug);
    
    // Skip if it's a known path (edit, step, etc.)
    if (['edit', 'step'].includes(slug)) {
      console.log('Skipping known path:', slug);
      return NextResponse.next();
    }

    // Skip if it looks like a Firebase ID (they are typically 20 characters)
    if (slug.length === 20) {
      console.log('Skipping Firebase ID:', slug);
      return NextResponse.next();
    }

    try {
      // Check if the slug is a custom slug using the API route
      const apiUrl = `${request.nextUrl.origin}/api/forms/slug/${slug}`;
      console.log('Calling API:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        
        // If we found a form with this custom slug, redirect to the form ID URL
        const redirectUrl = new URL(`/forms/${data.id}`, request.url);
        console.log('Redirecting to:', redirectUrl.toString());
        
        return NextResponse.redirect(redirectUrl);
      } else {
        console.log('API returned error:', await response.text());
      }
    } catch (error) {
      console.error('Error checking custom slug:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/forms/:path*',
}; 