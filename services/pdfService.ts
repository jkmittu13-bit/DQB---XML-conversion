
import { ExtractedData } from '../types';
import mammoth from 'mammoth';

declare const pdfjsLib: any;

if (typeof window !== 'undefined' && 'pdfjsLib' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export const extractFromPdf = async (file: File, extractImages: boolean): Promise<ExtractedData> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    
    // Extract text with better layout preservation
    const textContent = await page.getTextContent();
    let lastY: number | null = null;
    let pageText = '';
    
    for (const item of textContent.items as any[]) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
        pageText += '\n';
      }
      pageText += item.str + ' ';
      lastY = item.transform[5];
    }
    
    fullText += `--- PAGE ${i} START ---\n${pageText}\n--- PAGE ${i} END ---\n\n`;

    // Extract images
    if (extractImages) {
      const ops = await page.getOperatorList();
      for (let j = 0; j < ops.fnArray.length; j++) {
        if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject || ops.fnArray[j] === pdfjsLib.OPS.paintInlineImageXObject) {
          const imgName = ops.argsArray[j][0];
          try {
            const img = await page.objs.get(imgName);
            if (img && img.data) {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const imageData = ctx.createImageData(img.width, img.height);
                imageData.data.set(img.data);
                ctx.putImageData(imageData, 0, 0);
                images.push(canvas.toDataURL('image/png'));
              }
            }
          } catch (err) {
            console.warn(`Failed to extract image ${imgName}`, err);
          }
        }
      }
    }
  }

  return { text: fullText, images };
};

/**
 * Extracts text and images from a Word (.docx) file.
 */
export const extractFromDocx = async (file: File, extractImages: boolean): Promise<ExtractedData> => {
  const arrayBuffer = await file.arrayBuffer();
  const images: string[] = [];

  const options = extractImages ? {
    convertImage: mammoth.images.imgElement(function(image: any) {
      return image.read("base64").then(function(imageBuffer: any) {
        const dataUrl = `data:${image.contentType};base64,${imageBuffer}`;
        images.push(dataUrl);
        return { src: dataUrl };
      });
    })
  } : {};

  const textResult = await mammoth.extractRawText({ arrayBuffer });
  if (extractImages) {
    // We run convertToHtml just to trigger the image extraction callback
    await mammoth.convertToHtml({ arrayBuffer }, options);
  }

  return { 
    text: textResult.value, 
    images: Array.from(new Set(images)) // Deduplicate
  };
};

export const extractFromTxt = async (file: File): Promise<ExtractedData> => {
  const text = await file.text();
  return { text, images: [] };
};
