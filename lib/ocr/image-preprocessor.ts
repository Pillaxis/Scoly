import { ImageQualityDiagnosis } from "@/types/import";

/**
 * Analyse la qualité d'une photo (luminosité, contraste, netteté) pour guider l'utilisateur
 */
export async function diagnoseImageQuality(imageSource: File | Blob | HTMLImageElement | string): Promise<ImageQualityDiagnosis> {
  let img: HTMLImageElement;

  if (typeof imageSource === "string") {
    img = await loadImageFromUrl(imageSource);
  } else if (imageSource instanceof HTMLImageElement) {
    img = imageSource;
  } else {
    const url = URL.createObjectURL(imageSource);
    img = await loadImageFromUrl(url);
    URL.revokeObjectURL(url);
  }

  // Créer un canvas redimensionné pour une analyse rapide et performante
  const sampleWidth = Math.min(img.width || 800, 400);
  const sampleHeight = Math.floor((img.height / (img.width || 1)) * sampleWidth) || 300;

  const canvas = document.createElement("canvas");
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    return {
      isAcceptable: true,
      brightnessScore: 75,
      contrastScore: 75,
      sharpnessScore: 75,
      issues: [],
      recommendations: ["Placez le cahier bien à plat avec un éclairage uniforme."],
    };
  }

  ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
  const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
  const data = imageData.data;

  let totalLuminance = 0;
  const luminances: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Standard relative luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLuminance += lum;
    luminances.push(lum);
  }

  const pixelCount = luminances.length;
  const avgLuminance = totalLuminance / (pixelCount || 1);

  // Variance pour le contraste
  let varianceSum = 0;
  for (let i = 0; i < pixelCount; i++) {
    varianceSum += Math.pow(luminances[i] - avgLuminance, 2);
  }
  const stdDevLuminance = Math.sqrt(varianceSum / (pixelCount || 1));

  // Score de netteté (estimation par gradient horizontal et vertical)
  let edgeGradientSum = 0;
  for (let y = 1; y < sampleHeight - 1; y += 2) {
    for (let x = 1; x < sampleWidth - 1; x += 2) {
      const idx = (y * sampleWidth + x) * 4;
      const idxRight = (y * sampleWidth + (x + 1)) * 4;
      const idxDown = ((y + 1) * sampleWidth + x) * 4;

      const diffX = Math.abs(data[idx] - data[idxRight]);
      const diffY = Math.abs(data[idx] - data[idxDown]);
      edgeGradientSum += diffX + diffY;
    }
  }
  const avgGradient = edgeGradientSum / ((sampleWidth * sampleHeight) / 4);

  // Normalisation des scores (0 - 100)
  const brightnessScore = Math.min(100, Math.max(0, Math.round((avgLuminance / 255) * 100)));
  const contrastScore = Math.min(100, Math.max(0, Math.round((stdDevLuminance / 128) * 100)));
  const sharpnessScore = Math.min(100, Math.max(0, Math.round((avgGradient / 30) * 100)));

  const issues: ImageQualityDiagnosis["issues"] = [];
  const recommendations: string[] = [];

  if (brightnessScore < 30) {
    issues.push("too_dark");
    recommendations.push("La photo est trop sombre. Allumez la lumière ou rapprochez-vous d'une fenêtre.");
  } else if (brightnessScore > 90) {
    issues.push("too_bright");
    recommendations.push("La photo est surexposée avec trop de reflets blancs.");
  }

  if (contrastScore < 25) {
    issues.push("low_contrast");
    recommendations.push("Le contraste entre l'encre et le papier est faible. Évitez les crayons très pâles.");
  }

  if (sharpnessScore < 20) {
    issues.push("blurry");
    recommendations.push("L'image semble floue. Tenez fermement votre smartphone et refaites la mise au point.");
  }

  const isAcceptable = issues.length === 0 || (issues.length === 1 && issues[0] === "low_contrast");

  if (isAcceptable && recommendations.length === 0) {
    recommendations.push("Qualité de photo satisfaisante pour la lecture optique.");
  }

  return {
    isAcceptable,
    brightnessScore,
    contrastScore,
    sharpnessScore,
    issues,
    recommendations,
  };
}

/**
 * Optimise une image pour la reconnaissance OCR (conversion niveaux de gris et étirement de contraste)
 */
export async function preprocessImageForOcr(
  imageSource: File | Blob | string,
  rotationAngle: number = 0
): Promise<{ processedBlob: Blob; previewUrl: string }> {
  let img: HTMLImageElement;

  if (typeof imageSource === "string") {
    img = await loadImageFromUrl(imageSource);
  } else {
    const url = URL.createObjectURL(imageSource);
    img = await loadImageFromUrl(url);
    URL.revokeObjectURL(url);
  }

  const canvas = document.createElement("canvas");
  const isRotated90or270 = rotationAngle === 90 || rotationAngle === 270;

  canvas.width = isRotated90or270 ? img.height : img.width;
  canvas.height = isRotated90or270 ? img.width : img.height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Impossible d'initialiser le contexte graphique pour le traitement d'image.");
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotationAngle * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();

  // Filtrage niveaux de gris & contraste renforcé
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Contraste doux en S
    gray = (gray - 128) * 1.25 + 128;
    gray = Math.max(0, Math.min(255, gray));

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Échec de la génération du blob de l'image optimisée."));
          return;
        }
        const previewUrl = URL.createObjectURL(blob);
        resolve({ processedBlob: blob, previewUrl });
      },
      "image/jpeg",
      0.92
    );
  });
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Impossible de charger l'image source pour l'analyse."));
    img.src = url;
  });
}
