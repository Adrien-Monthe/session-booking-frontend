import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { CartProvider } from "../contexts/CartContext"; // adjust the path as needed

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}

