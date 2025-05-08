'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { doc, setDoc, serverTimestamp, collection, query, orderBy, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { FormField, Form } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { FormBuilder } from '@/components/form-elements/FormBuilder';
import { SortableField } from '@/components/form-elements/SortableField';
import { Save, Plus, BarChart2, Eye, Edit, Trash, Share2, Copy, Menu, X, ChevronRight, Link, Settings, FileText, CheckSquare, Calendar, ToggleRight, AtSign, Hash, Film, FileImage, Clock, MessageSquare, Users, CircleDot, ChevronDown, ToggleLeft, Image, Star, SlidersHorizontal, Phone, MapPin, FileUp, ListTodo, BookText, Scale, Paperclip, FileCheck } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { toast as toastUtils } from '@/components/ui/toast-utils';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import MaterialIcon from '@/components/ui/MaterialIcon';
// Import with dynamic import to resolve module issue
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid hydration issues
const FormBuilderLayout = dynamic(() => import('@/components/FormBuilderLayout'), { ssr: false });

// Import form elements to register them
import '@/components/form-elements/elements/TextInput';
import '@/components/form-elements/elements/TextareaInput';
import '@/components/form-elements/elements/SelectInput';
import '@/components/form-elements/elements/CheckboxInput';
import '@/components/form-elements/elements/RadioGroup';
import '@/components/form-elements/elements/DateInput';

// Your web app's Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to generate form share link
const generateShareLink = (formId: string) => {
  return `${window.location.origin}/forms/${formId}`;
};
