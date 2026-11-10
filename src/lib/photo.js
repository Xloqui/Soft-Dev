// Shrinks an uploaded photo to a small JPEG data URL (max 360px wide).
// Resolves to '' when there is no usable photo.
export function readPhoto(file) {
  return new Promise(resolve => {
    if (!(file && file.size)) {
      resolve('');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const scale = Math.min(1, 360 / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = () => resolve('');
      img.src = reader.result;
    };

    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
