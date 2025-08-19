import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, TextInput, TouchableOpacity, Image, StatusBar, ImageBackground, Keyboard, Switch, Button } from 'react-native';
import { Text } from 'react-native-elements';
import apiClient from '../service/api/apiInterceptors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { screenWidth } from '../utils/Constants';
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from 'react-i18next';
import useForm from '../service/UseForm';
import Storage from '../utils/Storage';



interface LoginAppProps {
  navigation: StackNavigationProp<any>;
}

const LoginApp: React.FC<LoginAppProps> = ({ navigation }) => {
  const { state, updateState } = useForm();
  const [isConnected, setIsConnected] = useState(true);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const isOffline = !isConnected;


  useEffect(() => {
    updateState({
      form: {
        mobileNo: '9999999902',
        password: 'Password@123'
      }
    });
  }, []);


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (field: string, value: string) => {
    updateState({
      form: {
        ...state.form,
        [field]: value
      }
    });
  };

  const handleLogin = async () => {
    const { mobileNo, password } = state.form;

    // if (!mobileNo || !password) {
    //   Alert.alert('Error', 'Please enter both mobile number and password');
    //   return;
    // }

    // if (mobileNo.length !== 10) {
    //   Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
    //   return;
    // }

    setIsLoading(true);
    try {
      const payload = {
        mobileNo,
        password
      }
      const response = await apiClient.post('/api/login/user', payload);

      console.log('Login response:', response.data);

      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Login failed');
      }

      const { token, role } = response.data; // Assuming your API returns the role







      if (!token) {
        throw new Error('Authentication token not received');
      }

      Storage.setString('userToken', token);
      Storage.setString('userRole', role);
      console.log('Login successful, token:', token);


      if (role === 'GradeUser' || role === 'StorageAdmin') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'DispatchDrawernavigator' }],
        });
      }

    } catch (error: any) {
      console.error('Login error:', error);

      // Check if it's an Axios error with a response
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        console.log('Error response headers:', error.response.headers);

        Alert.alert(
          'Login Failed',
          error.response.data?.message || 'Something went wrong on the server.'
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.log('No response received:', error.request);

        Alert.alert(
          'Network Error',
          'No response received from server. Please check your internet connection.'
        );
      } else {
        // Something happened in setting up the request
        console.log('Error message:', error.message);

        Alert.alert(
          'Error',
          error.message || 'An unexpected error occurred.'
        );
      }
    }
    finally {
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
            // value={isOffline ? '' : mobileNo}
            // onChangeText={setMobileno}
            value={state.form?.mobileNo || ''}
            onChangeText={(text) => handleChange('mobileNo', text)}
            maxLength={10}
            editable={!isOffline} // Disable input when offline
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder={t('passwordPlaceholder')}
            secureTextEntry={!passwordVisible}
            // value={isOffline ? '' : password}
            // onChangeText={setPassword}
            value={state.form?.password || ''}
            onChangeText={(text) => handleChange('password', text)}
            editable={!isOffline}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#666" />
          </TouchableOpacity>
        </View>


        {/* <View style={{ alignItems: 'flex-end', width: '100%', paddingHorizontal: 20 }}>
          <TouchableOpacity  onPress={() => navigation.navigate('ForgetPassword', { mobileNo })}>
            <Text style={styles.footerText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>
        </View>
 */}

        {/* <View style={{ alignItems: 'flex-end', width: '100%', paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.navigate('OfflineForm')}>
            <Text style={styles.footerText}>Offline Form</Text>
          </TouchableOpacity>
        </View> */}
        {/* 
        <Button title="Hindi" onPress={() => i18n.changeLanguage('hi')} />
<Button title="English" onPress={() => i18n.changeLanguage('en')} /> */}


      </ImageBackground>


      <View style={styles.view}>
        <TouchableOpacity style={styles.button} onPress={handleLogin} >
          <Text style={styles.buttonText}>{isOffline ? t('offlineButton') : t('loginButton')}</Text>

        </TouchableOpacity>


      </View>

      {/* Conditionally render the image when keyboard is not visible */}
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
    backgroundColor: '#F79B0099', // Orange color
    borderBottomLeftRadius: 10,


  },

  inputBackground: {
    width: '100%',
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlinecontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',

    position: 'relative',
    left: 100,
    bottom: 140

  },
  text: {
    fontSize: 18,

    color: '#333',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  }
});

export default LoginApp;
