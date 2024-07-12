document.getElementById('screenshotButton').addEventListener('click', async () => {
  console.log('clicked');
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
      document.getElementById('screenshotImage').src = url;
      document.getElementById('screenshotImage').style.display = 'block';
      document.getElementById('prompt').style.display = 'block';
      document.getElementById('submitPrompt').style.display = 'block';
    });
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
});