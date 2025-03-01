import { View, Text, FlatList, Modal, Platform, KeyboardAvoidingView, TouchableOpacity, StyleSheet, TextInput, Pressable } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SQLite from 'expo-sqlite';
import React, { useState, useEffect } from "react";
import Inventory from "@/models/Inventory";
import InventoryCard from "@/components/inventoryCard";
import * as FileSystem from 'expo-file-system';
import Product from "@/models/Product";
import ModalInfo from "@/components/modal";
import * as Sharing from 'expo-sharing';

export default function AboutScreen() {
    let [inventories, setInventories] = useState<Inventory[]>([])
    let [refreshing, setRefreshing] = useState<boolean>(false);
    const router = useRouter()
    let [modalVisible, setModalVisible] = useState<boolean>(false);
    let [selectedInventory, setSelectedInventory] = useState<Inventory>();
    let [selectedIndex, setSelectedIndex] = useState<number>();
    let [db, setDb] = useState<any>();
    let [exportModal, setExportModal] = useState<boolean>(false);
    let [errorExportModal, setErrorExportModal] = useState<boolean>(false);
    let [error, setError] = useState<any>();

    useEffect( () => {
        getInventories()
    }, [])


    //Get all inventories in database
    const getInventories = async () => {
        const con = await SQLite.openDatabaseAsync('test');
        db = con
        setDb(db)
        inventories = []
        setInventories(inventories)

        const result = await db.getAllAsync('SELECT * FROM inventory ORDER BY created_at ASC')
        result.forEach((row: any) => {
            let inventory = new Inventory(row.id_inventory, row.id_status, row.title, row.created_at, row.update_at);
            console.log(inventory)
            inventories.push(inventory)
        })

        setInventories(inventories)
    }

    
    //Reload  all inventories
    const onRefresh = async () => {
        setRefreshing(true)
        await getInventories()
        setTimeout(() => { setRefreshing(false) }, 500);
    }


    //Go to détails screen
    const goToEditscreen = (idInventory: number) => {
        console.log(idInventory)
        router.navigate(`/details?idInventory=${idInventory}`)
    }


    //Open action menu modal
    const openModal = (inventory : Inventory, index: number) => {
        setSelectedInventory(inventory);
        setSelectedIndex(index);
        setModalVisible(true);

        return null;
    }


    //close action menu modal
    const closeModal = () => {
        setModalVisible(false);
        console.log('Inventaires mis à jour: ', inventories[Number(selectedIndex)]);
    }

     //Cancel inventory
     const cancelInventory = async () => {
        selectedInventory?.setStatus(1)
        inventories[Number(selectedIndex)].setStatus(1)
        setInventories(inventories)
        const result = await db.runAsync('UPDATE inventory  SET id_status = ? WHERE id_inventory = ?', 1, selectedInventory?.getIdInventory())
        closeModal()
    }

    //Close inventory
    const closeInventory = async () => {
        selectedInventory?.setStatus(2)
        inventories[Number(selectedIndex)].setStatus(2)
        setInventories(inventories)
        const result = await db.runAsync('UPDATE inventory  SET id_status = ? WHERE id_inventory = ?', 2, selectedInventory?.getIdInventory())
        closeModal()
    }


    //Export inventory
    const exportInventory = async () => {

        let products = [] as Product[];
        
        products = await getAllProducts();

        //Demande de permission d'accès au stockage
        // const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, );
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if(permission.granted){

            //Création et enregistrement du nouveau fichier
            await FileSystem.StorageAccessFramework.createFileAsync(permission.directoryUri, selectedInventory?.getTitle()!, "text/plain")
                .then( async (uri) => {
                    let data = formatFileData(products);
                    FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.UTF8 })
                    .then(r => {
                        setExportModal(true)
                        closeModal()
                    })
                    .catch(e => {
                        setError("Une erreur est survenue lors de l'exportation: \n" + e);
                        setErrorExportModal(true);
                        console.log("Une erreur est survenue lors de l'exportation:  \n" + e);
                        closeModal()
                    });

                    })
                    .catch(e => {
                    setError("Une erreur est survenue lors de la création du fichier: \n" + e);
                    setErrorExportModal(true);
                    console.log("Une erreur est survenue lors de la création du fichier:  \n" + e);
                    closeModal()
                });
        }

    }


    //Share inventory
    const shareInventory = async () => {

        let products = [] as Product[];
        
        products = await getAllProducts();

        const newFileUri = `${FileSystem.documentDirectory}${selectedInventory?.getTitle()}`;
        let data = formatFileData(products);

        FileSystem.writeAsStringAsync(newFileUri, data, { encoding: FileSystem.EncodingType.UTF8 })
        .catch(e => {
            setError("Une erreur est survenue lors de la génération du fichier:  \n" + e);
            setErrorExportModal(true);
            console.log("Une erreur est survenue lors de la génération du fichier:  \n" + e);
        });
        
        await Sharing.shareAsync(newFileUri)
        .then(()=>closeModal())
        .catch(e => {
            setError("Une erreur est survenue lors du partage du fichier:  \n" +  + e);
            setErrorExportModal(true);
            console.log("Une erreur est survenue lors du partage du fichier:  \n" + e);
            closeModal()
        });
    }



    //get all inventory products
    const getAllProducts = async () => {
        console.log(selectedInventory)
         let data = await db.getAllAsync(`SELECT * FROM product WHERE id_inventory=${selectedInventory?.getIdInventory()}`)
         console.log('products: ', data)
 
         let products = [] as Product[];
 
         data.forEach( (row: any) => {
 
             let product = new Product(row.id_product, row.name, row.conditionment, row.quantity);
             
             products.push(product);
 
         });

         return products
    }


    const formatFileData = (products: Product[])=>{
        let data = "";
        //Reconstitution du contenu du fichier
        products.forEach( (product) => {
            data += product.getId() + ";" + product.getName() + product.getCondtionment() + ";" + product.getQuantity() + "\r\n";
        });

        return data;
    }


    const closeExportModal = () => {
        setExportModal(false)
    }


    return (
        <View>
            <View className="flex items-center justify-center h-dvh bg-[#eff5f7] pt-5">
                <Text className="text-left w-full pl-5 text-gray-600 text-lg mb-2">Inventaires</Text>
                <View className="flex flex-row gap-5 items-center justify-center w-[98%] pb-1 mb-5 border-b border-1 border-gray-200">
                    <Text className="bg-[#025c5821] py-2 px-5 rounded-3xl text-[#025C57]">Tout</Text>
                    <Text className="bg-gray-200 py-2 px-5 rounded-3xl text-gray-500">En cours</Text>
                    <Text className="bg-gray-200 py-2 px-5 rounded-3xl text-gray-500">Cloturé</Text>
                </View>
                <FlatList 
                    data={inventories}
                    renderItem={
                        ({item, index}) => <Text> <InventoryCard inventory={item} openActionMenu={() => openModal(item, index)} /> </Text>
                    }
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    keyExtractor={(item) => item.getIdInventory().toString()}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={ () => <Text> Total inventaires: { inventories.length } </Text> }
                    ListEmptyComponent={ () => <Text style={ {color: "#ff9900"} }> Aucun inventaires trouvé ! </Text> }
                    ListFooterComponentStyle = {{position: "absolute", bottom: 0}}
                    contentContainerStyle={{ display: "flex", gap:15, flexDirection:"row", flexWrap:"wrap", alignItems: "center", minHeight:"100%", width: "100%",}}
                    />
            </View>
            <Modal transparent={ true } animationType="slide" visible={ modalVisible } onPointerLeave={ () => setModalVisible(false) }>
                <KeyboardAvoidingView style={ {flex:1, justifyContent:"flex-end"} } behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
                    <TouchableOpacity onPress={ closeModal } style={ styles.modalOverlay } activeOpacity={ 1 }>
                        <TouchableOpacity style={ styles.modal } activeOpacity={ 1 }>
                            {/* <Ionicons name="close-circle-outline" size={ 42 } color="lightgray" onPress={ closeModal } style={ styles.closeButton }></Ionicons> */}
                            <Text className="text-xl text-gray-600 font-medium text-left">{ selectedInventory?.getTitle() } </Text>
                            <Text className="text-gray-600 text-lg">{ selectedInventory?.getCreatedAt() } </Text>
                            <View className="mt-8">
                                {selectedInventory?.getIdStatus() == 1 ? (
                                    <>
                                        <Pressable onPress={ () => goToEditscreen(selectedInventory.getIdInventory()) } className="flex flex-row items-center gap-5">
                                            <Ionicons name="happy-outline" size={ 28 } color="gray"></Ionicons>
                                            <Text className="text-lg text-gray-800">Remplir</Text>
                                        </Pressable>
                                        <Pressable onPress={ closeInventory } className="flex flex-row items-center gap-5 mt-5">
                                            <Ionicons name="checkmark-circle-outline" size={ 28 } color="gray"></Ionicons>
                                            <Text className="text-lg text-gray-800">Clôturer</Text>
                                        </Pressable>
                                    </>
                                ) : (
                                   <>
                                    <Pressable onPress={ () => goToEditscreen(selectedInventory?.getIdInventory()!)  } className="flex flex-row items-center gap-5">
                                        <Ionicons name="eye-outline" size={ 28 } color="gray"></Ionicons>
                                        <Text className="text-lg text-gray-800">Consulter</Text>
                                    </Pressable>
                                    <Pressable onPress={ cancelInventory } className="flex flex-row items-center gap-5 mt-5">
                                            <Ionicons name="arrow-forward-circle-outline" size={ 28 } color="gray"></Ionicons>
                                            <Text className="text-lg text-gray-800">Annuler</Text>
                                        </Pressable>
                                     <Pressable onPress={ exportInventory } className="flex flex-row items-center gap-5 mt-5">
                                        <Ionicons name="arrow-undo-outline" size={ 28 } color="gray"></Ionicons>
                                        <Text className="text-lg text-gray-800">Exporter</Text>
                                    </Pressable>
                                    <Pressable onPress={ shareInventory } className="flex flex-row items-center gap-5 mt-5">
                                        <Ionicons name="share-social-outline" size={ 28 } color="gray"></Ionicons>
                                        <Text className="text-lg text-gray-800">Partager</Text>
                                    </Pressable>
                                   </>
                                )}
                                <Pressable onPress={ closeModal } className="flex flex-row items-center gap-5 mt-5">
                                    <Ionicons name="journal-outline" size={ 28 } color="gray"></Ionicons>
                                    <Text className="text-lg text-gray-800">Renomer</Text>
                                </Pressable>
                                <Pressable onPress={ closeModal } className="flex flex-row items-center gap-5 mt-5">
                                    <Ionicons name="trash-outline" size={ 28 } color="gray"></Ionicons>
                                    <Text className="text-lg text-gray-800">Supprimer</Text>
                                </Pressable>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

            <ModalInfo icon={"checkmark-circle-sharp"} iconColor="#02c4ba" isVisible={exportModal} message="Fichier enregistré avec succès !" buttonText="OK" onClose={closeExportModal}/>
            <ModalInfo icon={"warning"} iconColor="#ff9900" isVisible={errorExportModal} message={error} buttonText="Réessayer" onClose={closeExportModal}/>

        </View>
        
       
    )
}

//définition des styles
const styles = StyleSheet.create({
    modal:{
       backgroundColor: "#ffffff",
       width: "100%",
       height: "auto",
       position: "absolute",
       bottom: 0,
       borderTopRightRadius: 25,
       borderTopLeftRadius: 25,
       paddingHorizontal: 20,
       paddingVertical: 40,
    },
    exportModal:{
       backgroundColor: "#dfeaee",
       width: "80%",
       height: 150,
       borderRadius: 15,
       justifyContent: "center",
       alignItems:"center",
    },
    modalOverlay:{
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    closeButton:{
        position: "absolute",
        top: 10,
        right: 10,
    },
    buttons:{
        display: "flex",
        flexDirection: "row",
        gap: 15,
    }
})  