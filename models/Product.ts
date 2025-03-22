export default class Product {
    
    private id: string;
    private id_conditionment: string;
    private name: string;
    private conditionment: string;
    private quantity: number;

    //constructor
    public constructor(id: string, id_conditionment: string, name: string, conditionment: string, quantity: number){
        this.id = id;
        this.id_conditionment = id_conditionment;
        this.name = name;
        this.conditionment = conditionment;
        this.quantity = quantity;
    }

    //getters
    public getId(): string{
        return this.id;
    }
    public getIdConditionnement(): string{
        return this.id_conditionment;
    }
    public getName(): string{
        return this.name;
    }
    public getCondtionment(): string{
        return this.conditionment;
    }
    public getQuantity(): number{
        return this.quantity;
    }

    //setters
    public setQuantity(quantity: number): void{
        this.quantity = quantity;
    }

}
