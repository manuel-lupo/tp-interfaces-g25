// /js/blocka/level.js
// Módulo para gestionar la carga de imágenes, el split en subimágenes y la aplicación de filtros.
// Exporta: loadImage, splitImageWithFilters, calculateGrid

export async function loadImage(url, maxWidth = 1280) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Escalado segun tamano maximo de pantalla
      if (maxWidth && img.width > maxWidth) {
        const scale = maxWidth/img.width;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const scaled = new Image();
        scaled.onload = () => resolve(scaled);
        scaled.onerror = reject;
        scaled.src = canvas.toDataURL();
      } else {
        resolve(img);
      }
    };
    img.onerror = (e) => reject(new Error('Error cargando imagen: ' + url));
    img.src = url;
  });
}

/**
 * calculateGrid
 * Dado numberOfPieces devuelve filas y columnas sugeridas.
 * Reglas simples: 4 -> 2x2, 6 -> 3x2, 8 -> 4x2
 */
export function calculateGrid(piecesCount) {
  if (piecesCount === 4) return { cols: 2, rows: 2 };
  if (piecesCount === 6) return { cols: 3, rows: 2 };
  if (piecesCount === 8) return { cols: 4, rows: 2 };
  const cols = Math.ceil(Math.sqrt(piecesCount));
  const rows = Math.ceil(piecesCount / cols);
  return { cols, rows };
}

/**
 * getCssFilterForPiece
 * mode: 'grayscale' | 'brightness' | 'invert' | 'none'
 */
export function getCssFilterForPiece(mode) {
  switch ((mode || '').toLowerCase()) {
    case 'grayscale': return 'grayscale(100%)';
    case 'brightness': return 'brightness(30%)'; // literal según el enunciado
    case 'invert': return 'invert(100%)';
    default: return 'none';
  }
}

/**
 * splitImageWithFilters
 * - imageUrl: fuente
 * - cols, rows
 * - filtersByPiece: array length cols*rows con strings css-filter (opcional)
 *
 * Devuelve array de objetos: { canvas, originalIndex, cssFilter (if fallback) }
 */
export async function splitImageWithFilters(imageUrl, cols, rows, filtersByPiece = null) {
  const img = await loadImage(imageUrl);
  const pieces = [];

  const totalW = img.width;
  const totalH = img.height;

  let y0 = 0;
  for (let r = 0; r < rows; r++) {
    const y1 = Math.round(((r + 1) * totalH) / rows);
    const pieceH = y1 - Math.round((r * totalH) / rows);
    let x0 = 0;

    for (let c = 0; c < cols; c++) {
      const x1 = Math.round(((c + 1) * totalW) / cols);
      const pieceW = x1 - Math.round((c * totalW) / cols);

      const canvas = document.createElement('canvas');
      canvas.width = pieceW;
      canvas.height = pieceH;
      const ctx = canvas.getContext('2d');

      const idx = r * cols + c;
      const cssFilter = (filtersByPiece && filtersByPiece[idx]) ? filtersByPiece[idx] : 'none';

      if (typeof ctx.filter !== 'undefined') {
        ctx.save();
        ctx.filter = cssFilter === 'none' ? 'none' : cssFilter;
        ctx.drawImage(img, x0, y0, pieceW, pieceH, 0, 0, pieceW, pieceH);
        ctx.restore();
        canvas.dataset.cssFilter = 'none';
      } else {
        ctx.drawImage(img, x0, y0, pieceW, pieceH, 0, 0, pieceW, pieceH);
        canvas.dataset.cssFilter = cssFilter;
      }

      pieces.push({ canvas, originalIndex: idx, cssFilter });
      x0 = x1;
    }

    y0 = y1;
  }

  return pieces;
}

