'use client';

import { ReactNode } from 'react';
import { FormsSidebar } from './FormsSidebar';

interface FormBuilderLayoutProps {
  children: ReactNode;
}

export default function FormBuilderLayout({ children }: FormBuilderLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Fixed width sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200">
        <FormsSidebar />
      </aside>

      {/* Main content - pushed to the right by sidebar width */}
      <div className="flex-1 ml-72">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}