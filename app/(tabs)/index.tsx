import { Text, View, StyleSheet, Pressable, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker"
import Button from "@/components/button";
import { useState } from "react";
import * as FileSystem from 'expo-file-system';
import { useRouter, Link, useNavigation } from "expo-router";
import ModalInfo from "@/components/modal";


export default function Index() {

  const router = useRouter();
  const navigation = useNavigation();

  const [selectedFileUri, setSelectedFileUri] = useState<string>();
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>();
  const [selectedFileData, setSelectedFileData] = useState<string | undefined>();
  let [fileErrorModalIsVisible, setFileErrorModalIsVisible] = useState<boolean>(false);
  let [notFileModalIsVisible, setNotFileModalIsVisible] = useState<boolean>(false);
  let [errorModal, setErrorModal] = useState<boolean>(false);
  let [error, setError] = useState<any>();

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

  }


  return (
    <View className="flex items-center justify-center bg-[#eff5f7] h-full">
     <View className="flex items-center justify-center h-80 pb-24">
        <Text className="text-xl mb-3 text-center"> Appuyer sur le bouton pour ouvrir une fiche d'inventaire </Text>
        <Button label="Ouvrir" icon="file-tray-outline" onPress={documentPicker} type="primary"/>
        {/* <Text style={styles.text}>fichier selectionné: {selectedFileName}</Text> */}
      </View>
      { selectedFileName ? (
        <View className="w-full absolute bottom-0">
          <View className="flex flex-row justify-between items-center bg-white p-3" >
            <Text className="text-xl w-[50%]"> { selectedFileName.length > 16 ? selectedFileName.slice(0, 18) : selectedFileName}... </Text>
            <Button label="Editer" icon="pencil-sharp" onPress={goToEditscreen} type="outline"/>
          </View>
          <ScrollView className="border border-t-1 border-gray-200 max-h-[250px] overflow-scroll bg-white" >
            <Text>{selectedFileData}</Text>
          </ScrollView>
        </View>
      ) : (
        <View></View>
      )}

      <ModalInfo icon={"warning"} iconColor="#ff9900" isVisible={fileErrorModalIsVisible} message="Vueillez selectionner un fichier texte (.txt) !" buttonText="OK" onClose={closeModal}/>
      <ModalInfo icon={"warning"} iconColor="#ff9900" isVisible={notFileModalIsVisible} message="Vous n'avez selectionné aucun fichier !" buttonText="Réessayer" onClose={closeModal}/>
      <ModalInfo icon={"error"} iconColor="#ff9900" isVisible={errorModal} message={error} buttonText="Réessayer" onClose={closeModal}/>
    </View>
  );
}

const styles = StyleSheet.create({
 
})
