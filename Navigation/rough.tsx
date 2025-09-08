import NetInfo from "@react-native-community/netinfo";

export default function DispatchDrawernavigator() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const navigation = useContext(NavigationContext);

  

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F6A001" />
      </View>
    );
  }

  // 👇 agar offline hai toh seedha OfflineDashboard dikhana
  if (!isConnected) {
    return (
      <Drawer.Navigator
        initialRouteName="OfflineDashboard"
        screenOptions={{
          headerStyle: { backgroundColor: '#F6A001' },
          headerTintColor: '#fff',
        }}
      >
        <Drawer.Screen
          name="OfflineDashboard"
          component={OfflineDashboard}
          options={{
            title: 'Offline Dashboard',
            drawerIcon: ({ color, size }) => <Icon name="cloud-off" size={size} color={color} />
          }}
        />
      </Drawer.Navigator>
    );
  }

  // 👇 yeh part wahi rahega jo tumne StorageAdmin / Normal user ke liye banaya hai
  const initialRoute = profileData?.role === 'StorageAdmin' ? 'Direct and Normal' : 'RecieveDhasboard';

  return (
    <Drawer.Navigator
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
      {/* 👇 tumhara existing Drawer.Screens yaha honge */}
    </Drawer.Navigator>
  );
}
