      import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from "@react-native-community/netinfo";
import GenerateHealthReport from '../Screenthree/GenerateHealthReport';
// import HealthReport from '../src/HealthReportlist/HealthReportlist';
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
import HealthReportDetails from '../src/HealthReportlist/HealthReportDeails';
import { useTranslation } from 'react-i18next';

const Drawer = createDrawerNavigator();

export default function DispatchDrawernavigator() {
  const [isConnected, setIsConnected] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();

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
    } catch (error) {
      console.log('Error fetching profile data:', error);
      // Provide default profile data if fetch fails
      setProfileData({
        role: 'SvUser', // Default role
        name: 'User'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Function to render drawer screens based on user role
  const renderDrawerScreens = () => {
 

    // If no profile data (shouldn't happen due to default above, but just in case)
    if (!profileData) {
      return (
        <Drawer.Screen
          name="Error"
          component={() => (
            <View style={styles.loadingContainer}>
              <Text>Unable to load user data</Text>
            </View>
          )}
          options={{ drawerItemStyle: { display: 'none' } }}
        />
      );
    }

    // For SvUser role
    if (profileData.role === 'SvUser') {
      return (
        <>
          <Drawer.Screen
            name="RecieveDhasboard"
            component={RecieveDhasboard}
            options={{
              title: "RecieveDhasboard",
              headerShown: false,
              drawerIcon: ({ color, size }) => <Icon name="dashboard" size={size} color={color} />,
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
      );
    }

    // For offline mode
    if (!isConnected) {
      return (
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
      );
    }

    // Default screens for other roles when online
    return (
      <>
        <Drawer.Screen
          name="RecieveDhasboard"
          component={RecieveDhasboard}
          options={{
            title: t('dashboard'),
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
          name="HealthReportlist"
          component={HealthReport}
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
          name={t('receiveTruckList')}
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
              <Icon name="receipt" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name={t('savedReport')}
          component={SavedReport}
          options={{
            headerShown: false,
            drawerIcon: ({ color, size }) => (
              <Icon name="save-alt" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="SubmitTruckData"
          component={SubmitTruckData}
          options={{
            headerShown: false,
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="ReimbursementList"
          component={ReimbursementList}
          options={{
            headerShown: false,
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="HealthReportDetails"
          component={HealthReportDetails}
          options={{
            headerShown: false,
            drawerItemStyle: { display: 'none' },
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
    );
  };

  return (
    <Drawer.Navigator
     id ={undefined}
      initialRouteName="RecieveDhasboard"
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
      {renderDrawerScreens()}
    </Drawer.Navigator>
  );
}

function CustomDrawerContent(props: any) {
  const { profileData } = props;

  if (!profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
