import * as SQLite from 'expo-sqlite';

const connectToDatabse = async () => {

    await SQLite.deleteDatabaseAsync('test')
    const db = await SQLite.openDatabaseAsync('test');
    console.log('Connection à la base de donnée: ', db)
    
    try{
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS status (id_status INTEGER PRIMARY KEY NOT NULL, title TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS inventory (id_inventory INTEGER PRIMARY KEY NOT NULL, id_status INTEGER NOT NULL, title TEXT NOT NULL, created_at TEXT NOT NULL, update_at TEXT);
            CREATE TABLE IF NOT EXISTS product (id_product TEXT PRIMARY KEY NOT NULL, id_inventory INTEGER NOT NULL, name TEXT NOT NULL, conditionment TEXT NOT NULL, quantity REAL NOT NULL DEFAULT(0));
            CREATE TABLE IF NOT EXISTS inventory_update (id_inventory_update INTEGER PRIMARY KEY NOT NULL, id_inventory INTEGER NOT NULL, id_product TEXT NOT NULL, quantity REAL NOT NULL DEFAULT(0), updated_at TEXT);
            ALTER TABLE inventory ADD CONSTRAINT fk_inventory_status FOREIGN KEY (id_status) REFERENCES status(id_status);
            ALTER TABLE product ADD CONSTRAINT IF NOT EXISTS fk_product_inventory FOREIGN KEY (id_inventory) REFERENCES inventory(id_inventory);
            ALTER TABLE inventory_update ADD CONSTRAINT IF NOT EXISTS fk_inventory_update_inventory FOREIGN KEY (id_inventory) REFERENCES inventory(id_inventory);
            ALTER TABLE inventory_update ADD CONSTRAINT IF NOT EXISTS fk_inventory_update_product FOREIGN KEY (id_product) REFERENCES product(id_product);
        `);
    }
    catch{
        (e: any) => console.info('Erreur de creation de la base de données', e)
    }
    

    try{
        let status = await db.getAllAsync('SELECT * FROM status')
        if(status.length == 0) {
            await db.execAsync(`
                INSERT INTO status VALUES (1, 'En cours');  
                INSERT INTO status VALUES (2, 'Cloturé');  
            `)
        }

        status = await db.getAllAsync('SELECT * FROM status')
        console.log('status', status)
       
    }catch{
        (e: any) => console.info('Erreur lors de la creation des status', e)
    }
   

    return db;
}

export default connectToDatabse