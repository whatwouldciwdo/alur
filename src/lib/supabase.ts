import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";

// Only create client if credentials are provided
// This allows build to succeed, but will fail at runtime if upload is attempted without credentials
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null as any;

export const BUCKET_NAME = "evidensi";

// Whitelist allowed file types
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadEvidensi(
  file: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  // Check if Supabase is configured
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi. Silakan set SUPABASE_URL dan SUPABASE_SERVICE_KEY di .env");
  }

  // Validate file size
  if (file.length > MAX_FILE_SIZE) {
    throw new Error(`File terlalu besar. Maksimal 5MB (ukuran: ${(file.length / 1024 / 1024).toFixed(2)}MB)`);
  }

  // Validate mimetype
  if (!ALLOWED_MIMETYPES.includes(mimetype)) {
    throw new Error(`File type tidak diizinkan: ${mimetype}`);
  }

  // Validate and sanitize extension
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`File extension tidak diizinkan: ${ext}`);
  }

  // Sanitize filename to prevent path traversal
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `uploads/${uniqueName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Upload gagal: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}
