import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../types/Type';
import Navbar from '../App/Navbar';
import Footer from '../App/Footer';
import { MMKV } from 'react-native-mmkv';


const OfflineDashboard = () => {
  
    const [offlineForms, setOfflineForms] = useState([]);
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

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ReportOffline")}>
            {/* Top Right Corner */}
            <View style={styles.topRightCorner} />
      
            <Text style={styles.cardTitle}>offline Reports</Text>
             <Text style={styles.cardDescription}> Count {offlineForms.length}</Text>
            
          
            {/* Bottom Left Corner */}
            <View style={styles.bottomLeftCorner} />
          </TouchableOpacity>


    </View>
   <Footer />
   </View>

  );
};

const styles = StyleSheet.create({
  container: {
    
   
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  card: {
    
    padding: 25,
    margin: 10,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    height: 160,
    width : 180,
    justifyContent: 'center',
    backgroundColor: 'white',

  },
  cardTitle: {
    fontSize: 17,
    color: 'black',
    marginTop: 10,
    width: 150,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: 'black',
    marginTop: 5,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginTop: 5,
    textAlign: 'center',
  },
  iconContainer: {
    backgroundColor: "#F79B0099",
    padding: 10,
    borderRadius: 50,
  },
  topRightCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 25,
    height: 25,
    backgroundColor: '#F79B0099',
    borderTopRightRadius: 10,
  },
  bottomLeftCorner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 25,
    height: 25,
    backgroundColor: '#F79B0099',
    borderBottomLeftRadius: 10,
  },

});

export default OfflineDashboard;
