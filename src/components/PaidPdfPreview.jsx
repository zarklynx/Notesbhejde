import {useEffect,useRef,useState} from 'react'
import pdfUrl from '../assets/notes/mca-networks.pdf?url'
import softwarePdfUrl from '../assets/notes/mca-software-engineering-ocr.pdf?url'
import LoadingState from './LoadingState'

// Demo only: a public sample PDF, not a payment or entitlement boundary.
export default function PaidPdfPreview({ subject = 'networks' }) {
  const source=subject==='software'?softwarePdfUrl:pdfUrl
  const canvas=useRef(null)
  const [pages,setPages]=useState(0),[error,setError]=useState('')
  useEffect(()=>{
    let active=true,task,render
    async function load(){
      const {getDocument,GlobalWorkerOptions}=await import('pdfjs-dist')
      const {default:worker}=await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
      if(!active)return
      GlobalWorkerOptions.workerSrc=worker
      task=getDocument({url:source,isEvalSupported:false})
      const pdf=await task.promise
      if(!active)return
      const page=await pdf.getPage(1),viewport=page.getViewport({scale:1.2})
      if(!active)return
      canvas.current.width=viewport.width;canvas.current.height=viewport.height
      render=page.render({canvasContext:canvas.current.getContext('2d'),viewport})
      await render.promise
      if(active)setPages(pdf.numPages)
    }
    load().catch(e=>{if(active)setError(e.message)})
    return()=>{active=false;render?.cancel();if(task)void task.destroy()}
  },[source])
  return <div className="paid-preview">{!pages&&!error&&<LoadingState label="Preparing the free PDF preview" />}{error&&<p role="alert">Could not load the sample PDF. Please reopen the preview.</p>}<canvas ref={canvas} style={{width:'100%',height:'auto',display:pages?'block':'none',background:'white'}} role="img" aria-label="Free first page of the MCA computer networks sample PDF"/>{pages>0&&<div className="paid-lock"><small>FREE PREVIEW · PAGE 1 OF {pages}</small><h3>{pages>1?`Pages 2–${pages} are locked`:'Paid-note preview demo'}</h3><p>Continue studying with the complete revision pack.</p><button disabled>₹29 · Purchase unavailable</button><small>Demo only. No money is charged. This sample file is public; real paid PDFs require private storage and verified purchases.</small></div>}</div>
}
