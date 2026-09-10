import { createContext } from 'react';

export const UploadContext = createContext({
  isUploadOpen: false,
  openUploadModal: () => {},
  closeUploadModal: () => {},
});
