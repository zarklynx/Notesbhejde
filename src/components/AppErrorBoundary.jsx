import {Component} from 'react'

export default class AppErrorBoundary extends Component {
  state={error:null}
  static getDerivedStateFromError(error) {return {error}}
  componentDidCatch(error) {console.error('NotesBhejde screen failed:',error)}
  render() {
    if(!this.state.error)return this.props.children
    return <section role="alert" style={{maxWidth:460,margin:'40px auto',padding:24,borderRadius:16,background:'white',color:'#193f2d',fontFamily:'Segoe UI, sans-serif'}}><h2>This screen couldn’t load</h2><p style={{margin:'14px 0',lineHeight:1.6}}>A newer app version or a connection problem may have interrupted loading. Refresh to try again. Your saved notes and account won’t be deleted.</p><button onClick={()=>window.location.reload()} style={{padding:'10px 18px',background:'#117a5a',color:'white',borderRadius:8}}>Refresh app</button>{this.props.onClose && <button onClick={this.props.onClose} style={{padding:'10px 18px',marginLeft:8}}>Back to notes</button>}</section>
  }
}
