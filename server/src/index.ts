import express, { Request, Response } from 'express';
import cors from 'cors';
import formidable from "express-formidable";
import { AppDataSource } from "./dataSource";
import { Images } from "./entity/images";
import { backUpImg, removeImg } from "./backUpImg";
import { pressimg } from "./pressImg";
import { uploaddb } from "./uploadDB";

const app = express();
const port = 3000;

app.use(express.json());
app.use(formidable());
app.use(cors());
app.use(express.static("public"));

interface ImgConfig {
    path:            string;
    picExt:          string;
    quality:         number;
    backUpOrg:       boolean;
    backUpOrgPath:   string;
    createThumbnail: boolean;
    thumbnailPath:   string;
}

function createImgConfig (path: string): ImgConfig {
    return {
        path            : path,         //'/fetchFunctionEnum'
        picExt          : '',           //['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg']
        quality         : 1.0,          //0.1-1.0, default is 1.0
        backUpOrg       : false,        //default is false
        backUpOrgPath   : 'backUpOrg',  //default is backUpOrg
        createThumbnail : false,        //default is true
        thumbnailPath   : 'thumbnail',  //default is thumbnail
    }
}

app.post("/compressImage", async (req: any, res: Response) => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const configPromises = Object.values(req.files).map(async (file: any) => {
            if (file.size > 0) {
                if (isPic(file.type)) {
                    const temp: ImgConfig = createImgConfig(file.path);
                    temp.picExt = file.type.replace('image/', '');

                    // Back up the original image in the folder originalimg
                    const backuped: any = await backUpImg(file, temp);

                    // Compress the image and output it in the folder compressimg
                    const compressed: any = await pressimg(backuped);

                    // Upload all image folder information to the database
                    const uploadDB: any = await uploaddb(compressed);
                    return uploadDB;
                } else {
                    throw new Error("Please select an image in the correct format.");
                }
            } else {
                throw new Error("Please select a file.");
            }
        });

        const config = await Promise.all(configPromises);
        console.log(config);
        return res.status(200).json({ Status: "Success" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


app.get("/", async (req:Request, res:Response) => {
    try{
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        const images:Images[] = await AppDataSource.manager.find(Images);    

        return res.status(200).json(images);
    }
    catch(error){
        return res.status(500).json(error);
    }   
});

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

app.listen(port, () => {
    console.log("Server started running at port: " + port);
})

function isPic(image:string) {
    const ext:string = image.toLowerCase();
    
    return (ext == 'image/jpg' || ext == 'image/png' || ext == 'image/svg' || ext == 'image/gif' || ext == 'image/jpeg' || ext == 'image/svg');
}