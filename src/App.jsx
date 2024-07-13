import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [prompt, setPrompt] = useState('');

  const takeScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: 'window' } });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      track.stop();
  
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
  
      canvas.toBlob((blob) => {
        setImageUrl(URL.createObjectURL(blob));
        setIsVisible(true);
      });
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <button id="screenshotButton" onClick={takeScreenshot}>Take Screenshot</button>
      {isVisible && (
        <div className='flex flex-col items-center justify-center'>
          <img
            id="screenshotImage"
            alt="Screenshot will appear here"
            className='mt-4 w-full'
            src={imageUrl}
          />
          <textarea name="prompt" id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
          <button id="submitPrompt">Ask Galadriel</button>
        </div>
      )}
    </div>
  )
}

export default App