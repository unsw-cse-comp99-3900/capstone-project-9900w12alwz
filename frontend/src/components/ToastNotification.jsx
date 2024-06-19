import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Toast } from 'primereact/toast';

const ToastNotification = forwardRef((props, ref) => {
  const toast = useRef(null);

  useImperativeHandle(ref, () => ({
    show: (severity, summary, detail) => {
      toast.current.show({ severity, summary, detail, life: 3000 });
    }
  }));

  return <Toast ref={toast}></Toast>;
});

export default ToastNotification;
