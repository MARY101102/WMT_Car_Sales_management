import Toast from 'react-native-toast-message';

export const showToast = (type, message, title) => {
  Toast.show({
    type,
    text1: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'),
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
  });
  console.log(`[Toast] ${type}: ${message}`);
};

export const showSuccess = (message, title) => showToast('success', message, title);
export const showError   = (message, title) => showToast('error',   message, title);
export const showInfo    = (message, title) => showToast('info',    message, title);
