import React, { useContext } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContext } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MMKV } from 'react-native-mmkv';
import { useTranslation } from 'react-i18next';


// Initialize MMKV
const storage = new MMKV();

const Navbar: React.FC = () => {
  const navigation = useContext(NavigationContext);
  const { t, i18n } = useTranslation();

  const currentRouteName = navigation?.getState()
    .routes[navigation.getState().index]
    .name.replace(/([a-z])([A-Z])/g, '$1 $2');


  const localizedRouteName = t(currentRouteName);

  const handleMenuPress = () => {
    if (navigation) {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };

  const handleLogoutPress = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: processLogout },
    ]);
  };

  const processLogout = () => {
    try {
      storage.delete('userToken');
      console.log('User logged out successfully');
      if (navigation) {
        navigation.reset({ routes: [{ name: 'LoginApp' }] });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleMenuPress} style={styles.leftComponent}>
          <MaterialIcons name="menu" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={styles.centerComponent}>
          <Text style={styles.headerTitle}>{localizedRouteName}</Text>
        </View>
         
         {/* <TouchableOpacity  onPress={() => navigation.navigate("LanguageSelector")}  style={styles.rightComponent}>
          <MaterialIcons name="language" size={20} color="#fff" />
        </TouchableOpacity> 
        */}
        <TouchableOpacity onPress={handleLogoutPress} style={styles.rightComponent}>
          <MaterialIcons name="logout" size={20} color="#fff" />
        </TouchableOpacity>


      </View>
      <View>

      </View >

      <View style={styles.container}>

        <View style={styles.containertwo}>


          <Text style={styles.navbarText}>{currentRouteName}</Text>

        </View>

        <View style={styles.circleBackground} />
      </View>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F79B00',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  leftComponent: {
    flex: 1,
  },
  centerComponent: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightComponent: {
    flex: 0.9,



  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',

  },

  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white'
  },
  containertwo: {
    width: 250,
    height: 100,

    padding: 30,


  },
  navbarText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: 'black',
    textTransform: 'uppercase',
  },
  navbarInnerText: {
    width: 250,

  },
  circleBackground: {
    backgroundColor: '#F6A00191',
    width: 90,
    height: 90,
    borderRadius: 50,
    position: 'absolute', // Absolute position taaki upar aaye
    top: -30, // Adjust as needed
    right: -40,




  },


});

export default Navbar;
