// ─────────────────────────────────────────────────────────
// storageService.ts — subida de archivos a Supabase Storage
// ─────────────────────────────────────────────────────────

const SUPABASE_URL = "https://ziiuixtsttufkhtlkhhx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppaXVpeHRzdHR1ZmtodGxraGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzY5MzQsImV4cCI6MjA5MTQxMjkzNH0.c7uRBep3SxR8lzpWmo5cDhpyTfGwjF_5mkm8OcUEeu4";
const BUCKET = "alumco-files";

export type FileCategory = "images" | "videos" | "documents" | "resources";

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

// Determina la carpeta según el tipo de archivo
function getCategory(file: File): FileCategory {
  if (file.type.startsWith("image/")) return "images";
  if (file.type.startsWith("video/")) return "videos";
  return "documents";
}

// Sube un archivo a Supabase Storage
export async function uploadFile(
  file: File,
  category?: FileCategory,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  const folder = category || getCategory(file);
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${folder}/${fileName}`;

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;

  // Usar XMLHttpRequest para poder reportar progreso
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      console.log("Storage response:", xhr.status, xhr.responseText);
      if (xhr.status === 200 || xhr.status === 201) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
        resolve({
          url: publicUrl,
          path,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error || err.message || `Error ${xhr.status} al subir`));
        } catch {
          reject(new Error(`Error ${xhr.status}: ${xhr.responseText}`));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Error de red al subir el archivo")));
    xhr.addEventListener("abort", () => reject(new Error("Subida cancelada")));

    xhr.open("PUT", url);
    xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "true");
    xhr.send(file);
  });
}

// Elimina un archivo del Storage
export async function deleteFile(path: string): Promise<void> {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error("Error al eliminar el archivo");
}

// Formatea el tamaño del archivo
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// Tipos aceptados por categoría
export const ACCEPTED_TYPES = {
  images:    "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  videos:    "video/mp4,video/webm,video/ogg,video/avi,video/mov",
  documents: "application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt",
  all:       "image/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt",
};
