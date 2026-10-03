import Dashboard from './dashboard'
import MasterjiPreview from './components/masterji/MasterjiPreview'
import MasterjiMotionPreview from './components/masterji/MasterjiMotionPreview'


function App() {
  if (new URLSearchParams(window.location.search).has('masterji-preview')) {
    return new URLSearchParams(window.location.search).has('gallery') ? <MasterjiPreview /> : <MasterjiMotionPreview />
  }

  return (
    <>
     <Dashboard/>
    </>
  )
}

export default App
