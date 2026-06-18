const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const uploadToTelegram = async (file: File | Blob, onProgress?: (percent: number) => void): Promise<string> => {
  const base64Image = await blobToBase64(file);
  const name = "name" in file ? (file as any).name : "photo.webp";

  // Attempt using the Node/Express server proxy first
  try {
    return await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/telegram/upload");
      xhr.setRequestHeader("Content-Type", "application/json");

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && data.ok) {
            resolve(data.fileId);
          } else {
            reject(new Error(data.error || "Upload failed"));
          }
        } catch (e) {
          reject(new Error("Invalid response from server"));
        }
      };

      xhr.onerror = () => reject(new Error("Network Error occurred during upload"));
      xhr.send(JSON.stringify({ image: base64Image, name }));
    });
  } catch (backendError: any) {
    console.warn("Backend server proxy failed or is not available. Falling back to direct client-side Telegram API upload...", backendError);
    
    // Client-side fallback (works perfectly on static platforms like GitHub Pages, Vercel, Hostinger static, etc.)
    const botToken = "1988624744:AAFUFeLE6soEn1B_jwQM1TaynP_fDmaNSz0";
    const chatId = "-1004308800425";

    const formData = new FormData();
    formData.append("photo", file, name);
    formData.append("chat_id", chatId);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.description || "Direct Telegram upload failed");
    }

    const data = await response.json();
    if (data.ok) {
      const photos = data.result.photo;
      return photos[photos.length - 1].file_id;
    } else {
      throw new Error(data.description || "Direct Telegram upload failed");
    }
  }
};

export const getTelegramFileUrl = async (fileId: string): Promise<string> => {
  // If it's already a URL or base64, return it directly
  if (fileId.startsWith("http") || fileId.startsWith("data:")) {
    return fileId;
  }

  // Attempt using the Node/Express server proxy first
  try {
     const res = await fetch(`/api/telegram/file-url/${encodeURIComponent(fileId)}`);
     if (res.ok) {
        const data = await res.json();
        if (data.ok && data.url) {
           return data.url;
        }
     }
  } catch (err) {
     console.warn("Server file-url proxy failed, falling back to direct client-side Telegram retrieval...", err);
  }

  // Client-side fallback if backend is absent
  const botToken = "1988624744:AAFUFeLE6soEn1B_jwQM1TaynP_fDmaNSz0";
  const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
  if (!telegramRes.ok) {
     throw new Error("Failed to get file from Telegram (client fallback)");
  }
  const data = await telegramRes.json();
  if (!data.ok) throw new Error("Failed to resolve file path");
  return `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
};
