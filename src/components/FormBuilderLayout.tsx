'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, LayoutTemplate, Settings } from 'lucide-react';

interface FormBuilderLayoutProps {
  children: ReactNode;
  className?: string;
  showSidebar?: boolean;
  forms?: any[];
  onEditForm?: (formId: string) => void;
  onDeleteForm?: (formId: string) => void;
}

const FormBuilderLayout = ({ 
  children, 
  className,
  showSidebar = true,
  forms = [],
  onEditForm,
  onDeleteForm
}: FormBuilderLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/forms" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">Sharp Forms</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/forms">
                My Forms
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/forms/new">
                Create New
              </Link>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {showSidebar && (
          <aside className="w-64 border-r bg-white p-4 overflow-y-auto h-[calc(100vh-73px)]">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Your Forms</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/">
                    <Plus className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-1">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between group p-2 rounded-md hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {form.title || 'Untitled Form'}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEditForm?.(form.id);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDeleteForm?.(form.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <nav className="space-y-1 border-t pt-4">
              <Link href="/templates" className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
                <LayoutTemplate className="mr-3 h-5 w-5 text-gray-400" />
                Templates
              </Link>
              <Link href="/settings" className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
                <Settings className="mr-3 h-5 w-5 text-gray-400" />
                Settings
              </Link>
            </nav>
          </aside>
        )}
        
        <main className={cn("flex-1 p-8", className)}>
          {children}
        </main>
      </div>
      
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sharp Forms. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default FormBuilderLayout;