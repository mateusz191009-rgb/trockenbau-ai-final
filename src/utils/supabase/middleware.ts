import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Seiten, die ohne Login erreichbar sein müssen.
const OEFFENTLICHE_PFADE = [
  "/login",
  "/registrieren",
  "/passwort-vergessen",
  "/neues-passwort",
  "/auth",
];

function istOeffentlich(pathname: string): boolean {
  return OEFFENTLICHE_PFADE.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Hält die Session frisch (Token-Refresh) und schützt alle Routen:
 * Nicht angemeldete Nutzer werden zur Login-Seite geleitet.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // WICHTIG: getUser() aktualisiert die Session/Cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Nicht angemeldet + geschützte Seite -> zum Login.
  if (!user && !istOeffentlich(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Angemeldet + Login/Registrierung -> zur Startseite.
  if (user && (pathname === "/login" || pathname === "/registrieren")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
