import React, { useRef, useState, useEffect } from 'react';

const Camera = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  useEffect(() => {
    let activeStream;

    const startStream = async () => {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode }
        });
        activeStream = mediaStream;
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    if (isOpen) {
      startStream();
    }

    // Cleanup on unmount or re-render
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');

    onCapture(imageData);

    // Stop the camera stream after capturing
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    onClose();
  };

  const switchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow-lg flex flex-col items-center space-y-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md rounded"
        />
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={capturePhoto}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Take Photo
          </button>
          <button
            type="button"
            onClick={switchCamera}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Switch Camera
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Camera;
