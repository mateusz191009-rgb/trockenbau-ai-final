import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing, type Locale } from "@/i18n/routing";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const LOCALES = new Set<string>(routing.locales);

// Seiten, die ohne Login erreichbar sein müssen.
const OEFFENTLICHE_PFADE = [
  "/",
  "/login",
  "/registrieren",
  "/passwort-vergessen",
  "/neues-passwort",
  "/auth",
  "/impressum",
  "/datenschutz",
  "/kontakt",
];

function parsePath(pathname: string): { locale: Locale; path: string } {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && LOCALES.has(segments[0])) {
    const locale = segments[0] as Locale;
    const rest = "/" + segments.slice(1).join("/");
    return { locale, path: rest === "/" ? "/" : rest };
  }
  return { locale: routing.defaultLocale, path: pathname };
}

function localizedPath(path: string, locale: Locale): string {
  if (locale === routing.defaultLocale) {
    return path;
  }
  return `/${locale}${path === "/" ? "" : path}`;
}

function istOeffentlich(path: string): boolean {
  return OEFFENTLICHE_PFADE.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

/**
 * Hält die Session frisch (Token-Refresh) und schützt Dashboard-Routen:
 * Nicht angemeldete Nutzer werden zur Login-Seite geleitet.
 */
export async function updateSession(
  request: NextRequest,
  response?: NextResponse,
) {
  let res = response ?? NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        res = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { locale, path } = parsePath(request.nextUrl.pathname);

  if (!user && !istOeffentlich(path)) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath("/login", locale);
    return NextResponse.redirect(url);
  }

  if (user && (path === "/login" || path === "/registrieren")) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath("/dashboard", locale);
    return NextResponse.redirect(url);
  }

  return res;
}
