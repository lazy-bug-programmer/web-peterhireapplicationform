import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "GlobalHire",
  description: "GlobalHire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AuthProvider>{children}</AuthProvider>

        <Toaster />
      </body>
    </html>
  );
}
