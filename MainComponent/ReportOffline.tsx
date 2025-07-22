import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { MMKV } from 'react-native-mmkv';
import Navbar from "../App/Navbar";
import Footer from "../App/Footer";
import { useTranslation } from 'react-i18next'; 

const ReportOffline = () => {
  const [offlineForms, setOfflineForms] = useState([]);
    const { t, i18n } = useTranslation();
  const storage = new MMKV();

  useEffect(() => {
    
    fetchOfflineData();

    const interval = setInterval(fetchOfflineData, 2000);

    return () => clearInterval(interval);
    
  }, []);

  const fetchOfflineData = () => {
    let existingData = storage.getString("offlineForms");
    let parsedData = existingData ? JSON.parse(existingData) : [];
    setOfflineForms(parsedData);
    console.log("Total Offline Forms:", parsedData.length);
  };

  const deleteForm = (index) => {
    let updatedForms = [...offlineForms];
    updatedForms.splice(index, 1);
    storage.set("offlineForms", JSON.stringify(updatedForms));
    setOfflineForms(updatedForms);
  };

  return (
    <View style={styles.mainContainer}> 
    <Navbar />
    <View style={styles.container}>
      <Text style={styles.header}>{t("OfflineSavedForms")} ({offlineForms.length})</Text>

      {offlineForms.length === 0 ? (
        <Text style={styles.emptyText}>No offline forms found.</Text>
      ) : (
        <>
          <TouchableOpacity style={styles.syncButton} onPress={fetchOfflineData}>
            <Text style={styles.syncText}>🔄 Refresh</Text>
          </TouchableOpacity>

          <FlatList
            data={offlineForms}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.card}>
                <Text style={styles.text}>{t("TruckNumber")}{item.truckNumber}</Text>
                <Text style={styles.text}> Date: {item.date}</Text>
                <Text style={styles.text}> Gross Weight: {item.grossWeight}</Text>
                <Text style={styles.text}> Bag Count: {item.bagCount}</Text>
                <Text style={styles.text}> Size: {item.size}</Text>
                <Text style={styles.text}>Staining Colour Percent: {item.stainingColourPercent}</Text>
                <Text style={styles.text}>Black Smut Percent: {item.BlackSmutPercent}</Text>
                <Text style={styles.text}>Sprouted Percent: {item.sproutedPercent}</Text>
                <Text style={styles.text}>Spoiled Percent: {item.spoiledPercent}</Text>
                <Text style={styles.text}> Onion Skin Percent: {item.onionSkinPercent}</Text>
                <Text style={styles.text}> Moisture Percent: {item.moisturePercent}</Text>
                <Text style={styles.text}> Spolied Percent: {item.SpoliedPercent}</Text>
                            <Text style={styles.text}> Spolied Comment: {item.SpoliedComment}</Text>

                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteForm(index)}>
                  <Text style={styles.deleteText}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: "#f5f5f5",
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

export default ReportOffline;
