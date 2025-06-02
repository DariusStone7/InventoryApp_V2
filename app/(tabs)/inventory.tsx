import { View, Text, FlatList, Modal, Platform, KeyboardAvoidingView, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SQLite from 'expo-sqlite';
import React, { useState, useEffect } from "react";
import Inventory from "@/models/Inventory";
import InventoryCard from "@/components/inventoryCard";
import * as FileSystem from 'expo-file-system';
import Product from "@/models/Product";
import ModalInfo from "@/components/modal";
import ModalDialog from "@/components/modalDialog";
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { TextInput, ActivityIndicator } from 'react-native-paper';

export default function AboutScreen() {
    let [inventories, setInventories] = useState<Inventory[]>([])
    let [currentInventories, setCurrentInventories] = useState<Inventory[]>([])
    let [refreshing, setRefreshing] = useState<boolean>(false);
    const router = useRouter()
    let [modalVisible, setModalVisible] = useState<boolean>(false);
    let [modalFormVisible, setModalFormVisible] = useState<boolean>(false);
    let [selectedInventory, setSelectedInventory] = useState<Inventory>();
    let [selectedIndex, setSelectedIndex] = useState<number>();
    let [db, setDb] = useState<any>();
    let [dialogModal, setDialogModal] = useState<boolean>(false);
    let [infoModal, setInfoModal] = useState<boolean>(false);
    let [dialogModalMessage, setDialogModalMessage] = useState<string>('Voulez-vous vraiment effectuer cette action ?');
    let [infoModalMessage, setInfoModalMessage] = useState<string>('Action effectué avec succès');
    let [filter, setFilter] = useState<string>('all')
    let [title, setTitle] = useState<string>('')
    let [dialogModalAction, setDialogModalAction] = useState<string>('')
    let [infoModalIcon, setInfoModalIcon] = useState<string>('warning');

     //initialisation de la liste de produits lorsque l'ecran est focus
    useFocusEffect(
        useCallback(() => {
            getInventories().then((inventories) => {
                setInventories(inventories)
                setCurrentInventories(inventories)
            })
            setFilter('all')
        }, [])
    );

    // useEffect( () => {
    //     getInventories()
    // }, [])


    //Get all inventories in database
    const getInventories = async () => {
        const con = await SQLite.openDatabaseAsync('test');
        db = con
        setDb(db)
        inventories = []
        setInventories(inventories)

        const result = await db.getAllAsync('SELECT * FROM inventory ORDER BY created_at DESC')
        result.forEach((row: any) => {
            let inventory = new Inventory(row.id_inventory, row.id_status, row.title.split('.')[0], row.created_at, row.update_at);
            // console.log(inventory)
            inventories.push(inventory)
        })

       return inventories
    }

    
    //Reload  all inventories
    const onRefresh = async () => {
        setRefreshing(true)
        await getInventories()
        setTimeout(() => { setRefreshing(false) }, 500);
    }


    //Go to détails screen
    const goToEditscreen = (idInventory: number) => {
        // console.log(idInventory)
        router.navigate(`/details?idInventory=${idInventory}`)
        closeMenuModal()
    }


    //Open action menu modal
    const openMenuModal = (inventory : Inventory, index: number) => {
        setSelectedInventory(inventory);
        setSelectedIndex(index);
        setModalVisible(true);

        return null;
    }


    //close action menu modal
    const closeMenuModal = () => {
        setModalVisible(false);
        // console.log('Inventaires mis à jour: ', inventories[Number(selectedIndex)]);
    }

    //close info modal
    const closeInfoModal = () => {
        setInfoModal(false);
        // console.log('Inventaires mis à jour: ', inventories[Number(selectedIndex)]);
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
            await FileSystem.StorageAccessFramework.createFileAsync(permission.directoryUri, selectedInventory?.getTitle()+'.txt'!, "text/plain")
                .then( async (uri) => {
                    let data = formatFileData(products);
                    FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.UTF8 })
                    .then(r => {
                        setInfoModalMessage("Fichier enregistré avec succès !");
                        setInfoModalIcon('checkmark-circle-sharp')
                        setInfoModal(true)
                        closeMenuModal()
                    })
                    .catch(e => {
                        setInfoModalMessage("Une erreur est survenue lors de l'exportation: \n" + e);
                        closeMenuModal()
                        setInfoModal(true);
                        console.log("Une erreur est survenue lors de l'exportation:  \n" + e);
                    });

                    })
                    .catch(e => {
                    setInfoModalMessage("Une erreur est survenue lors de la création du fichier: \n" + e);
                    closeMenuModal()
                    setInfoModal(true);
                    console.log("Une erreur est survenue lors de la création du fichier:  \n" + e);
                });
        }else{
            closeMenuModal()
        }

    }

    //Share inventory
    const shareInventory = async () => {

        let products = [] as Product[];
        
        products = await getAllProducts();

        const newFileUri = `${FileSystem.documentDirectory}${selectedInventory?.getTitle()+'.txt'}`;
        let data = formatFileData(products);

        FileSystem.writeAsStringAsync(newFileUri, data, { encoding: FileSystem.EncodingType.UTF8 })
        .catch(e => {
            setInfoModalMessage("Une erreur est survenue lors de la génération du fichier: \n" + e);
            closeMenuModal()
            setInfoModal(true);
            console.log("Une erreur est survenue lors de la génération du fichier:  \n" + e);
        });
        
        await Sharing.shareAsync(newFileUri)
        .then(()=>closeMenuModal())
        .catch(e => {
           setInfoModalMessage("Une erreur est survenue lors de la génération du fichier: \n" + e);
            closeMenuModal()
            setInfoModal(true);
            console.log("Une erreur est survenue lors du partage du fichier:  \n" + e);
        });
    }

    //get all inventory products
    const getAllProducts = async () => {
        console.log(selectedInventory)
         let data = await db.getAllAsync(`SELECT * FROM product WHERE id_inventory=${selectedInventory?.getIdInventory()}`)
        //  console.log('products: ', data)
 
         let products = [] as Product[];
 
         data.forEach( (row: any) => {
             let product = new Product(row.id_product, row.id_conditionnement, row.name, row.conditionment, row.quantity);
             products.push(product);
         });

         return products
    }

    const formatFileData = (products: Product[])=>{
        let data = "";
        //Reconstitution du contenu du fichier
        products.forEach( (product) => {
            data += product.getIdConditionnement() + ";" + product.getName() + product.getCondtionment() + ";" + product.getQuantity() + "\r\n";
        });

        return data;
    }

    const filterInventories = (key: string) => {
        filter = key
        setFilter(key)
        switch (key){
            case 'ongoing': {
                let result = inventories.filter((inv)=>{
                    return inv.getIdStatus() == 1
                })
                setCurrentInventories(result)
                break
            }
            case 'close': {
                let result = inventories.filter((inv)=>{
                    return inv.getIdStatus() == 2
                })
                setCurrentInventories(result)
                break
            }
            default: {
                setCurrentInventories(inventories)
                break
            }
            
        }
    }

    const openInventoryNameModal = () => {
        closeMenuModal()
        setModalFormVisible(true)
        if(selectedInventory)
        setTitle(selectedInventory?.getTitle())
    }

    //close form modal
    const closeFormModal = () => {
        // console.log(title)
        UpdateInventoryName(title)
        setModalFormVisible(false);
        // console.log('Inventaires mis à jour: ', inventories[Number(selectedIndex)]);
    }

    //Mis à jour du nom de l'inventaire selectionné avec la nouvelle valeur saisir
    const UpdateInventoryName = async (title: string) => {
        // console.log(title)
        let inventory 
        if(selectedInventory)
        inventory = new Inventory(selectedInventory?.getIdInventory(), selectedInventory?.getIdStatus(), selectedInventory?.getTitle(), selectedInventory?.getCreatedAt(), selectedInventory?.getUpdatedAt())

        inventory?.setTitle(title)

        //Mise à jour dans la liste
        setSelectedInventory(inventory)

        //mise à jour du nom dans la liste courante
        currentInventories[Number(selectedIndex)].setTitle(title)

        //mise à jour du nom dans toute la liste
        inventories.forEach((inventory)=>{
            if(inventory.getIdInventory() == selectedInventory?.getIdInventory()){
                inventory.setTitle(title)
                return;
            }
        })
        
        setInventories(inventories)

        const updateInventoryName= await db.prepareAsync(
            'UPDATE inventory SET title = $title WHERE id_inventory = $id_inventory'
        );

        //Mise à jour du nom de l'inventaire dans la base de donnée
        let result = await updateInventoryName.executeAsync({$title: title+'.txt', $id_inventory: selectedInventory?.getIdInventory()})
        // console.log('Mise à jour en bd', result)
    }
        
    const closeDialogModal = () => {
        setDialogModal(false)
    }

    const openDialogModal = (action: string) => {
        if(action == 'delete') setDialogModalMessage(`Voulez-vous vraiment supprimer l'inventaire ${selectedInventory?.getTitle()} ?`)
        else if(action == 'zero') setDialogModalMessage(`Voulez-vous vraiment remettre toutes les valeurs de l'inventaire ${selectedInventory?.getTitle()} à 0 ?`)
        else if(action == 'close') setDialogModalMessage(`Voulez-vous vraiment clôturer l'inventaire ${selectedInventory?.getTitle()} ?`)
        else if(action == 'cancel') setDialogModalMessage(`Voulez-vous vraiment annuler l'inventaire ${selectedInventory?.getTitle()} ?`)
        closeMenuModal()
        setDialogModalAction(action)
        setDialogModal(true)
    }

    const handleDialogModal = () => {
        if(dialogModalAction == 'delete') deleteInventory()
        else if(dialogModalAction == 'zero') resetInventory()
        else if(dialogModalAction == 'close') closeInventory()
        else if(dialogModalAction == 'cancel') cancelInventory()
    }

    //Cancel inventory
    const cancelInventory = async () => {
        closeDialogModal()
        selectedInventory?.setStatus(1)
        inventories[Number(selectedIndex)].setStatus(1)
        setInventories(inventories)
        const result = await db.runAsync('UPDATE inventory  SET id_status = ? WHERE id_inventory = ?', 1, selectedInventory?.getIdInventory())
        setInfoModalMessage("Inventaire annulé avec succès !");
        setInfoModalIcon('checkmark-circle-sharp')
        closeMenuModal()
        setInfoModal(true)
    }

    //Close inventory
    const closeInventory = async () => {
        closeDialogModal()
        selectedInventory?.setStatus(2)
        inventories[Number(selectedIndex)].setStatus(2)
        setInventories(inventories)
        const result = await db.runAsync('UPDATE inventory  SET id_status = ? WHERE id_inventory = ?', 2, selectedInventory?.getIdInventory())
        setInfoModalMessage("Inventaire clôturé avec succès !");
        setInfoModalIcon('checkmark-circle-sharp')
        closeMenuModal()
        setInfoModal(true)
    }

    //supprimer l'inventaire sélectionné
    const deleteInventory = async() => {
        closeDialogModal()
        const deleteInventory = await db.prepareAsync(
            'delete from inventory WHERE id_inventory = $id_inventory'
        );
        const deleteInventoryProducts = await db.prepareAsync(
            'delete from product WHERE id_inventory = $id_inventory'
        );
        //Mise à jour du nom de l'inventaire dans la base de donnée
        let result = await deleteInventoryProducts.executeAsync({$id_inventory: selectedInventory?.getIdInventory()})
        result = await deleteInventory.executeAsync({$id_inventory: selectedInventory?.getIdInventory()})
        currentInventories.splice(Number(selectedIndex), 1)
        setInfoModalMessage("Inventaire supprimé avec succès !");
        setInfoModalIcon('checkmark-circle-sharp')
        closeMenuModal()
        setInfoModal(true)
    }

    const resetInventory = async () => {
        closeDialogModal()
        const resetInventory = await db.prepareAsync(
            'update product set quantity = 0 WHERE id_inventory = $id_inventory'
        );
        //Réinitialiser l'inventaire dans la base de donnée
        let result = await resetInventory.executeAsync({$id_inventory: selectedInventory?.getIdInventory()})
        setInfoModalMessage("Inventaire réinitialisé avec succès !");
        setInfoModalIcon('checkmark-circle-sharp')
        closeMenuModal()
        setInfoModal(true)
    }

    return (
        <View>
            <View className="flex items-center justify-center h-dvh bg-[#eff5f7] pt-5">
                <Text className="text-left w-full pl-5 text-gray-600 text-lg mb-2">Inventaires: { currentInventories.length }</Text>
                <View className="flex flex-row gap-5 items-center justify-center w-[98%] pb-1 mb-5 border-b border-1 border-gray-200">
                    <Text onPress={()=>filterInventories('all')} className="py-2 px-5 rounded-3xl" style={filter === 'all' ? {backgroundColor: "#025c5821", color:"#025C57"} : {backgroundColor: "#fafafa", color:"gray"}}>Tout</Text>
                    <Text onPress={()=>filterInventories('ongoing')} className="py-2 px-5 rounded-3xl" style={filter === 'ongoing' ? {backgroundColor: "#025c5821", color:"#025C57"} : {backgroundColor: "#fafafa", color:"gray"}}>En cours</Text>
                    <Text onPress={()=>filterInventories('close')} className="py-2 px-5 rounded-3xl" style={filter === 'close' ? {backgroundColor: "#025c5821", color:"#025C57"} : {backgroundColor: "#fafafa", color:"gray"}}>Clôturé</Text>
                </View>
                <FlatList 
                    data={currentInventories}
                    renderItem={
                        ({item, index}) => <Text> <InventoryCard inventory={item} openActionMenu={() => openMenuModal(item, index)} /> </Text>
                    }
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    keyExtractor={(item) => item.getIdInventory().toString()}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={ () => <Text style={ {color: "#ff9900"} }> Aucun inventaires trouvé ! </Text> }
                    contentContainerStyle={{ display: "flex", gap:15, flexDirection:"row", flexWrap:"wrap", alignItems: "center", minHeight:"100%", width: "100%",}}
                    />
            </View>
            <Modal transparent={ true } animationType="slide" visible={ modalVisible } onPointerLeave={ () => setModalVisible(false) }>
                <KeyboardAvoidingView style={ {flex:1, justifyContent:"flex-end"} } behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
                    <TouchableOpacity onPress={ closeMenuModal } style={ styles.modalOverlay } activeOpacity={ 1 }>
                        <TouchableOpacity style={ styles.modal } activeOpacity={ 1 }>
                            {/* <Ionicons name="close-circle-outline" size={ 42 } color="lightgray" onPress={ closeMenuModal } style={ styles.closeButton }></Ionicons> */}
                            <Text className="text-xl text-gray-600 font-medium text-left">{ selectedInventory?.getTitle() } </Text>
                            <Text className="text-gray-600 text-lg">{ selectedInventory?.getCreatedAt() } </Text>
                            <View className="mt-8">
                                {selectedInventory?.getIdStatus() == 1 ? (
                                    <>
                                        <Pressable onPress={ () => goToEditscreen(selectedInventory.getIdInventory()) } className="flex flex-row items-center gap-5">
                                            <Ionicons name="happy-outline" size={ 28 } color="gray"></Ionicons>
                                            <Text className="text-lg text-gray-800">Remplir</Text>
                                        </Pressable>
                                        <Pressable onPress={ ()=>openDialogModal('close') } className="flex flex-row items-center gap-5 mt-5">
                                            <Ionicons name="checkmark-circle-outline" size={ 28 } color="gray"></Ionicons>
                                            <Text className="text-lg text-gray-800">Clôturer</Text>
                                        </Pressable>
                                        <Pressable onPress={ openInventoryNameModal } className="flex flex-row items-center gap-5 mt-5">
                                            <Ionicons name="journal-outline" size={ 28 } color="gray"></Ionicons>
                                            <Text className="text-lg text-gray-800">Renomer</Text>
                                        </Pressable>
                                        <Pressable onPress={ ()=>openDialogModal('delete') } className="flex flex-row items-center gap-5 mt-5">
                                            <Ionicons name="trash-outline" size={ 28 } color="gray"></Ionicons>
                                            <Text className="text-lg text-gray-800">Supprimer</Text>
                                        </Pressable>
                                         <Pressable onPress={ ()=>openDialogModal('zero') } className="flex flex-row items-center gap-5 mt-5">
                                            <Ionicons name="sync-outline" size={ 28 } color="gray"></Ionicons>
                                            <Text className="text-lg text-gray-800">Remettre tout à 0</Text>
                                        </Pressable>
                                    </>
                                ) : (
                                   <>
                                    <Pressable onPress={ () => goToEditscreen(selectedInventory?.getIdInventory()!)  } className="flex flex-row items-center gap-5">
                                        <Ionicons name="eye-outline" size={ 28 } color="gray"></Ionicons>
                                        <Text className="text-lg text-gray-800">Consulter</Text>
                                    </Pressable>
                                    <Pressable onPress={ ()=>openDialogModal('cancel') } className="flex flex-row items-center gap-5 mt-5">
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
                                
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
            <Modal transparent={ true } animationType="slide" visible={ modalFormVisible } onPointerLeave={ () => setModalFormVisible(false) }>
                <KeyboardAvoidingView style={ {flex:1, justifyContent:"flex-end"} } behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
                    <TouchableOpacity onPress={ closeFormModal } style={ styles.modalOverlay } activeOpacity={ 1 }>
                        <TouchableOpacity style={ styles.modal } activeOpacity={ 1 }>
                          <Ionicons name="checkmark-circle-outline" size={ 42 } color="#02c4ba" onPress={ closeFormModal } style={ styles.closeButton }></Ionicons>
                            <Text style={ {fontSize:16, color: "#0000009b", marginTop: 20,} }>Nom: </Text>
                            <TextInput 
                                placeholder="Inventaire" 
                                value={ title } 
                                onChangeText={ (text) => {setTitle(text)} } 
                                keyboardType="default" 
                                style={ styles.input } 
                                cursorColor="#000"
                                selectionColor="#bb661639"
                                mode="outlined"
                                outlineStyle={{borderColor:"#0000002d", }}
                                contentStyle={{paddingLeft: 0, margin:0}}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

            <ModalInfo icon={infoModalIcon} iconColor="#02c4ba" isVisible={infoModal} message={infoModalMessage} buttonText="OK" onClose={closeInfoModal}/>
            <ModalDialog icon={"warning"} iconColor="#ff9900" isVisible={dialogModal} message={dialogModalMessage} validateButtonText="Oui" cancelButtonText="Nom" onValidate={handleDialogModal} onClose={closeDialogModal}/>

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
    },
    input:{
        height: 50,
        width: "100%",
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 4,
    },
})  