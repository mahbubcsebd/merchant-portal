
import { Image as ImageIcon, X, Upload, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getDocumentContent } from "@/lib/api/endpoints";

export default function GlobalUpload({
  label,
  value,
  previewUrl,
  onChange,
  disabled = false,
  accept = "image/*",
  maxSize = 5242880, // 5MB
  className = "",
  containerClassName = "",
  labelClassName = "",
  onFileSelect,
  isLoading = false,
}) {
  const [preview, setPreview] = useState(null);
  const [fetchingDoc, setFetchingDoc] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Set initial preview if previewUrl is passed, or value is a data URL / File object, or fetch via getDocumentContent if value is an image ID
  useEffect(() => {
    if (previewUrl) {
      setPreview(previewUrl);
      return;
    }

    if (!value) {
      setPreview(null);
      return;
    }

    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    if (typeof value === "string") {
      if (value.startsWith("data:") || value.startsWith("http") || value.startsWith("blob:") || value.startsWith("/")) {
        setPreview(value);
      } else {
        // value is an image ID like IMGIDNUM
        let isMounted = true;
        setFetchingDoc(true);
        getDocumentContent({ imgId: value })
          .then((res) => {
            if (isMounted) {
              const imgData = res?.data || "";
              if (typeof imgData === "string" && imgData) {
                setPreview(imgData.startsWith("data:") ? imgData : `data:image/jpeg;base64,${imgData}`);
              } else {
                setPreview(null);
              }
            }
          })
          .catch(() => {
            if (isMounted) setPreview(null);
          })
          .finally(() => {
            if (isMounted) setFetchingDoc(false);
          });

        return () => {
          isMounted = false;
        };
      }
    }
  }, [value, previewUrl]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Simple validation for accept format
      if (accept.includes('image') && !file.type.startsWith('image/')) {
        return;
      }
      processFile(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setPreview(base64);
      if (onChange) {
        onChange(base64, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const onButtonClick = () => {
    if (disabled) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onChange) {
      onChange(null, null);
    }
  };

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', containerClassName, className)}>
      {/* Label */}
      {label && (
        <label className={cn('text-xs font-semibold text-slate-700 dark:text-white/70', labelClassName)}>
          {label}
        </label>
      )}

      {/* Dropzone Container */}
      <div
        onClick={onButtonClick}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-150 overflow-hidden select-none',
          isDragActive
            ? 'border-[#2563eb] dark:border-blue-500 bg-blue-50/10 dark:bg-blue-500/5'
            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5',
          disabled
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />

        {isLoading || fetchingDoc ? (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <Loader2 className="animate-spin text-[#2563eb] w-8 h-8 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-white/70">
              Loading Image...
            </p>
          </div>
        ) : preview ? (
          /* Preview State */
          <div className="absolute inset-0 w-full h-full group flex items-center justify-center bg-slate-100 dark:bg-slate-900/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-full object-contain"
            />
            
            {/* Overlay Controls */}
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform hover:scale-105"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
                <div className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/20 pointer-events-none">
                  Click or drag to replace
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Upload Prompt State */
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-lg border border-slate-300 dark:border-white/20 flex items-center justify-center text-[#2563eb] dark:text-blue-400 bg-white dark:bg-[#131c31] mb-3 shadow-sm">
              <Upload size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-[#2563eb]" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-white/70">
              Drag & Drop to Upload
            </p>
            <p className="text-[10px] text-slate-400 dark:text-white/40 mt-1">
              Supports JPEG, PNG, WEBP (Max 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
