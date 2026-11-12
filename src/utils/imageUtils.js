/**
 * Recipe photos are stored as data URLs in localStorage, which only holds a few MB in total.
 * Uploaded photos are therefore downscaled and re-encoded as JPEG before being stored.
 */
const TARGET_DATA_URL_LENGTH = 350_000
const MAX_DIMENSIONS = [1200, 1000, 800, 640]
const QUALITIES = [0.82, 0.7, 0.6]

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('This image could not be read. Please choose a different JPG or PNG file.'))
    }
    img.src = objectUrl
  })
}

function renderToJpeg(img, maxDimension, quality) {
  const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.max(1, Math.round(img.naturalWidth * scale))
  const height = Math.max(1, Math.round(img.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  // JPEG has no transparency: paint white first so transparent PNG areas do not turn black
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * Convert an uploaded image file into a compact JPEG data URL suitable for localStorage.
 * Steps down through sizes and qualities until the result is small enough.
 */
export async function compressImageFile(file) {
  const img = await loadImageFromFile(file)
  if (!img.naturalWidth || !img.naturalHeight) {
    throw new Error('This image could not be read. Please choose a different JPG or PNG file.')
  }

  let smallest = ''
  for (const maxDimension of MAX_DIMENSIONS) {
    for (const quality of QUALITIES) {
      const dataUrl = renderToJpeg(img, maxDimension, quality)
      if (dataUrl.length <= TARGET_DATA_URL_LENGTH) return dataUrl
      if (!smallest || dataUrl.length < smallest.length) smallest = dataUrl
    }
  }
  return smallest
}
