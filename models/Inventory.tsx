export default class Inventory {
    
    private id_inventory: number;
    private id_status: number;
    private title: string;
    private created_at: string;
    private updated_at: string;

    //constructor
    public constructor(id_inventory: number, id_status: number, title: string, created_at: string, updated_at: string){
        this.id_inventory = id_inventory;
        this.id_status = id_status;
        this.title = title;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    //getters
    public getIdInventory(): number{
        return this.id_inventory;
    }
    public getIdStatus(): number{
        return this.id_status;
    }
    public getTitle(): string{
        return this.title;
    }
    public getCreatedAt(): string{
        return this.created_at;
    }
    public getUpdatedAt(): string{
        return this.updated_at;
    }

    //setters
}
