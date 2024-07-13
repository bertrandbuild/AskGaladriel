import { useState } from 'react'
import viteLogo from '/vite.svg'
import { chatGptVisionABI } from './abis/chatgptvision'
import { ethers, Contract } from 'ethers'
import './App.css'

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [prompt, setPrompt] = useState('do a technical analysis');
  const pk = import.meta.env.VITE_WALLET_PK;
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

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
    const ipfsHash = await uploadScreenshotToIpfs();
    // Create a new File object from the blob
    const provider = new ethers.JsonRpcProvider("https://devnet.galadriel.com");
    const signer = new ethers.Wallet(pk, provider);
    const contract = new Contract(
      contractAddress || "",
      chatGptVisionABI,
      signer
    );
  
    try {
      const tx = await contract.startChat(prompt, [ipfsHash]);
      await tx.wait();
      console.log(tx)
    } catch (error) {
      console.error('Error interacting with contract:', error);
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
          <textarea name="prompt" id="prompt" value={prompt} className='mt-4' onChange={(e) => setPrompt(e.target.value)}></textarea>
          <button id="submitPrompt" className='mt-4' onClick={submitScreenshotToContract}>Ask Galadriel</button>
        </div>
      )}
    </div>
  )
}

export default App