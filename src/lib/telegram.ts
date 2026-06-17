export const TELEGRAM_BOT_TOKEN = "1988624744:AAFUFeLE6soEn1B_jwQM1TaynP_fDmaNSz0";
export const TELEGRAM_CHAT_ID = "-1004308800425";

export const uploadToTelegram = async (file: File | Blob): Promise<string> => {
  const formData = new FormData();
  formData.append("photo", file);
  formData.append("chat_id", TELEGRAM_CHAT_ID);

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) {
     const error = await res.json();
     throw new Error(error.description || "Failed to upload to Telegram");
  }

  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Upload failed");
  
  // Get the highest resolution photo
  const photos = data.result.photo;
  const fileId = photos[photos.length - 1].file_id;
  return fileId;
};

export const getTelegramFileUrl = async (fileId: string): Promise<string> => {
  // If it's already a URL or base64 (for backwards compatibility), return it directly
  if (fileId.startsWith("http") || fileId.startsWith("data:")) {
    return fileId;
  }

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
  if (!res.ok) {
     const error = await res.json();
     throw new Error(error.description || "Failed to get file URL");
  }

  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Failed to get file URL");
  
  return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${data.result.file_path}`;
};
