import { useState } from 'react'
import useChatHook from "./Components/Chat/useChatHook";
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
      const jsonFormatRequested = `
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
          }
      `
      const DEV = true;
      if (DEV === true) {
        chatProvider.sendMessage(`Task : do a risk scoring search about the dymension team and give a rating from 0 to 10.
        0 means 0 risks, 10 means the team is known as bad actors.
        
        ${jsonFormatRequested}`);
      } else {
        chatProvider.sendMessage(`Task : do a technical analysis of the image.`, ipfsHash);
      }
      setIsChatVisible(true);
      console.log('chatProvider.chatRef', chatProvider.chatRef);
    } catch (e) {
      console.error('Error during submitScreenshotToContract:', e);
    } 
  }

  return (
    <div className="flex flex-col w-[400px] h-[550px] bg-background rounded-lg shadow-lg p-4">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Magic Token Scoring 🪄</h2>
        </div>
      </header>
      <div className="flex-1 overflow-x-hidden">
        <div className="flex h-full">
          <div className="flex flex-col flex-1">
            {!isVisible && (
              <div className="flex items-center justify-center h-[400px] bg-muted">
                <button className="btn" onClick={takeScreenshot}>Take Screenshot</button>
              </div>
            )}

            {isVisible && !isChatVisible && (
              <div className='flex flex-col items-center justify-center'>
                <img
                  id="screenshotImage"
                  alt="Screenshot will appear here"
                  className='mt-4 w-full'
                  src={imageUrl || ''}
                />
                <div className="border-t p-3 w-full">
                  <textarea name="prompt" id="prompt" value={prompt} className='mt-4 textarea textarea-bordered w-full' onChange={(e) => setPrompt(e.target.value)}></textarea>
                </div>
                <button id="submitPrompt" className='btn mt-4' onClick={submitScreenshotToContract}>Ask Galadriel 🧝‍♀️</button>
              </div>
            )}
            <section>
            {isChatVisible && (
              <div className="text-center mt-8">
                <ChatSingleRequest ref={chatProvider.chatRef} />
              </div>
            )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App