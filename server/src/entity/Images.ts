import { Entity, PrimaryGeneratedColumn,Column } from "typeorm";

@Entity()
export class Images {

    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column()
    originalImage: string = '';

    @Column()
    compressedImage: string = '';

    @Column({type: 'decimal', precision: 4, scale: 2})
    compressRatio: number = 0;

    @Column()
    uid: string = '';

}
