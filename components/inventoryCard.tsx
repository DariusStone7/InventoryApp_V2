
import { View, Text } from "react-native";
import Inventory from "@/models/Inventory";
import { Ionicons } from "@expo/vector-icons";

type InventoryProps = {
    inventory: Inventory,
}

export default function InventoryCard (props: InventoryProps) {
    
    return(
        <View className="h-[150px] border-1 border-gray-200 bg-white w-[150px] p-3">
            <View className="h-[100px] flex items-center justify-center">
                <Ionicons name="cube" size={48} color="lightgray" />
            </View>
            <Text className="truncate">{props.inventory.getTitle()}</Text>
        </View>
    )
}