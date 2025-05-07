import './globals.css';
import { Inter } from 'next/font/google';
import { FormsSidebar } from '@/components/FormsSidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-bold text-gray-900">Sharp Form Builder</h1>
            </div>
          </header>
          <div className="flex flex-1">
            <FormsSidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
