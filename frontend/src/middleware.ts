import { geolocation } from '@vercel/functions';
import { type NextRequest, NextResponse } from 'next/server';

import { DEFAULT_LATITUDE } from '@/lib/constants';
import { DEFAULT_LONGITUDE } from '@/lib/constants';

export function middleware(request: NextRequest) {
  const geo = geolocation(request);

  const response = NextResponse.next();

  response.cookies.set(
    'geo',
    JSON.stringify({
      lat: geo.latitude ?? DEFAULT_LATITUDE,
      lon: geo.longitude ?? DEFAULT_LONGITUDE,
    }),
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
