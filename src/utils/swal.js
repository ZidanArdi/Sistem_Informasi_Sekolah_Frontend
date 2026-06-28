import Swal from 'sweetalert2';

export const swalAlert = {
  success: (title, text = '') => {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      confirmButtonColor: '#16a34a', // green-600
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-2.5 text-sm',
      }
    });
  },

  error: (title, text = '') => {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonColor: '#ef4444', // red-500
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-2.5 text-sm',
      }
    });
  },

  confirm: (title, text = '', confirmText = 'Ya, Lanjutkan', cancelText = 'Batal') => {
    return Swal.fire({
      icon: 'question',
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#16a34a', // green-600
      cancelButtonColor: '#6b7280', // gray-500
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl font-bold px-5 py-2.5 text-sm mr-2',
        cancelButton: 'rounded-xl font-bold px-5 py-2.5 text-sm',
      }
    });
  },

  toast: (icon, title) => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    return Toast.fire({
      icon: icon,
      title: title
    });
  }
};

export default swalAlert;
