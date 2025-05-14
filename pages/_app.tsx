import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
console.log('MONGODB_URI:', process.env.MONGODB_URI);

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
