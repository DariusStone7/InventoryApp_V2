import { View, StyleSheet, Text, ScrollView, TextInput, Dimensions, } from "react-native";
import { Link } from "expo-router";
import Product from "@/models/Product";

type props = {
    product: Product,
}

export default function ProductCard({product}: props){

    return(
        <View style={styles.card}>
            <View>
                <Text style={styles.name}> {(product.getName()).length < 30 ? (product.getName()) : (product.getName()).slice(0, 30) + "..."}</Text>
                <Text style={styles.cdt}> {product.getCondtionment()} </Text>
            </View>
            <View>
                <Text style={styles.quantity}> {product.getQuantity()} </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card:{
        backgroundColor: "#fff",
        display: "flex", flexDirection: "row",
        alignItems:"center", 
        justifyContent:"space-between", 
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 10,
        width: Dimensions.get('window').width - 25,
    },
    name:{
        fontSize: 14,
        color: "#0000009b",
        fontWeight: "bold",
    },
    cdt:{
        fontSize: 14,
        color: "#00000090",
    },
    quantity:{
        // fontWeight: "bold",
        color: "#f3a20a",
    }
})