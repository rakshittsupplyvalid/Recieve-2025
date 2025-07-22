import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from "@react-native-community/netinfo";
import GenerateHealthReport from '../Screenthree/GenerateHealthReport';
import HealthReportlist from '../Screenthree/HealthReportlist';
import DispatchReportlist from '../Screenthree/DispatchReportlist';
import RecieveDhasboard from '../Screenthree/RecieveDhasboard';
import Dispatchlist from '../Screenthree/Dispatchlist';
import Recievelist from '../Screenthree/Recievelist';
import ReimbursementForm from '../Screenthree/ReimbursementForm';
import OfflineForm from '../Screenthree/OfflineForm';
import api from '../service/api/apiInterceptors';
import ReportOffline from '../MainComponent/ReportOffline';
import SavedReport from '../Screenthree/SavedReport';
import OfflineDashboard from '../Screenthree/OfflineDhasboard';
import SubmitTruckData from '../Screenthree/SubmitTruckData';
import LanguageSelector from '../Screenthree/Languages';
import ReimbursementList from '../Screenthree/ReimbursementList';

import { useTranslation } from 'react-i18next';

const Drawer = createDrawerNavigator();

export default function DispatchDrawernavigator() {
  const [isConnected, setIsConnected] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();

  const localizedName = t('dispatchTruckList');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);

    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (): Promise<void> => {
    try {
      const response = await api.get('/api/user/profile');
      setProfileData(response.data);

    } catch {
      console.log('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);
  return (
    <Drawer.Navigator
      id={undefined}
      drawerContent={(props) => <CustomDrawerContent {...props} profileData={profileData} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#FFFFFF', width: 290 },
        drawerActiveTintColor: '#6200EE',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: { fontSize: 16, fontWeight: 'bold' },
      }}
    >
      {!isConnected ? (
        <>
          <Drawer.Screen
            name={t('offlineDashboard')}
            component={OfflineDashboard}
            options={{
              headerShown: false,
              drawerIcon: ({ color, size }) => <Icon name="dashboard" size={size} color={color} />,
            }}
          />

          <Drawer.Screen
            name={t('offlineForm')}
            component={OfflineForm}
            options={{
              headerShown: false,
              drawerIcon: ({ color, size }) => <Icon name="assignment" size={size} color={color} />,
            }}
          />

          <Drawer.Screen
            name={t('Reportoffline')}
            component={ReportOffline}
            options={{

              headerShown: false,
              drawerIcon: ({ color, size }) => <Icon name="insert-chart" size={size} color={color} />,
            }}
          />
        </>
      ) : (
        <>

          <Drawer.Screen
            name={t('dashboard')} // ✅ keep this constant
            component={RecieveDhasboard}
            options={{
              title: t('dashboard'), // ✅ localized title shown in drawer
              headerShown: false,
              drawerIcon: ({ color, size }) => <Icon name="dashboard" size={size} color={color} />,
            }}
          />


          <Drawer.Screen
            name={t('generateHealthReport')}
            component={GenerateHealthReport}
            options={{
              headerShown: false,
              drawerIcon: ({ color, size }) => <Icon name="health-and-safety" size={size} color={color} />,
            }}
          />
          <Drawer.Screen
            name={t('healthReportList')}
            component={HealthReportlist}
            options={{
              headerShown: false,
              drawerIcon: ({ color, size }) => <Icon name="medical-services" size={size} color={color} />,
            }}
          />
          <Drawer.Screen
            name={t('dispatchReportList')}
            component={DispatchReportlist}
            options={{
              headerShown: false,
              drawerIcon: ({ color, size }) => <Icon name="assignment" size={size} color={color} />,
            }}
          />
          <Drawer.Screen
            name={t('dispatchTruckList')}
            component={Dispatchlist}
            options={{
              headerShown: false,
              drawerIcon: ({ color, size }) => <Icon name="local-shipping" size={size} color={color} />,
            }}
          />
          <Drawer.Screen
            name= {t('receiveTruckList')}
            component={Recievelist}
            options={{
          
              headerShown: false,
              drawerIcon: ({ color, size }) => <Icon name="move-to-inbox" size={size} color={color} />,
            }}
          />

          <Drawer.Screen
            name={t('reimbursementForm')}
            component={ReimbursementForm}
            options={{
              headerShown: false,
              drawerIcon: ({ color, size }) => (
                <Icon name="receipt" size={size} color={color} /> // Better suited for a reimbursement form
              ),
            }}
          />

          <Drawer.Screen
            name={t('savedReport')}
            component={SavedReport}
            options={{
              headerShown: false,
              drawerIcon: ({ color, size }) => (
                <Icon name="save-alt" size={size} color={color} /> // Indicates saved reports
              ),
            }}
          />


          <Drawer.Screen
            name="SubmitTruckData"
            component={SubmitTruckData}
            options={{
              headerShown: false,
              drawerItemStyle: { display: 'none' }, // 👈 this hides the item from drawer
            }}
          />

          <Drawer.Screen
            name="ReimbursementList"
            component={ReimbursementList}
            options={{
              headerShown: false,
              drawerItemStyle: { display: 'none' }, // 👈 this hides the item from drawer
            }}
          />



          <Drawer.Screen
            name={t('languageSelector')}
            component={LanguageSelector}
            options={{
              headerShown: false,
              drawerIcon: ({ color, size }) => (
                <Icon name="language" size={size} color={color} />
              ),
            }}
          />


        </>
      )}
    </Drawer.Navigator>
  );
}

function CustomDrawerContent(props: any) {
  const { profileData } = props;

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerFooter}>
        <Image source={require('../assets/profile.jpg')} style={styles.image} />
        <Text style={styles.footerText}>{profileData?.name || 'User Name'}</Text>

      </View>

      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
  },
  offlineText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#721c24',
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
});
