import { Inter } from 'next/font/google';
import './globals.css';  // Keep it here only
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import { SonnerToaster } from "@/components/ui/sonner-toast"

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SharpForm Builder',
  description: 'Advanced form builder with Firebase integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        <SonnerToaster position="top-right" closeButton richColors />
      </body>
    </html>
  );
}
