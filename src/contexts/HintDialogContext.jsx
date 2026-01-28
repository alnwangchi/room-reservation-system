import HintDialog from '@components/HintDialog';
import { createContext, useContext, useState } from 'react';

const HintDialogContext = createContext();

export const useHintDialog = () => {
  const context = useContext(HintDialogContext);
  if (!context) {
    throw new Error('useHintDialog must be used within a HintDialogProvider');
  }
  return context;
};

export const HintDialogProvider = ({ children }) => {
  const [hintDialog, setHintDialog] = useState({
    isOpen: false,
    title: '',
    desc: '',
    type: '',
    onOk: null,
    onCancel: null,
  });

  const toggleHintDialog = ({
    title = '',
    desc = '',
    type,
    onOk = null,
    onCancel = null,
  } = {}) => {
    setHintDialog({
      isOpen: true,
      title,
      desc,
      type,
      onOk,
      onCancel,
    });
  };

  const closeHintDialog = () => {
    setHintDialog(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  const handleOk = () => {
    if (hintDialog.onOk) {
      hintDialog.onOk();
    }
    closeHintDialog();
  };

  const handleCancel = () => {
    if (hintDialog.onCancel) {
      hintDialog.onCancel();
    }
    closeHintDialog();
  };

  return (
    <HintDialogContext.Provider value={{ toggleHintDialog, closeHintDialog }}>
      {children}
      <HintDialog
        isOpen={hintDialog.isOpen}
        onClose={closeHintDialog}
        title={hintDialog.title}
        desc={hintDialog.desc}
        type={hintDialog.type}
        onOk={handleOk}
        onCancel={handleCancel}
        showCancel={!!hintDialog.onCancel}
      />
    </HintDialogContext.Provider>
  );
};
