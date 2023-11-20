import { useState, useEffect } from 'react';
import axios from 'axios';
import './app.css';



function Upload() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [data, setData] = useState([]);
  const [email, setEmail] = useState('william4@gmail.com');

  const handleImageChange = (event) => {
    const files = event.target.files;
    if (files) {
      const imagesArray = Array.from(files);
      setSelectedImages((prevSelectedImages) => [...prevSelectedImages, ...imagesArray]);
    }
  };

  useEffect(() => {
    axios.get(`http://localhost:3800/images/${email}`)
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

    axios.post(`http://localhost:3800/images/${email}`, formData)
      .then((res) => {
        if (res.status === 200) {
          console.log('Succeeded');
          setData(res.data);
          console.log(res.data);
          //window.location.reload();
        } else {
          console.log('Failed');
        }
      })
      .catch((err) => console.log(err));
    setSelectedImages([]);
  };

  const removeImage = (index) => {
    setSelectedImages((prevSelectedImages) => {
      const updatedImages = [...prevSelectedImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  const handleClearImages = async () => {
    try {
      const response = await axios.delete(`http://localhost:3800/image/${email}/clear-images`);
      if (response.status === 200) {
        console.log('Images cleared successfully.');
        
      } else {
        console.error('Failed to clear images from server.');
      }
    } catch (error) {
      console.error('Error clearing images:', error);
    }
  };

  const removeDBImage = async (index) => {

    try {
      const response = await axios.delete(`http://localhost:3800/images/${email}/${index}`);
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
      
      <div className="preview">
        <h4>Please set your email:</h4>
        <input type="text" value={email} onChange={e => setEmail(e.target.value)} />
        <h4>{email}</h4>
        <h4>Please Select the Images</h4>
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
          <button onClick={handleUpload}>Upload</button>
        )}
      </div>




      <hr />
      <div className="database">
        <h4>Images In DataBase:</h4>
        <button onClick={handleClearImages}>Clear</button>
        <div>
          {data.length > 0 && (data.map((element, index) => (
            <div key={index} className="image-item">
              <img src={`http://localhost:3800/${element.imageURL}`} alt={`Preview ${index}`} className="img-thumbnail" />
              <h4>Upload @{element.createAt}</h4>
              <button className="remove-button" onClick={() => removeDBImage(element.imageId)}>X</button>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}

export default Upload;
