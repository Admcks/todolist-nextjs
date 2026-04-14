import '../styles/globals.css';
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
      // This "Provider" makes session data available in all your notes and pages
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
  );
}