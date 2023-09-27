import fileSystem from "fs";

export function backUpImg (file: any, temp: any) {
    return new Promise((resolve, reject) => {
        fileSystem.readFile(file.path, function (error, data) {
            if (error) {
                reject(error);
            }

            const filePath = "public/originalimg/" + (new Date().getTime()) + "-" + file.name;       
            fileSystem.writeFile(filePath, data, function (error){
                if (error) {
                    reject(error);
                }

                temp.backUpOrgPath = filePath;
                temp.backUpOrg = true;

                resolve(temp);
            })   
        })
    })
}

export function removeImg (file: any) {
    return new Promise((resolve, reject) => {
        fileSystem.unlink(addPub(file.originalImage), function (error){
            if (error) {
                reject(error);
            }
            fileSystem.unlink(addPub(file.compressedImage), function (error){
                if (error) {
                    reject(error);
                }
            })
        })

        resolve("all realated files have been removed");
    })
}

function addPub (address: string): string{
    const pub = 'public/';
    return pub.concat(address);
}
