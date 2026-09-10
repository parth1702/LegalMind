import { useContext } from 'react';
import { UploadContext } from './UploadContext';

export function useUpload() {
  return useContext(UploadContext);
}
