export function installLoadRecovery(target=window,storage,now=Date.now) {
  const recover=event=>{
    try {
      storage ||= target.sessionStorage
      const last=Number(storage.getItem('notesbhejde:load-recovery') || 0)
      if(now()-last<60000)return
      storage.setItem('notesbhejde:load-recovery',String(now()))
      event.preventDefault();target.location.reload()
    } catch { /* Error boundary offers a manual reload when storage is blocked. */ }
  }
  target.addEventListener('vite:preloadError',recover)
  return ()=>target.removeEventListener('vite:preloadError',recover)
}
