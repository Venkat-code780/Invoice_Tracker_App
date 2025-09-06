import { toast, ToastOptions } from "react-toastify";
 
export type ToastType = "success" | "error" | "info" | "warning";
 
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  // autoClose: false,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored"
};
 
export const showToast = (type: ToastType, message: string, options: ToastOptions = {}) => {
  const toastOptions = { ...defaultOptions, ...options };
 
  switch (type) {
    case "success":
      toast.success(message, toastOptions);
      break;
    case "error":
      toast.error(message, toastOptions);
      break;
    case "info":
      toast.info(message, toastOptions);
      break;
    case "warning":
      toast.warning(message, toastOptions);
      break;
    default:
      toast(message, toastOptions);
  }
};