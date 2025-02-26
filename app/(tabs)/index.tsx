import { Text, View, StyleSheet, Pressable, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker"
import Button from "@/components/button";
import { useState, useEffect } from "react";
import * as FileSystem from 'expo-file-system';
import { useRouter, useNavigation } from "expo-router";
import ModalInfo from "@/components/modal";
import Product from "@/models/Product";
import * as SQLite from 'expo-sqlite';
import connectToDatabse from "@/utils/database/database";

export default function Index() {

  const router = useRouter();
  const navigation = useNavigation();

  const [selectedFileUri, setSelectedFileUri] = useState<string>();
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>();
  const [selectedFileData, setSelectedFileData] = useState<string | undefined>();
  let [fileErrorModalIsVisible, setFileErrorModalIsVisible] = useState<boolean>(false);
  let [notFileModalIsVisible, setNotFileModalIsVisible] = useState<boolean>(false);
  let [formatErrorModal, setFormatErrorModal] = useState<boolean>(false);
  let [errorModal, setErrorModal] = useState<boolean>(false);
  let [error, setError] = useState<any>();
  let [db, setDb] = useState<any>();


  useEffect( () => {
    getDatabaseConnection()
  }, [])

   //Création et Connexion à la base de données
   const getDatabaseConnection = async () => {
    db = await connectToDatabse()
      // db = await SQLite.openDatabaseAsync('test');
      setDb(db)
  }

  const documentPicker = async()=>{

    setSelectedFileData("");
    setSelectedFileName("");
    // setSelectedFileUri("");
    try{
      let result = await DocumentPicker.getDocumentAsync({
        type: "text/plain",
        copyToCacheDirectory: true,
      });
  
      if(!result.canceled){
        
        console.log(result);

        setSelectedFileName(result.assets[0].name);

        if(!(result.assets[0].name).toLowerCase()?.endsWith(".txt")){

          setFileErrorModalIsVisible(true);
          setSelectedFileName("");

          return;
        }

        setSelectedFileUri(result.assets[0].uri);
        
        let fileData = await FileSystem.readAsStringAsync(result.assets[0].uri, {encoding: FileSystem.EncodingType.UTF8});
        setSelectedFileData(fileData);
        // console.log(fileData)
      }
      else{
        setNotFileModalIsVisible(true)
      }
    }catch(e){
      setSelectedFileData("");
      setSelectedFileName("");
      setSelectedFileUri("");
      setErrorModal(true);
      setError("Une erreur est survenue: " + e);
    }
    

  }


  const createInventory = async () => {
    let date = new Date()
    let inventory_date = date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR')
    console.log( inventory_date)
    let result = await db.runAsync('INSERT INTO inventory (id_status, title, created_at, update_at) VALUES (?, ?, ?, ?)', 1, selectedFileName, inventory_date, inventory_date )
    console.log('inventory:', result.lastInsertRowId, result.changes)

    return result.lastInsertRowId
  }


  const importInventory = async () => {

    const idInventory = await createInventory()
    console.log('inventory:', idInventory)

    let products = [] as Product[];

    try{
          let data = selectedFileData?.split(/\r?\n/);
          console.log(data?.length)
          // console.log(data)

          data = data?.filter( item => item !== "" );
              
          const insertProduct = await db.prepareAsync(
            'INSERT INTO product (id_inventory, name, conditionment, quantity) VALUES ($id_inventory, $name, $conditionment, $quantity)'
          );

           await data?.forEach( async (line) => {

              let lineSplit = line.split(";");
              let name = lineSplit[1].slice(0, lineSplit[1].indexOf('('));
              let cdt = lineSplit[1].slice(lineSplit[1].indexOf('('), lineSplit[1].length);

              let product = new Product(lineSplit[0], name, cdt, Number(lineSplit[2]));
              
              let result = await insertProduct.executeAsync({$id_inventory: idInventory, $name: product.getName(), $conditionment: product.getCondtionment(), $quantity: product.getQuantity()})
              console.log('product:', result.lastInsertRowId, result.changes);
              products.push(product);

          });
          // console.log(products)
          setSelectedFileData("");
          setSelectedFileName("");
          setSelectedFileUri("");
          router.push('/inventory');
      }
      catch(e){
          setError("Erreur lors du traitement du fichier: \n" + e);
          setFormatErrorModal(true);
      }
  }


  const goToEditscreen = () => {

    let data = selectedFileData?.split(/\r?\n/);
    console.log(data?.length)
    console.log(data)
    router.push(`/details?fileData=${data}&fileUri=${selectedFileUri}&fileName=${selectedFileName}`);

  }


  //fermeture du modal
  const closeModal = () => {
      
    setFileErrorModalIsVisible(false);
    setNotFileModalIsVisible(false);
    setErrorModal(false);
    setFormatErrorModal(false);

  }


  return (
    <View className="flex items-center justify-center bg-[#eff5f7] h-full">
     <View className="flex flex-1 items-center justify-center">
        <Text className="text-xl mb-3 text-center"> Appuyer sur le bouton pour ouvrir une fiche d'inventaire </Text>
        <Button label="Ouvrir" icon="file-tray-full-outline" onPress={documentPicker} type="primary"/>
     </View>
      { selectedFileName ? (
        <View className="w-full ">
          <View className="flex flex-row gap-2 justify-between items-center bg-white p-3" >
            <Text className="text-xl flex-1 h-6 text-base overflow-x-scroll"> {selectedFileName}</Text>
            <Button label="Importer" icon="arrow-redo-circle-outline" onPress={importInventory} type="outline"/>
          </View>
          <ScrollView className="border border-t-1 border-gray-200 h-[250px] overflow-scroll bg-white" >
            <Text>{selectedFileData}</Text>
          </ScrollView>
        </View>
      ) : (
        <View></View>
      )}

      <ModalInfo icon={"warning"} iconColor="#ff9900" isVisible={fileErrorModalIsVisible} message="Vueillez selectionner un fichier texte (.txt) !" buttonText="OK" onClose={closeModal}/>
      <ModalInfo icon={"warning"} iconColor="#ff9900" isVisible={notFileModalIsVisible} message="Vous n'avez selectionné aucun fichier !" buttonText="Réessayer" onClose={closeModal}/>
      <ModalInfo icon={"error"} iconColor="#ff9900" isVisible={errorModal} message={error} buttonText="Réessayer" onClose={closeModal}/>
      <ModalInfo icon={"warning"} iconColor="#ff9900" isVisible={formatErrorModal} message={error} buttonText="Réessayer" onClose={closeModal}/>
      
    </View>
  );
}

const styles = StyleSheet.create({
 
})
