import { AppDataSource } from "./dataSource";
import { Images } from "./entity/Images";

// upload to mysql 
export function uploaddb(temp: any) {
    return new Promise(async (resolve, reject) => {
       
        console.log("Inserting a new Images into the database...")
        const image:Images = new Images();
        image.originalImage = temp.backUpOrgPath.replace('public/', '');
        image.compressedImage = temp.thumbnailPath.replace('public/', '');
        await AppDataSource.manager.save(image);
        console.log("Saved a new user with id: " + image.id);
        resolve(temp);
        
    })}

