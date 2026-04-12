// ─────────────────────────────────────────────────────────
// FileUploader.tsx — componente reutilizable de subida de archivos
// ─────────────────────────────────────────────────────────
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Upload, X, FileText, Film, Image, File, CheckCircle, Loader2 } from "lucide-react";
import { uploadFile, formatFileSize, ACCEPTED_TYPES, type UploadResult, type FileCategory } from "../services/storageService";
import { toast } from "sonner";

interface FileUploaderProps {
  category?: FileCategory | "all";
  onUpload: (result: UploadResult) => void;
  label?: string;
  hint?: string;
  maxSizeMB?: number;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <Image className="w-5 h-5 text-blue-500" />;
  if (type.startsWith("video/")) return <Film className="w-5 h-5 text-purple-500" />;
  if (type === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

export default function FileUploader({
  category = "all",
  onUpload,
  label = "Subir archivo",
  hint = "Arrastra aquí o haz clic para seleccionar",
  maxSizeMB = 100,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState<UploadResult | null>(null);
  const [dragging, setDragging] = useState(false);

  const accept = ACCEPTED_TYPES[category] || ACCEPTED_TYPES.all;

  const handleFile = async (file: File) => {
    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploaded(null);

    try {
      const result = await uploadFile(
        file,
        category === "all" ? undefined : category,
        setProgress
      );
      setUploaded(result);
      onUpload(result);
      toast.success("Archivo subido correctamente");
    } catch (err: any) {
      toast.error(err.message || "Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setUploaded(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}

      {!uploaded ? (
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragging ? "border-primary bg-blue-50" : "border-gray-300 hover:border-primary hover:bg-gray-50"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
              <p className="text-sm text-gray-600">Subiendo... {progress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm font-medium text-gray-700">{hint}</p>
              <p className="text-xs text-gray-500">Máximo {maxSizeMB}MB</p>
              {category === "images" && <p className="text-xs text-gray-400">JPG, PNG, WebP, GIF, SVG</p>}
              {category === "videos" && <p className="text-xs text-gray-400">MP4, WebM, OGG, AVI, MOV</p>}
              {category === "documents" && <p className="text-xs text-gray-400">PDF, Word, PowerPoint, Excel, TXT</p>}
              {category === "all" && <p className="text-xs text-gray-400">Imágenes, videos, documentos</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getFileIcon(uploaded.type)}
              <p className="text-sm font-medium text-gray-900 truncate">{uploaded.name}</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(uploaded.size)} · Subido correctamente</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClear}
            className="h-8 w-8 text-gray-500 hover:text-red-500 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
