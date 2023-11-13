import { useState, useRef } from 'react';
import './index.css';
import axios from 'axios'; 
import Cropper from 'react-easy-crop';
import getCroppedImg from "./cropImage";
//import SingleWatermark from "./component/Watermark";
import { Watermark } from '@hirohe/react-watermark';
import html2canvas from 'html2canvas';


function App() {
  const [selectedImage, setSelectedImage] = useState(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedResult, setCroppedResult] = useState(null);

  const [wmtext, setWmtext] = useState("watermark");
  const [watermarkedImage, setWatermarkedImage] = useState(null);

  const imageRef = useRef();

  function dataURLToBlob(dataURL) {
    const splitData = dataURL.split(",");
    if (splitData.length !== 2) {
      console.error("Invalid Data URL format");
      return null;
    }
  
    const [type, base64Data] = splitData;
  
    // Decode the base64 data
    const binaryData = atob(base64Data);
  
    // Convert the binary data to a Uint8Array
    const byteArray = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      byteArray[i] = binaryData.charCodeAt(i);
    }
  
    // Create a Blob with the appropriate MIME type
    const blob = new Blob([byteArray], { type: "image/png" });
  
    return blob;
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]; 
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }

  const onCrop = async () => {
    const croppedImageUrl = await getCroppedImg(selectedImage, croppedAreaPixels);
    setCroppedResult(croppedImageUrl);
  }

  const captureImage = () => {
    html2canvas(imageRef.current).then((canvas) => {
      const imageUrl = canvas.toDataURL(croppedResult);
      console.log(imageUrl);
      setWatermarkedImage(imageUrl);
    });
  };

  const handleUpload = () => {
    if (watermarkedImage) { 
      const formData = new FormData();
      const imageBlob = dataURLToBlob(watermarkedImage);
      console.log(imageBlob);
      

      formData.append("image", imageBlob);

      axios.post('http://localhost:3000/compressImage', formData)
        .then((res) => {
          if (res.data.Status === 'Success') {
            console.log('Succeeded');
            window.location.reload();
          } else {
            console.log('Failed');
          }
        })
        .catch((err) => console.log(err))

      setSelectedImage(null); 
    }
  };
//<img className="preview" src={selectedImage ? URL.createObjectURL(selectedImage) : ''} alt={selectedImage ? selectedImage.name : ''} />
  return (
    <div className="main-container">
      <h4>Please Select the Images</h4>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      
      {selectedImage && (
        <div>
        
        <div className="crop-container">
          <Cropper
            image={selectedImage}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="controls">
          <a>Zoom:</a>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(e.target.value)
            }}
            className="zoom-range"
          />
        </div>

        <div className="cropped-container">
          <button onClick={onCrop}>Crop</button>
          <a>Cropped Result:</a>
          <img className="croppedresult" src={croppedResult} alt={croppedResult}/>
        </div>
        
        <div>
          <a>Watermark text:</a>
          <input type="text" value={wmtext} onChange={(e) => setWmtext(e.target.value)}/>
          <br></br>
          <a>Watermark preview:</a>
          <div ref={imageRef} className="watermark-container">
            {/*<SingleWatermark />*/}
            <Watermark text={wmtext} gutter={20}>
              <div style={{ width: 500, height: 500, backgroundColor: '#5f5f5f' }}>
              <img className="watermarkedimage" src={croppedResult} alt={croppedResult} />
              </div>
            </Watermark>
          </div>
          <button onClick={captureImage}>Add Watermark:</button>
        </div>

        <div>
          <img className="watermarkedimage" src={watermarkedImage} alt={watermarkedImage} />
          <button onClick={handleUpload}>Process</button>
        </div>
      </div>       
      )}
    </div>
  )
}

export default App;
