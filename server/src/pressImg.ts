import compressImages from "compress-images";

export function pressimg(temp:any) {
    return new Promise((resolve, reject) => {
        const compressedFilePath:string = "public/compressimg/compressed";
        const compression:number = 60;
        compressImages(temp.backUpOrgPath, compressedFilePath, {
            compress_force: false, statistic: true,
            autoupdate: true }, false,
            {jpg: {engine: "mozjpeg", command: ["-quality", compression]}},
            {png: {engine: 'pngcrush', command: ['-reduce', '-brute']}},
            {svg: {engine: "svgo", command: "--multipass" }},
            {gif: {engine: 'gif2webp', command: ['-f', '80', '-mixed', '-q', '30', '-m', '2']}},
            function (error:any, completed:any, statistic: any) {
                if(error) {
                    reject(error);
                }     
            console.log("---------------------------");
            console.log(completed);
            console.log(statistic);
            console.log("----------------------------");
            temp.quality = (100 - statistic.percent) *0.01;
            temp.thumbnailPath = statistic.path_out_new;
            temp.createThumbnail = true;

            resolve(temp);
            }
        )
    })
}

