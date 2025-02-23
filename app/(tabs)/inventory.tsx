import { View, Text, FlatList } from "react-native";
import { Link, useRouter } from "expo-router";
import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from "react";
import Inventory from "@/models/Inventory";
import InventoryCard from "@/components/inventoryCard";

export default function AboutScreen() {
    let [inventories, setInventories] = useState<Inventory[]>([])
    let [refreshing, setRefreshing] = useState<boolean>(false);
    const router = useRouter()

    useEffect( () => {
        getInventories()
    }, [])


    const getInventories = async () => {
        const db = await SQLite.openDatabaseAsync('test');
        inventories = []
        setInventories(inventories)

        const result = await db.getAllAsync('SELECT * FROM inventory')
        result.forEach((row: any) => {
            let inventory = new Inventory(row.id_inventory, row.id_status, row.title, row.created_at, row.update_at);
            console.log(inventory)
            inventories.push(inventory)
        })

        await setInventories(inventories)
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await getInventories()
        setTimeout(() => { setRefreshing(false) }, 500);
    }

    const goToEditscreen = (idInventory: number) => {
        console.log(idInventory)
        router.push(`/details?idInventory=${idInventory}`)
    }

    return (
        <View className="flex items-center justify-center h-dvh bg-[#eff5f7]">
            <FlatList 
                data={inventories}
                renderItem={
                    ({item, index}) => <Text onPress={() => goToEditscreen(item.getIdInventory())}><InventoryCard inventory={item}/> </Text>
                }
                refreshing={refreshing}
                onRefresh={onRefresh}
                keyExtractor={(item) => item.getIdInventory().toString()}
                ListFooterComponent={ () => <Text> Total inventaires: { inventories.length } </Text> }
                ListEmptyComponent={ () => <Text style={ {color: "#ff9900"} }> Aucun inventaires trouvé ! </Text> }
                ListFooterComponentStyle = {{position: "absolute", bottom: 0}}
                contentContainerStyle={{display: "flex", flexDirection:"column", alignItems: "center", justifyContent: "center", minHeight:"100%", width: "100%", overflow: "scroll",}}
            />
             {/* {inventories.map((inventory, index) => ( <Text><InventoryCard inventory={inventory}/></Text> ))} */}
        </View>
       
    )
}