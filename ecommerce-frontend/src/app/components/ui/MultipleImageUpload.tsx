import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, ArrowUp, ArrowDown } from 'lucide-react';

interface ImageItem {
  id: string;
  url?: string;
  file?: File;
  alt?: string;
}

interface MultipleImageUploadProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function MultipleImageUpload({ 
  images, 
  onChange, 
  maxImages = 5, 
  disabled = false 
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled || uploading) return;
    
    const newImages = acceptedFiles.map(file => ({
      id: `new-${Date.now()}-${Math.random()}`,
      file,
      alt: file.name
    }));

    const totalImages = images.length + newImages.length;
    if (totalImages > maxImages) {
      alert(`Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`);
      return;
    }

    onChange([...images, ...newImages]);
  }, [images, onChange, maxImages, disabled, uploading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    disabled: disabled || uploading || images.length >= maxImages
  });

  const removeImage = (id: string) => {
    onChange(images.filter(img => img.id !== id));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  const getImageUrl = (image: ImageItem) => {
    if (image.file) {
      return URL.createObjectURL(image.file);
    }
    return image.url;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Images ({images.length}/{maxImages})
        </label>
        {images.length > 0 && (
          <span className="text-xs text-gray-500">
            Use arrows to reorder • First image will be the main image
          </span>
        )}
      </div>

      {/* Existing Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={getImageUrl(image)}
                  alt={image.alt || 'Product image'}
                  className="w-full h-full object-cover"
                />
                
                {/* Main image indicator */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Reorder buttons */}
                <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    disabled={index === 0}
                    className="bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-opacity-70"
                    title="Move up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    disabled={index === images.length - 1}
                    className="bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-opacity-70"
                    title="Move down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Image number */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center">
            {isDragActive
              ? 'Drop images here...'
              : `Drag & drop images here, or click to select (${images.length}/${maxImages})`
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports JPG, PNG, GIF, WebP • Max 5MB per image
          </p>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Uploading images...</p>
        </div>
      )}
    </div>
  );
}
