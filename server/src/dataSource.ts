import "reflect-metadata";
import { DataSource } from "typeorm";
import { Images } from "./entity/images";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "1234",
    database: "nodemysqlfs",
    synchronize: true,
    logging: false,
    entities: [Images],
    migrations: [],
    subscribers: [],
})
