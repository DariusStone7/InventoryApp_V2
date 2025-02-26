
import { View, Text } from "react-native";
import Inventory from "@/models/Inventory";
import { Ionicons } from "@expo/vector-icons";

type InventoryProps = {
    inventory: Inventory,
}

export default function InventoryCard (props: InventoryProps) {
    
    return(
        <View className="h-[100px] rounded-xl border-1 border-gray-200 bg-white w-[100px] px-3 pt-3 pb-1">
            {/* <Text className="absolute right-1 top-1" onPress={props.openActionMenu}> <Ionicons name="ellipsis-vertical-circle-outline" size={20} color="lightgray" /> </Text> */}
            <View className="h-[60px] flex items-center justify-center mt-1">
                {props.inventory.getIdStatus() == 1 ? (
                    <Ionicons name="cube" size={48} color="#ff990050" />
                ) : (
                    <Ionicons name="cube" size={48} color="lightgray" />
                )}
            </View>
            <Text className="text-gray-600 text-sm truncate h-5">{props.inventory.getTitle()}</Text>
        </View>
    )
}