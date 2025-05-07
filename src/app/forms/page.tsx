'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, ArrowRight, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Form = {
  id: string;
  title: string;
  description: string;
  createdAt: any;
  updatedAt: any;
};

export default function FormsDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const formsRef = collection(db, 'forms');
        const q = query(formsRef);
        const querySnapshot = await getDocs(q);
        
        const formsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Form[];
        
        setForms(formsData);
      } catch (error) {
        console.error('Error fetching forms:', error);
        toast({
          title: 'Error',
          description: 'Failed to load forms. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [toast]);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title.trim()) return;

    try {
      setIsCreating(true);
      const formRef = await addDoc(collection(db, 'forms'), {
        title: newForm.title,
        description: newForm.description,
        fields: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push(`/forms/${formRef.id}/edit`);
    } catch (error) {
      console.error('Error creating form:', error);
      toast({
        title: 'Error',
        description: 'Failed to create form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Forms</h1>
          <p className="text-gray-500 mt-1">Create and manage your forms</p>
        </div>
        <Button onClick={() => setNewForm({ title: '', description: '' })}>
          <Plus className="mr-2 h-4 w-4" />
          New Form
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {newForm.title !== undefined && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Form</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreateForm}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Form Title</label>
                <Input
                  placeholder="Enter form title"
                  value={newForm.title}
                  onChange={(e) =>
                    setNewForm({ ...newForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <Input
                  placeholder="Enter form description"
                  value={newForm.description}
                  onChange={(e) =>
                    setNewForm({ ...newForm, description: e.target.value })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewForm({ title: '', description: '' })}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Form'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {filteredForms.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No forms yet</h3>
          <p className="mt-1 text-gray-500">
            Get started by creating a new form.
          </p>
          <Button
            className="mt-4"
            onClick={() => setNewForm({ title: '', description: '' })}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Form
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <Card
              key={form.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => router.push(`/forms/${form.id}/edit`)}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                  {form.title}
                </CardTitle>
                {form.description && (
                  <CardDescription className="line-clamp-2">
                    {form.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardFooter className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  {form.updatedAt?.toDate
                    ? `Updated ${form.updatedAt.toDate().toLocaleDateString()}`
                    : 'No update date'}
                </span>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  Edit <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
