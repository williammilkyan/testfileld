import express, { Request, Response } from 'express';
import cors from 'cors';
import formidable from 'express-formidable';
import { AppDataSource } from './dataSource';
import { Images } from './entity/images';
import { backUpImg, removeImg } from './backUpImg';
import { pressimg } from './pressImg';
import { uploaddb } from './uploadDB';
import http from 'http';
import { Server } from 'socket.io';
import uniqid from 'uniqid';

const app = express();
const port = 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());
app.use(formidable());
app.use(cors());
app.use(express.static('public'));

// Define a configuration object for image processing
interface ImgConfig {
  id: string;
  path: string;
  picExt: string;
  quality: number;
  backUpOrg: boolean;
  backUpOrgPath: string;
  createThumbnail: boolean;
  thumbnailPath: string;
}

// Function to create ImgConfig objects
function createImgConfig(path: string): ImgConfig {
  return {
    id: '',
    path: path,
    picExt: '',
    quality: 1.0,
    backUpOrg: false,
    backUpOrgPath: 'backUpOrg',
    createThumbnail: false,
    thumbnailPath: 'thumbnail',
  };
}

// Function to handle image compression
async function handleImageCompression(files: any, emitProgress: (data: any) => void) {
  const progressStep = (1 / Object.keys(files).length) * 100;
  let progress = 0;

  const configPromises = Object.values(files).map(async (file: any) => {
    if (file.size > 0) {
      if (isPic(file.type)) {
        const temp: ImgConfig = createImgConfig(file.path);
        temp.picExt = file.type.replace('image/', '');
        temp.id = uniqid();

        // Back up the original image
        const backuped: any = await backUpImg(file, temp);

        // Compress the image
        const compressed: any = await pressimg(backuped);

        // Upload image folder information to the database
        const uploadDB: any = await uploaddb(compressed);
        progress = progress + progressStep;
        emitProgress({
          image: file.name,
          progress: progress,
        });
        return uploadDB;
      } else {
        throw new Error('Please select an image in the correct format.');
      }
    } else {
      throw new Error('Please select a file.');
    }
  });

  return Promise.all(configPromises);
}

// Middleware for handling image compression
app.post('/compressImage', async (req: any, res: Response) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const emitProgress = (data: any) => {
      io.emit('imageCompressionProgress', data);
    };

    const config = await handleImageCompression(req.files, emitProgress);
    console.log(config);

    io.emit('imageCompressionComplete', { status: 'All images compressed successfully.' });

    // Handle database initialization
    try {
      const images: Images[] = await AppDataSource.manager.find(Images);
      io.emit('DBInitialize', images);
    } catch (error) {
      io.emit('DBInitialize', error);
    }

    return res.status(200).json({ Status: 'Success' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/processImage', async (req: any, res: Response) => {
  console.log(req.files);
  
})

app.delete('/clear-images', async (req:Request, res:Response) => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const images:Images[] = await AppDataSource.manager.find(Images);

        for(const key in images) {
            const result:any = await removeImg(images[key]);
            console.log(result);
            await AppDataSource.manager.remove(images[key]);
        }

        return res.status(200).json({ message: 'Images cleared successfully.' });
        }
        catch (error) {
            console.error('Error clearing images:', error);

            return res.status(500).json({ message: 'Internal server error.' });
        }
});

app.delete('/delete-image/:imageId', async (req:Request, res:Response) => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

    const imageId:number = Number(req.params.imageId);
    const imgToBeDelete:Images = await AppDataSource.manager.findOneBy(Images, {
        id: imageId,
    });
    const result = await removeImg(imgToBeDelete);

    console.log(result);
    await AppDataSource.manager.remove(imgToBeDelete);

    return res.status(200).json({ message: 'Image deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting image:', error);

        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Socket.io connections...
io.on('connection', async (socket) => {
    console.log(`A user connected: ${socket.id}`);

    
    socket.emit('welcome', 'Welcome to the server.');

    try{
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        const images:Images[] = await AppDataSource.manager.find(Images);    
                     
        socket.emit('DBInitialize', images);
        
    }
    catch(error){
        socket.emit('DBInitialize', error);
    } 

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Server initialization...
server.listen(port, () => {
    console.log("Server started running at port: " + port);
})

function isPic(image: string) {
  const ext: string = image.toLowerCase();
  return ['image/jpg', 'image/png', 'image/svg', 'image/gif', 'image/jpeg', 'image/svg'].includes(ext);
}
