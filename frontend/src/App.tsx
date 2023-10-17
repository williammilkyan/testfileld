import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  
      axios.get<ImageData[]>('http://localhost:3000/')
        .then((res) => {
          console.log(res.data);
          setData(res.data);
        })
        .catch((err) => console.log(err));
  }, []);

  const handleUpload = () => {
    const formData = new FormData();
    selectedImages.forEach((image, i) => {
      formData.append(`images[${i}]`, image);
    });

    axios.post('http://localhost:3000/compressImage', formData)
      .then((res) => {
        if (res.data.Status === 'Success') {
          console.log('Succeeded');
          window.location.reload();
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
        window.location.reload();
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
        window.location.reload();
      } else {
        console.error('Failed to delete image from server.');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <div className="App">
      <header>
        <nav>
            <div className="nav">
              <h1 className="title">Compress Images</h1>
            </div>
        </nav>
    </header>
      <div className="preview">
        <h4>Please Select the Images</h4>
        <input className="btn btn-primary" type="file" accept="image/*" multiple onChange={handleImageChange} />
        <div className="image-preview">
          {selectedImages.map((image, index) => (
            <div key={index} className="image-item">
              <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} />
              <button className="remove-button" onClick={() => removeImage(index)}>X</button>
            </div>
          ))}
        </div>
        {selectedImages.length > 0 && (
          <button className="btn btn-primary" onClick={handleUpload}>Compress and Upload to Server</button>
        )}
      </div>
      <hr className="border border-primary border-3 opacity-75" />
      <div className="database">
        <h4>Images In DataBase:</h4>
        <button className="btn btn-primary" onClick={handleClearImages}>Clear</button>
        <div>
          {data.length > 0 && (data.map((image, index) => (
            <div key={index} className="image-item">
              <img src={`http://localhost:3000/${image.compressedImage}`} alt={`Preview ${index}`} className="img-thumbnail" />
              <button className="remove-button" onClick={() => removeDBImage(image.id)}>X</button>
            </div>
          )))}
        </div>
      </div>
      <footer className="navbar navbar-expand-lg navbar-light bg-light mt-3">
        <div className="container py-3">
            <p className="copy mb-0">&copy;2023, All Rights Reserved</p>
        </div>
    </footer>
    </div>
  );
}

export default App;
