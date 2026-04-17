import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques — toujours accessibles
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Vérifier le token dans les cookies (zustand persist le stocke dans localStorage
  // mais on peut aussi le passer en cookie httpOnly pour plus de sécurité)
  // Pour l'instant on laisse le client gérer la redirection via useAuthStore
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
