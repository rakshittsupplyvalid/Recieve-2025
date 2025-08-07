import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../service/api/apiInterceptors';
import RecieveDhasboard from '../Screenthree/RecieveDhasboard';
import { NavigationContext } from '@react-navigation/native';
import { MMKV } from 'react-native-mmkv';
import HealthReport from '../src/HealthReportlist/HealthReportlist';
import DispatchReportlist from '../Screenthree/DispatchReportlist';
import Dispatchlist from '../Screenthree/Dispatchlist';
import Recievelist from '../Screenthree/Recievelist';
import ReimbursementForm from '../Screenthree/ReimbursementForm';
import SavedReport from '../Screenthree/SavedReport';
import SubmitTruckData from '../Screenthree/SubmitTruckData';
import LanguageSelector from '../Screenthree/Languages';
import ReimbursementList from '../Screenthree/ReimbursementList';
import HealthReportDetails from '../src/HealthReportlist/HealthReportDeails';
import TestForm from '../src/GenerateHealthReport/GenerateHealthReports';
import LotDetailsApproved from '../src/LotDetails/LotDetailsApproved';
import DirectNormal from '../src/Directandnormal/DirectNormal';
import StockMove from '../src/StockMove/StockMove';
import RecieveStockmove from '../src/StockMove/RecieveStockmove';
import RejectStockmove from '../src/StockMove/RejectStockmove';

const Drawer = createDrawerNavigator();

const storage = new MMKV();

export default function DispatchDrawernavigator() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useContext(NavigationContext);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/user/profile');
      setProfileData(response.data);
    } catch (error) {
      console.log('Error fetching profile data:', error);
      setProfileData({
        role: 'SvUser',
        name: 'User'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F6A001" />
      </View>
    );
  }

  const initialRoute = profileData?.role === 'StorageAdmin' ? 'Direct and Normal' : 'RecieveDhasboard';

  return (
    <Drawer.Navigator
      id={undefined}
      initialRouteName={initialRoute}
      drawerContent={(props) => (
        <CustomDrawerContent
          {...props}
          profileData={profileData}
          onLogoutPress={handleLogoutPress}
        />
      )}
      screenOptions={{
        headerStyle: { backgroundColor: '#F6A001' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#FFFFFF', width: 290 },
        drawerActiveTintColor: '#F6A001',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: { fontSize: 16, fontWeight: 'bold' },
      }}
    >
      {profileData?.role === 'StorageAdmin' ? (

        <>
          {/* 
          <Drawer.Screen
            name="License Plate Scanner"
            component={LicensePlateScanner}
            options={{
              title: 'Vendor Panel',
              drawerIcon: ({ color, size }) => <Icon name="person" size={size} color={color} />,
            }}
          /> */}



          
          <Drawer.Screen
            name="Direct and Normal"
            component={DirectNormal}
            options={{
              title: 'Direct and Normal',
              drawerIcon: ({ color, size }) => <Icon name="person" size={size} color={color} />,
            }}
          />

            <Drawer.Screen
            name="Recieve Stockmove"
            component={RecieveStockmove}
            options={{
               headerShown: false,
              title: 'Direct and Normal',
              drawerIcon: ({ color, size }) => <Icon name="person" size={size} color={color} />,
                 drawerItemStyle: { display: 'none' }
            }}

          />


           <Drawer.Screen
            name="Reject Stockmove"
            component={RejectStockmove}
            options={{
               headerShown: false,
              title: 'Direct and Normal',
              drawerIcon: ({ color, size }) => <Icon name="person" size={size} color={color} />,
                 drawerItemStyle: { display: 'none' }
            }}
          />


          <Drawer.Screen
            name="LotDetailsApproved"
            component={LotDetailsApproved}
            options={{
              title: 'Lot Details',
              drawerIcon: ({ color, size }) => <Icon name="person" size={size} color={color} />,
                drawerItemStyle: { display: 'none' }
            }}
          />


          <Drawer.Screen
            name="StockMove"
            component={StockMove}
            options={{
              title: 'StockMove',
              drawerIcon: ({ color, size }) => <Icon name="person" size={size} color={color} />,
              drawerItemStyle: { display: 'none' }
            }}
          />


        </>



      ) : (
        <>
          <Drawer.Screen name="RecieveDhasboard" component={RecieveDhasboard} options={{ headerShown: false, title: 'Dashboard', drawerIcon: ({ color, size }) => <Icon name="dashboard" size={size} color={color} /> }} />
          <Drawer.Screen name="GenerateHealthReport"
            component={TestForm}
            options={{
              headerShown: false,
              drawerIcon: ({ color, size }) => <Icon name="health-and-safety" size={size} color={color} />
            }}
          />
          <Drawer.Screen name="HealthReportlist" component={HealthReport} options={{ headerShown: false, drawerIcon: ({ color, size }) => <Icon name="medical-services" size={size} color={color} /> }} />
          <Drawer.Screen name="DispatchReportlist" component={DispatchReportlist} options={{ headerShown: false, drawerIcon: ({ color, size }) => <Icon name="assignment" size={size} color={color} /> }} />
          <Drawer.Screen name="Dispatchlist" component={Dispatchlist} options={{ headerShown: false, drawerIcon: ({ color, size }) => <Icon name="local-shipping" size={size} color={color} /> }} />
          <Drawer.Screen name="Recievelist" component={Recievelist} options={{ headerShown: false, drawerIcon: ({ color, size }) => <Icon name="move-to-inbox" size={size} color={color} /> }} />
          <Drawer.Screen name="ReimbursementForm" component={ReimbursementForm} options={{ headerShown: false, drawerIcon: ({ color, size }) => <Icon name="receipt" size={size} color={color} /> }} />
          <Drawer.Screen name="SavedReport" component={SavedReport} options={{ headerShown: false, drawerIcon: ({ color, size }) => <Icon name="save-alt" size={size} color={color} /> }} />
          <Drawer.Screen name="LanguageSelector" component={LanguageSelector} options={{ headerShown: false, drawerIcon: ({ color, size }) => <Icon name="language" size={size} color={color} /> }} />
          {/* Hidden Screens */}
          <Drawer.Screen name="SubmitTruckData" component={SubmitTruckData} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="ReimbursementList" component={ReimbursementList} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="HealthReportDetails" component={HealthReportDetails} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
        </>
      )}
    </Drawer.Navigator>
  );
}

function CustomDrawerContent(props: any) {
  const { profileData, onLogoutPress } = props;

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerFooter}>
          <Image source={require('../assets/profile.jpg')} style={styles.image} />
          <Text style={styles.footerText}>{profileData?.name || 'User Name'}</Text>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={onLogoutPress} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="#F6A001" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerFooter: {
    marginTop: 30,
    padding: 10,
    marginBottom: 40,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  logoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#F6A001',
  },
});