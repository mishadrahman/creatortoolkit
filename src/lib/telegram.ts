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

  return new Promise((resolve, reject) => {
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
};

export const getTelegramFileUrl = async (fileId: string): Promise<string> => {
  // If it's already a URL or base64 (for backwards compatibility), return it directly
  if (fileId.startsWith("http") || fileId.startsWith("data:")) {
    return fileId;
  }

  const res = await fetch(`/api/telegram/file-url/${encodeURIComponent(fileId)}`);
  if (!res.ok) {
     const error = await res.json();
     throw new Error(error.error || "Failed to get file URL");
  }

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to get file URL");
  
  return data.url;
};
