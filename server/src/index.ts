import express, { Request, Response } from 'express';
import cors from 'cors';
import formidable from "express-formidable";
import { AppDataSource } from "./dataSource";
import { Images } from "./entity/Images";
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
    path:           string;
    picExt:         string;
    quality:        number;
    backUpOrg:      boolean;
    backUpOrgPath:  string;
    createThumbnail: boolean;
    thumbnailPath:  string;
}

function createImgConfig(path: string): ImgConfig {
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

    // [post route goes here]
    // upload image
app.post("/compressImage", async (req: any, res: Response) =>{
    try{
    let config: any = [];
    if(!AppDataSource.isInitialized){
    await AppDataSource.initialize();
    }
    // load all info to Image
    //req.files => image object array
    for(const key in req.files) {

        // Identify and verified the image file -sync
         
        if(req.files[key].size > 0) {
            if(isPic(req.files[key].type)) {

        const temp:ImgConfig = createImgConfig(req.files[key].path);
        temp.picExt = req.files[key].type.replace('image/', ''); 

        
        let backuped: any    = await backUpImg(req.files[key], temp);

        // compressimg-async function
        let compressed: any  = await pressimg(backuped);

        // upload DB-async function
        let uploadDB: any    = await uploaddb(compressed);
        

        // push in array-sync function
        config.push(uploadDB);
        
        } else {
            return res.status(400).json({Message: "please selcet a image in correct format."});
             }
        } else {
            return res.status(400).json({Message: "please select a file."});
        }   
    } //end of for loop
    console.log(config);
    return res.status(200).json({Status: "Success"});
}catch (error) {
    return res.status(500).json(error);
}    
}) // end of app.post("/compressImage")



    // [get route goes here]
app.get("/", async (req:Request, res:Response) => {
    try{if(!AppDataSource.isInitialized){
        await AppDataSource.initialize();
        }
        const images:Images[] = await AppDataSource.manager.find(Images);
        
        return res.status(200).json(images);
    }catch(error){
        return res.status(500).json(error);
    }
        
});

app.delete('/clear-images', async (req:Request, res:Response) => {
    try {
        if(!AppDataSource.isInitialized){
            await AppDataSource.initialize();
        }

        const images:Images[] = await AppDataSource.manager.find(Images);
        for(const key in images) {
        const result:any = await removeImg(images[key]);
        console.log(result);
        await AppDataSource.manager.remove(images[key]);
        }
        
        return res.status(200).json({ message: 'Images cleared successfully.' });
        } catch (error) {
        console.error('Error clearing images:', error);
        return res.status(500).json({ message: 'Internal server error.' });
        }
});

app.delete('/delete-image/:imageId', async (req:Request, res:Response) => {
    try {
        if(!AppDataSource.isInitialized){
            await AppDataSource.initialize();
        }
      const imageId:number = Number(req.params.imageId);
      
      const imgToBeDelete:Images = await AppDataSource.manager.findOneBy(Images, {
        id: imageId,
    });
      const result = await removeImg(imgToBeDelete);
    
      console.log(result);
    
      await AppDataSource.manager.remove(imgToBeDelete);
      res.status(200).json({ message: 'Image deleted successfully.' });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });

    
app.listen(port, () => {
    console.log("Server started running at port: " + port);
})

function isPic(image:string) {
    const ext:string = image.toLowerCase();
    return (ext == 'image/jpg' || ext == 'image/png' || ext == 'image/svg' || ext == 'image/gif' || ext == 'image/jpeg' || ext == 'image/svg');
}