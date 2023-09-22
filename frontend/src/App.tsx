import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface ImageData {
  id: number;
  compressedImage: string;
}

function App(): JSX.Element {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [data, setData] = useState<ImageData[]>([]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imagesArray = Array.from(files);
      setSelectedImages((prevSelectedImages) => [...prevSelectedImages, ...imagesArray]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      axios.get<ImageData[]>('http://localhost:3000/')
        .then((res) => {
          console.log(res.data);
          setData(res.data);
        })
        .catch((err) => console.log(err));
    }, 1000);

    return () => clearTimeout(timer);
  }, [data]);

  const handleUpload = () => {
    const formData = new FormData();
    selectedImages.forEach((image, i) => {
      formData.append(`images[${i}]`, image);
    });

    axios.post('http://localhost:3000/compressImage', formData)
      .then((res) => {
        if (res.data.Status === 'Success') {
          console.log('Succeeded');
        } else {
          console.log('Failed');
        }
      })
      .catch((err) => console.log(err));

    setSelectedImages([]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prevSelectedImages) => {
      const updatedImages = [...prevSelectedImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  const handleClearImages = async () => {
    try {
      const response = await axios.delete('http://localhost:3000/clear-images');
      if (response.status === 200) {
        console.log('Images cleared successfully.');
      } else {
        console.error('Failed to clear images from server.');
      }
    } catch (error) {
      console.error('Error clearing images:', error);
    }
  };

  const removeDBImage = async (id: number) => {
    try {
      const response = await axios.delete(`http://localhost:3000/delete-image/${id}`);
      if (response.status === 200) {
        console.log('Image deleted successfully.');
      } else {
        console.error('Failed to delete image from server.');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <div className="App">
      <h1>Please Select the Images</h1>
      <input type="file" accept="image/*" multiple onChange={handleImageChange} />
      <div className="image-preview">
        {selectedImages.map((image, index) => (
          <div key={index} className="image-item">
            <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} />
            <button className="remove-button" onClick={() => removeImage(index)}>X</button>
          </div>
        ))}
      </div>
      {selectedImages.length > 0 && (
        <button onClick={handleUpload}>Compress and Upload to Server</button>
      )}
      <br />
      <h1>Images In DataBase:</h1>
      <button onClick={handleClearImages}>Clear</button>
      <div>
        {data.length > 0 && (data.map((image, index) => (
          <div key={index} className="image-item">
            <img src={`http://localhost:3000/${image.compressedImage}`} alt={`Preview ${index}`} />
            <button className="remove-button" onClick={() => removeDBImage(image.id)}>X</button>
          </div>
        )))}
      </div>
    </div>
  );
}

export default App;
