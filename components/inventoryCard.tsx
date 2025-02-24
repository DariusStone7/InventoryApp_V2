
import { View, Text } from "react-native";
import Inventory from "@/models/Inventory";
import { Ionicons } from "@expo/vector-icons";

type InventoryProps = {
    inventory: Inventory,
}

export default function InventoryCard (props: InventoryProps) {
    
    return(
        <View className="h-[100px] border-1 border-gray-200 bg-white w-[100px] p-3">
            <View className="h-[60px] flex items-center justify-center">
                <Ionicons name="cube" size={48} color="lightgray" />
            </View>
            <Text className="text-gray-600 text-sm truncate h-5">{props.inventory.getTitle()}</Text>
        </View>
    )
}