import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Alert, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StatusBar, 
  ImageBackground, 
  Keyboard, 
  ActivityIndicator,
  Switch
} from 'react-native';
import { Text } from 'react-native-elements';
import apiClient from '../service/api/apiInterceptors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { screenWidth } from '../utils/Constants';
import { useTranslation } from 'react-i18next';
import Storage from '../utils/Storage';
import RNSmsRetriever from 'react-native-sms-retriever';

interface LoginAppProps {
  navigation: StackNavigationProp<any>;
}

interface LoginForm {
  mobileNo: string;
  password: string;
}

const LoginApp: React.FC<LoginAppProps> = ({ navigation }) => {
  const [form, setForm] = useState<LoginForm>({
    mobileNo: '9999999902',
    password: 'Pass@123'
  });

  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const { t } = useTranslation();

  const toggleSwitch = () => setIsOffline(prev => !prev);

  const handleChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const requestPhoneNumber = async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const number = await RNSmsRetriever.requestPhoneNumber();
      let formattedNumber = number.replace(/\D/g, '');
      if (formattedNumber.startsWith('91')) {
        formattedNumber = formattedNumber.substring(2);
      }
      handleChange('mobileNo', formattedNumber);
      setError(null);
    } catch (err) {
      setError("Phone number selection failed");
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const validateForm = (): boolean => {
    const { mobileNo, password } = form;
    if (!mobileNo || mobileNo.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return false;
    }
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const payload = { mobileNo: form.mobileNo, password: form.password };
      const response = await apiClient.post('/api/login/user', payload);

      const { token, role } = response.data;
      if (!token) throw new Error('Authentication token not received');

      await Storage.setString('userToken', token);
      await Storage.setString('userRole', role);

      navigation.reset({
        index: 0,
        routes: [{ name: 'DispatchDrawernavigator' }],
      });
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleNavigation = () => {
  //   if (isOffline) {
  //     navigation.navigate('DispatchDrawernavigator'); // ✅ direct offline navigation
  //   } else {
  //     handleLogin();
  //   }
  // };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F6A001" barStyle="light-content" />
      <View style={styles.phototcontainer}>
        <Image source={require('../assets/Ellipse7.png')} style={styles.topRightImage} />
      </View>
      
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <View style={styles.TextContainer}>
          <Text style={styles.logoText}>{t('loginTitle')}</Text>
          <Text style={styles.logoTextinner}>{t('loginSubtitle')}</Text>
        </View>
      </View>

      <ImageBackground
        source={require('../assets/Ellipse8.png')}
        style={styles.inputBackground}
        resizeMode="contain"
      >
        {/* ✅ Offline toggle */}
        {/* <View style={styles.offlinecontainer}>
          <Text style={styles.text}>Offline Mode</Text>
          <Switch
            trackColor={{ false: '#d3d3d3', true: '#F79B00' }}
            thumbColor={'#fff'}
            onValueChange={toggleSwitch}
            value={isOffline}
          />
        </View> */}

        <View style={styles.inputContainer}>
          <Icon name="phone" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder={t('mobilePlaceholder')}
            keyboardType="number-pad"
            autoCapitalize="none"
            value={form.mobileNo}
            onChangeText={(text) => handleChange('mobileNo', text)}
            maxLength={14}
            editable={!isOffline}
          />
          <TouchableOpacity onPress={requestPhoneNumber}>
            <Icon name={"arrow-right-bold"} size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder={t('passwordPlaceholder')}
            secureTextEntry={!passwordVisible}
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
            editable={!isOffline}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.containerone}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')}>
            <Text style={styles.linkText}>Forget Password</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={styles.view}>
        <TouchableOpacity 
          style={[styles.button, (isLoading) && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isOffline ? 'Offline' : t('loginButton')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {!keyboardVisible && (
        <View style={styles.photobottomtcontainer}>
          <Image source={require('../assets/Ellipse9.png')} style={styles.bottomLeftImage} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 20 },
  phototcontainer: { width: 80, height: 80, position: 'absolute', top: 0, right: 0 },
  topRightImage: { position: 'absolute', top: 0, right: 0, width: 80, height: 70 },
  logoContainer: { alignItems: 'center', marginBottom: -50, marginLeft: -170 },
  logo: { width: screenWidth * 0.5, height: screenWidth * 0.2, resizeMode: 'contain' },
  TextContainer: { width: screenWidth * 0.9, height: screenWidth * 0.2, paddingLeft: 90, position: 'relative', top: 30 },
  logoText: { fontSize: 20, color: '#333' },
  logoTextinner: { fontSize: 15, color: '#333' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F6A001', borderRadius: 28, paddingHorizontal: 20, marginVertical: 10, width: '100%', backgroundColor: '#ffffff', elevation: 14 },
  containerone: { padding: 20, alignItems: 'flex-end', width: '100%' },
  linkText: { color: 'red', fontSize: 16 },
  input: { flex: 1, height: 50, padding: 10, fontSize: 16 },
  icon: { marginRight: 10 },
  button: { width: '70%', height: 50, backgroundColor: '#F6A001', borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { backgroundColor: '#ccc', opacity: 0.7 },
  view: { width: '100%', height: 100, alignItems: 'center', justifyContent: 'center', marginTop: -70 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bottomLeftImage: { position: 'absolute', bottom: 1, left: '50%', transform: [{ translateX: -35 }] },
  photobottomtcontainer: { position: 'absolute', bottom: 0, left: 0, width: 25, height: 25, backgroundColor: '#F79B0099', borderBottomLeftRadius: 10 },
  inputBackground: { width: '100%', height: 350, justifyContent: 'center', alignItems: 'center' },
  offlinecontainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', position: 'relative', left: 100, bottom: 140 },
  text: { fontSize: 18, color: '#333' }
});

export default LoginApp;
