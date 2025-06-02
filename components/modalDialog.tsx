import { View, Modal, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";


type props={
    icon: any,
    iconColor: string,
    isVisible: boolean,
    message: string,
    validateButtonText: string,
    cancelButtonText: string,
    onValidate: ()=> void,
    onClose: ()=> void,
}


export default function modal({icon, iconColor, isVisible, message, validateButtonText, cancelButtonText, onValidate, onClose}:props){

    return (
        <Modal animationType="fade" visible={isVisible} transparent={ true }>
            <TouchableOpacity style={{flex:1, justifyContent:"center", backgroundColor: 'rgba(0, 0, 0, 0.3)', alignItems:"center"}} activeOpacity={ 1 }>
                <TouchableOpacity className="bg-white w-80 h-[160px] rounded-3xl items-center p-3" activeOpacity={ 1 }>
                    <View>
                        <Ionicons className="text-center" name={icon} color={iconColor} size={35}></Ionicons>
                        
                        <ScrollView className="min-w-full overflow-scroll my-2 h-[80px]">
                            <View className="flex items-center justify-center min-h-full">
                                <Text className="text-md text-gray-600 text-center">{message} </Text>
                            </View>
                        </ScrollView>
                        <View className="flex flex-row items-center justify-end gap-5">
                            <Text onPress={onClose} className="text-md font-normal text-right pr-3">{cancelButtonText}</Text>
                            <Text onPress={onValidate} className="text-md font-normal text-right pr-3">{validateButtonText}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )

}


//définition des styles
const styles = StyleSheet.create({
   
   
})