import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, TextInput, TouchableOpacity, Image, StatusBar, ImageBackground, Keyboard } from 'react-native';
import { Text } from 'react-native-elements';
import api from '../service/api/apiInterceptors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack'; 
import { screenWidth } from '../utils/Constants'  ;
import {useTranslation} from 'react-i18next';

interface ForgetPasswordProps {
  navigation: StackNavigationProp<any>;
  route: any;
}

const ForgetPassword: React.FC<ForgetPasswordProps> = ({ navigation, route }) => {
  const [mobileno, setMobileno] = useState('');
     const [otp, setOtp] = useState('');
         const [newPassword, setNewPassword] = useState('');
             const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
      const [keyboardVisible, setKeyboardVisible] = useState(false);
        const { t ,  i18n } = useTranslation();


  useEffect(() => {
    if (route?.params?.mobileno) {
      setMobileno(route.params.mobileno);
    }
  }, [route]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const requestOtp = async (): Promise<void> => {
    try {
      const response = await api.get('/api/user/forgotpassword/otp', {
        params: { mobile: mobileno },
      });
      if (response.data) {
        Alert.alert('OTP Sent', 'Please check your mobile for the OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const resetPassword = async (): Promise<void> => {
    if (!mobileno || !otp || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter all required fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    try 
    {
      const response = await api.put('/api/user/forgotpassword/reset',{
        mobile: mobileno,
        otp,
        newpassword: newPassword,
        confirmpassword: confirmPassword,
      });

      if (response.data) {
        Alert.alert('Success', 'Your password has been reset successfully.');
        setMobileno('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        navigation.navigate('Login'); // Redirect to login screen
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F6A001" barStyle="light-content" />
      <View style={styles.phototcontainer}>
        <Image source={require('../assets/Ellipse7.png')} style={styles.topRightImage} />
      </View>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.logoText}>Forget Password</Text>
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
            value={mobileno}
            onChangeText={setMobileno}
            maxLength={10}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={requestOtp}>
          <Text style={styles.buttonText}>{t('RequestOTP')}</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Icon name="key" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder={t('EnterOtp')}
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder={t('NewPassword')}
            secureTextEntry={!passwordVisible}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#666" />
          </TouchableOpacity>
        </View>

           <View style={styles.inputContainer}>
            <Icon name="lock-check" size={20} color="#666" style={styles.icon} />
            <TextInput
             style={styles.input}
             placeholder={t('confirmPassword')}
             secureTextEntry={!passwordVisible}
             value={confirmPassword}
             onChangeText={setConfirmPassword}
             />
            </View>

        <TouchableOpacity style={styles.button} onPress={resetPassword}>
          <Text style={styles.buttonText}>{t('ResetPassword')}</Text>
        </TouchableOpacity>
        </ImageBackground>

      {!keyboardVisible && (
        <View style={styles.photobottomtcontainer}>
          <Image source={require('../assets/Ellipse9.png')} />
        </View>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('LoginApp')}>
        <Text >{t('BacktoLogin')}</Text>
      </TouchableOpacity>
    </View>
  );
};



const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 20, justifyContent: 'center' },

  
  phototcontainer: { width: 80, height: 80, position: 'absolute', top: 0, right: 0 },
  topRightImage: { position: 'absolute', top: 0, right: 0, width: 80, height: 70 },
  
  logoContainer: { alignItems: 'center', marginBottom: -50 },
  
  logo: { width: screenWidth * 0.5, height: screenWidth * 0.2, resizeMode: 'contain' },
  
  logoText: { fontSize: 21, fontWeight: 'bold', color: '#333', marginTop: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F6A001', borderRadius: 28, paddingHorizontal: 10, marginVertical: 10, width: '100%', backgroundColor: '#ffffff', elevation: 14 },
  input: { flex: 1, height: 50, padding: 10, fontSize: 16 },
  icon: { marginRight: 10 },
  button: { width: '70%', height: 50, backgroundColor: '#F6A001', borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  photobottomtcontainer: { position: 'absolute', bottom: 1, left: 0, transform: [{ translateX: -42 }], width: 60, height: 60 },
  inputBackground: { width: '100%', height: 450, justifyContent: 'center', alignItems: 'center' },
});

export default ForgetPassword;
