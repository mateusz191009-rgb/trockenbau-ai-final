import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer wird als ESM ausgeliefert und muss von Next
  // transpiliert werden (sonst „ESM packages need to be imported“-Fehler).
  transpilePackages: ["@react-pdf/renderer"],
};

export default withNextIntl(nextConfig);
