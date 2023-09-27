import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Images {

    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column()
    originalImage: string = '';

    @Column()
    compressedImage: string = '';
}
