import { View, Modal, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";


type props={
    icon: any,
    iconColor: string,
    isVisible: boolean,
    message: string,
    buttonText: string,
    onClose: ()=> void,
}


export default function modal({icon, iconColor, isVisible, message, buttonText, onClose}:props){

    return (
        <Modal animationType="fade" visible={isVisible} transparent={ true }>
            <TouchableOpacity style={{flex:1, justifyContent:"center", backgroundColor: 'rgba(0, 0, 0, 0.3)', alignItems:"center"}} activeOpacity={ 1 }>
                <TouchableOpacity className="bg-white w-80 h-[160px] rounded-3xl items-center p-3" activeOpacity={ 1 }>
                    <View>
                        <Ionicons className="text-center" name={icon} color={iconColor} size={24}></Ionicons>
                        
                        <ScrollView className="min-w-full overflow-scroll my-2 h-[80px]">
                            <View className="flex items-center justify-center min-h-full">
                                <Text className="text-md text-gray-600 text-center">{message} </Text>
                            </View>
                        </ScrollView>

                        <Text onPress={onClose} className="text-md font-normal text-right pr-3">{buttonText}</Text>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )

}


//définition des styles
const styles = StyleSheet.create({
   
   
})