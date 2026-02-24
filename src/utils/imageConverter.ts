/**
 * Converts an image File to WebP format using Canvas API.
 * Maintains quality while significantly reducing file size.
 * 
 * @param file - The original image file (PNG, JPG, etc.)
 * @param quality - WebP quality (0.0 to 1.0), default 0.85
 * @returns A new File in WebP format
 */
export const convertToWebP = (
  file: File,
  quality: number = 0.85
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // If already WebP, return as-is
    if (file.type === "image/webp") {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("WebP conversion failed"));
            return;
          }

          // Generate new filename with .webp extension
          const originalName = file.name.replace(/\.[^/.]+$/, "");
          const webpFile = new File([blob], `${originalName}.webp`, {
            type: "image/webp",
          });

          console.log(
            `🖼️ Image converted: ${file.name} (${(file.size / 1024).toFixed(1)}KB) → ${webpFile.name} (${(webpFile.size / 1024).toFixed(1)}KB) | ${Math.round((1 - webpFile.size / file.size) * 100)}% smaller`
          );

          resolve(webpFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for conversion"));
    };

    img.src = url;
  });
};

/**
 * Converts an image URL to a WebP data URL.
 * Useful for converting external image URLs.
 * 
 * @param imageUrl - The URL of the image to convert
 * @param quality - WebP quality (0.0 to 1.0), default 0.85
 * @returns A WebP data URL string
 */
export const convertUrlToWebP = (
  imageUrl: string,
  quality: number = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      const webpDataUrl = canvas.toDataURL("image/webp", quality);
      resolve(webpDataUrl);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image from URL"));
    };

    img.src = imageUrl;
  });
};
