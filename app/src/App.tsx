import { useState } from 'react'
import useChatHook from "./Components/Chat/useChatHook";
import viteLogo from '/vite.svg'
import './App.css'
import ChatSingleRequest from './Components/Chat/ChatSingleRequest';

function App() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('do a technical analysis');
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);
  const chatProvider = useChatHook();

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
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setIsVisible(true);
      });
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  }

  const uploadScreenshotToIpfs = async () => {
    if (!imageUrl) {
      console.error('No image URL to upload');
      return;
    }

    try {
      // Fetch the image data from the blob URL
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create FormData and append the Blob as if it were a file
      const formData = new FormData();
      formData.append("file", blob, "filename.json"); // Add a filename

      // Optional: Add metadata and options as before
      const metadata = JSON.stringify({
        name: "File name",
      });
      formData.append("pinataMetadata", metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);

      // Adjust the fetch call as necessary
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PUBLIC_PINATA_JWT}`,
          },
          body: formData,
        }
      );
      const resData = await res.json();
      console.log(resData);
      return resData.IpfsHash;
    } catch (e) {
      console.error('Error during upload:', e);
    }
  }

  const submitScreenshotToContract = async () => {
    try {
      const ipfsHash = await uploadScreenshotToIpfs();
      console.log('ipfsHash', ipfsHash);
      chatProvider.onCreateChat?.(chatProvider.DefaultPersonas[0]);
      // chatProvider.sendMessage(`Task : do a technical analysis of the image.`, ipfsHash);
      chatProvider.sendMessage(`Task : do a risk scoring search about the dymension team and give a rating from 0 to 10.
      0 means 0 risks, 10 means the team is known as bad actors.
      
      Answer using this json format:
      {
        teamRiskScore: number,
        teamRiskScoreReason: "content",
        twitterSentimentRiskScore: number,
        twitterSentimentRiskScoreReason: "content",
        tokenomicsRiskScore: number,
        tokenomicsRiskScoreReason: "content",
        globalRiskScore: number,
        globalRecommandation: "content",
      }`);
      setIsChatVisible(true);
      console.log('chatProvider.chatRef', chatProvider.chatRef);
    } catch (e) {
      console.error('Error during submitScreenshotToContract:', e);
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
            src={imageUrl || ''}
          />
          <textarea name="prompt" id="prompt" value={prompt} className='mt-4' onChange={(e) => setPrompt(e.target.value)}></textarea>
          <button id="submitPrompt" className='mt-4' onClick={submitScreenshotToContract}>Ask Galadriel</button>
          <section>
            {isChatVisible && (
              <div className="text-center mt-8">
                <ChatSingleRequest ref={chatProvider.chatRef} />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default App