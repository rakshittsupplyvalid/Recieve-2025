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
  ActivityIndicator 
} from 'react-native';
import { Text } from 'react-native-elements';
import apiClient from '../service/api/apiInterceptors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { screenWidth } from '../utils/Constants';
import NetInfo from "@react-native-community/netinfo";
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
  // Simple state management using useState
  const [form, setForm] = useState<LoginForm>({
    mobileNo: '',
    password: ''
  });
  const [isConnected, setIsConnected] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const isOffline = !isConnected;

  // Pre-fill form for testing (optional)
  useEffect(() => {
    setForm({
      mobileNo: '9999999902',
      password: 'Password@123'
    });
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Simple form update function
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
      console.log("Phone Number: ", number);
      
      // Remove non-digits and the country code (91)
      let formattedNumber = number.replace(/\D/g, '');
      
      // Remove the country code (91) if present at the beginning
      if (formattedNumber.startsWith('91')) {
        formattedNumber = formattedNumber.substring(2);
      }
      
      handleChange('mobileNo', formattedNumber);
      setError(null);
    } catch (err) {
      console.log("Error: ", err);
      setError("Phone number selection failed");
      Alert.alert('Error', 'Could not retrieve phone number');
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
      const payload = {
        mobileNo: form.mobileNo,
        password: form.password
      };

      // Add timeout to prevent hanging requests
      const response = await Promise.race([
        apiClient.post('/api/login/user', payload),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);

      console.log('Login response:', response);

      // Type assertion to fix compile error
      const { token, role } = (response as { data: { token: string; role: string } }).data;

      if (!token) {
        throw new Error('Authentication token not received');
      }

      await Storage.setString('userToken', token);
      await Storage.setString('userRole', role);
      console.log('Login successful, token:', token);

      if (role === 'GradeUser' || role === 'StorageAdmin') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'DispatchDrawernavigator' }],
        });
      }

    } catch (error: any) {
      console.error('Login error:', error);

      if (error.message === 'Request timeout') {
        Alert.alert('Timeout', 'The request took too long. Please check your connection.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        Alert.alert('Network Error', 'Please check your internet connection');
      } else if (error.response?.status === 400) {
        Alert.alert('Login Failed', 'Invalid credentials or server issue');
      } else if (error.response?.status === 401) {
        Alert.alert('Login Failed', 'Invalid username or password');
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      </ImageBackground>

      <View style={styles.view}>
        <TouchableOpacity 
          style={[styles.button, (isLoading || isOffline) && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading || isOffline}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isOffline ? t('offlineButton') : t('loginButton')}
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  phototcontainer: {
    width: 80,
    height: 80,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  topRightImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 80,
    height: 70,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: -50,
    marginLeft: -170,
  },
  logo: {
    width: screenWidth * 0.5,
    height: screenWidth * 0.2,
    resizeMode: 'contain',
  },
  TextContainer: {
    width: screenWidth * 0.9,
    height: screenWidth * 0.2,
    paddingLeft: 90,
    position: 'relative',
    top: 30,
  },
  logoText: {
    fontSize: 20,
    color: '#333',
  },
  logoTextinner: {
    fontSize: 15,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F6A001',
    borderRadius: 28,
    paddingHorizontal: 20,
    marginVertical: 10,
    width: '100%',
    backgroundColor: '#ffffff',
    elevation: 14,
  },
  input: {
    flex: 1,
    height: 50,
    padding: 10,
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
  },
  button: {
    width: '70%',
    height: 50,
    backgroundColor: '#F6A001',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  view: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -70,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 15,
    color: 'red',
    fontSize: 14,
  },
  bottomLeftImage: {
    position: 'absolute',
    bottom: 1,
    left: '50%',
    transform: [{ translateX: -35 }],
  },
  photobottomtcontainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 25,
    height: 25,
    backgroundColor: '#F79B0099',
    borderBottomLeftRadius: 10,
  },
  inputBackground: {
    width: '100%',
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginApp;