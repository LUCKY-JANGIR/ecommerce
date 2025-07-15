import React, { useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';

interface DragAndDropImageProps {
  value?: File | null;
  previewUrl?: string;
  onChange: (file: File | null) => void;
  label?: string;
  disabled?: boolean;
}

export default function DragAndDropImage({ value, previewUrl, onChange, label, disabled }: DragAndDropImageProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      onChange(acceptedFiles[0]);
    }
  }, [onChange]);

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept: { 'image/*': [] }, // react-dropzone v14+ format
    multiple: false,
    disabled,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {},
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)} />
        {value || previewUrl ? (
          <img
            src={value ? URL.createObjectURL(value) : previewUrl}
            alt="Preview"
            className="w-24 h-24 object-cover rounded mb-2 border"
          />
        ) : (
          <span className="text-gray-400 text-sm">Drag & drop or click to select an image</span>
        )}
        {value && (
          <button
            type="button"
            className="mt-2 text-xs text-red-500 hover:underline"
            onClick={e => {
              e.stopPropagation();
              onChange(null);
            }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}