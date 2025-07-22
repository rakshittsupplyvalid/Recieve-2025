import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { MMKV } from 'react-native-mmkv';
import Navbar from "../App/Navbar";
import Footer from "../App/Footer";
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../types/Type';
import { useTranslation } from 'react-i18next';

const SavedReport  = () => {
  const [offlineForms, setOfflineForms] = useState([]);
     const { t, i18n } = useTranslation();
  const storage = new MMKV();

    const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchOfflineData();

    // Auto-refresh every 2 seconds
    const interval = setInterval(fetchOfflineData, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchOfflineData = () => {
    let existingData = storage.getString("offlineForms");
    let parsedData = existingData ? JSON.parse(existingData) : [];
    setOfflineForms(parsedData);
   
  };

 
  return (
    <View style={styles.mainContainer}> 
    <Navbar />
    <View style={styles.container}>
      

      {offlineForms.length === 0 ? (
        <Text style={styles.emptyText}>No offline forms found.</Text>
      ) : (
        <>
          <FlatList
            data={offlineForms}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => navigation.navigate("SubmitTruckData",
                   {  truckData: item ,
                    date: item,
                    grossWeight : item ,
                    bagCount : item ,
                    size: item ,
                    stainingColourPercent : item,
                    BlackSmutPercent : item,
                    sproutedPercent : item ,
                    spoiledPercent : item ,
                    onionSkinPercent : item ,
                    moisturePercent : item ,
                    SpoliedPercent : item ,
                    SpoliedComment : item ,
                    Branchpersonname : item ,
                    imageurl : item ,
                } )}>
                <View style={styles.card}>
                  <Text style={styles.text}>🚛 {t('TruckNumber')} : {item.truckNumber}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
    <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
  },
  syncButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  syncText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  text: {
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: "#FF3B30",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default SavedReport;
