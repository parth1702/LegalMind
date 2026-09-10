import React, { useState } from 'react';
import { UploadContext } from './UploadContext';
import DocumentUploadModal from '../components/upload/DocumentUploadModal';

export function UploadProvider({ children }) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const openUploadModal = () => setIsUploadOpen(true);
  const closeUploadModal = () => setIsUploadOpen(false);

  return (
    <UploadContext.Provider value={{ isUploadOpen, openUploadModal, closeUploadModal }}>
      {children}
      <DocumentUploadModal isOpen={isUploadOpen} onClose={closeUploadModal} />
    </UploadContext.Provider>
  );
}
