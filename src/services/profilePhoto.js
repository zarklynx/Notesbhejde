export async function resizeProfilePhoto(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>5*1024*1024)throw new Error('Choose a JPG, PNG or WebP smaller than 5 MB.')
  const bitmap=await createImageBitmap(file)
  try {
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128
    const ctx=canvas.getContext('2d'),side=Math.min(bitmap.width,bitmap.height)
    ctx.fillStyle='#fff';ctx.fillRect(0,0,128,128)
    ctx.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,128,128)
    for(const quality of [.8,.6,.4,.2]) {const photo=canvas.toDataURL('image/jpeg',quality);if(photo.length<=10000)return photo}
    throw new Error('Please choose a simpler photo.')
  } finally {bitmap.close()}
}
