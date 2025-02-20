import { StyleSheet, View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";


type props = {
    label: string,
    icon?: any,
    onPress?: () => void,
    type: string,
}

export default function Button({ label, icon, onPress, type } : props){

    return(
        <View>
            {type==="primary" ? (
                <View style={styles.p_buttonContainer}>
                    <Pressable style={styles.button} onPress={onPress}>
                        {icon ? (
                            <Ionicons style={styles.p_buttonIcon} name={icon} color="#fff" size={20}></Ionicons>
                        ): (
                            null
                        )}
                        <Text style={styles.p_buttonLabel}>{label}</Text>
                    </Pressable>
                </View>
            ) : (
                <View style={styles.o_buttonContainer}>
                    <Pressable style={styles.button} onPress={onPress}>
                        {icon ? (
                            <Ionicons style={styles.o_buttonIcon} name={icon} color="#fff" size={20}></Ionicons>
                        ): (
                            null
                        )}
                        <Text style={styles.o_buttonLabel}>{label}</Text>
                    </Pressable>
                </View>
            )}
        </View>
        
    )
}

const styles = StyleSheet.create({
    p_buttonContainer:{
        width: 140,
        height: 45,
        marginHorizontal: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor:"#025c57",
        borderRadius: 10,
    },
    o_buttonContainer:{
        width: 140,
        height: 45,
        marginHorizontal: 0,
        alignItems: "center",
        justifyContent: "center",
        borderColor:"#025c57",
        borderRadius: 10,
        borderWidth: 2
    },
    button:{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    p_buttonIcon:{
        paddingRight: 8,
        color: "#fff",
    },
    o_buttonIcon:{
        paddingRight: 8,
        color: "#025c57",
    },
    p_buttonLabel:{
        color: "#fff",
        fontSize: 16,
    },
    o_buttonLabel:{
        color: "#025c57",
        fontSize: 16,
    },
})