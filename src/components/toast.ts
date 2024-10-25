import { toast } from "solid-sonner";

type ToastProps = {
  title?: string;
  description?: string;
  duration?: number;
};

export const toastService = {
  success: ({ title, description, duration = 3000 }: ToastProps) => {
    toast.success(title, {
      description,
      duration,
    });
  },

  error: ({ title, description, duration = 3000 }: ToastProps) => {
    toast.error(title, {
      description,
      duration,
    });
  },

  info: ({ title, description, duration = 3000 }: ToastProps) => {
    toast.info(title, {
      description,
      duration,
    });
  },

  warning: ({ title, description, duration = 3000 }: ToastProps) => {
    toast.warning(title, {
      description,
      duration,
    });
  },
};