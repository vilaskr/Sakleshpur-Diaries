import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Loader2, X, Check, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export interface MediaAsset {
  url: string;
  public_id: string;
}

interface ImageUploadProps {
  onImagesChange: (assets: MediaAsset[]) => void;
  images: MediaAsset[];
  folder: string;
  maxFiles?: number;
}

export default function ImageUpload({ onImagesChange, images = [], folder, maxFiles = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [localPreviews, setLocalPreviews] = useState<{ id: string; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper for Cloudinary Optimization
  const getOptimizedUrl = (url: string) => {
    if (!url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/f_auto,q_auto,w_800,c_limit/');
  };

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    
    // Filter out non-images and oversized files first
    const validFiles = fileList.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 2MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Check total limit
    if (images.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary config missing');
      return;
    }

    setUploading(true);
    
    // Create local previews for all valid files
    const filePreviews = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file
    }));

    setLocalPreviews(prev => [...prev, ...filePreviews.map(p => ({ id: p.id, url: p.url }))]);

    const newAssets: MediaAsset[] = [...images];
    
    for (const previewItem of filePreviews) {
      const { file, id, url } = previewItem;
      const toastId = toast.loading(`Uploading ${file.name}...`);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', `sakleshpur-diaries/${folder}`);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        const asset = {
          url: data.secure_url,
          public_id: data.public_id
        };
        
        newAssets.push(asset);
        onImagesChange([...newAssets]); // Update immediately after each success

        toast.success(`Uploaded ${file.name}`, { id: toastId });
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`, { id: toastId });
      } finally {
        // Cleanup local preview
        setLocalPreviews(prev => prev.filter(p => p.id !== id));
        URL.revokeObjectURL(url);
      }
    }

    setUploading(false);
  }, [folder, images, maxFiles, onImagesChange]);

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleUpload(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Label and Info */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <label className="text-xs font-black text-brand-ink/60 uppercase tracking-[0.2em] flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Media Gallery
          </label>
          <p className="text-[10px] text-gray-400 font-medium">Add up to {maxFiles} high-quality images (Max 2MB each)</p>
        </div>
        <div className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-lg text-gray-500 uppercase tracking-widest">
          {images.length} / {maxFiles}
        </div>
      </div>

      {/* Preview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {images.map((asset, index) => (
            <motion.div 
              key={asset.public_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-square rounded-2xl overflow-hidden group shadow-md border border-gray-100"
            >
              <img 
                src={getOptimizedUrl(asset.url)} 
                alt="Preview" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#111827]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black text-brand-ink uppercase tracking-tighter">
                #{index + 1}
              </div>
            </motion.div>
          ))}

          {/* Local Previews (Uploading) */}
          {localPreviews.map((preview) => (
            <motion.div 
              key={preview.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-square rounded-2xl overflow-hidden shadow-md border border-brand-green/30"
            >
              <img 
                src={preview.url} 
                alt="Uploading..." 
                className="w-full h-full object-cover grayscale blur-[2px] opacity-50"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand-green/5">
                <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-green">Syncing</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Upload Trigger */}
        {images.length < maxFiles && (
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`
              relative aspect-square rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer
              flex flex-col items-center justify-center gap-3 group
              ${dragActive ? 'border-brand-green bg-brand-green/5' : 'border-gray-200 hover:border-brand-green bg-gray-50/50 hover:bg-white'}
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={onFileChange}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-green animate-pulse">Syncing...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-brand-green" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add Image</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
