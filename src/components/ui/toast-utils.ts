import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const toast = {
  success: (title: string, description?: string) => {
    sonnerToast.success(title, {
      description,
      className: 'bg-white border-green-500 border-l-4',
      duration: 4000,
    });
  },
  error: (title: string, description?: string) => {
    sonnerToast.error(title, {
      description,
      className: 'bg-white border-red-500 border-l-4',
      duration: 5000,
    });
  },
  info: (title: string, description?: string) => {
    sonnerToast.info(title, {
      description,
      className: 'bg-white border-[#0f51dd] border-l-4',
      duration: 4000,
    });
  },
  warning: (title: string, description?: string) => {
    sonnerToast.warning(title, {
      description,
      className: 'bg-white border-amber-500 border-l-4',
      duration: 4000,
    });
  },
};
