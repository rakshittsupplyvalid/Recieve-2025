import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import SmsRetriever from 'react-native-sms-retriever';

const OTPLoginScreen = () => {
  const [otp, setOtp] = useState('');
  const [hash, setHash] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Get the App Hash (required for sending SMS with hash)
  useEffect(() => {
    const fetchHash = async () => {
      try {
        const appHash = await  (SmsRetriever as any).getAppHash();
        setHash(appHash);
        console.log('App Hash:', appHash);
      } catch (error) {
        console.log('Hash error:', error);
      }
    };
    fetchHash();
  }, []);

  // Generate OTP locally and simulate sending SMS from server (manually)
  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    setGeneratedOtp(otp);
    Alert.alert(
      'Simulated SMS to be sent manually',
      `Send this OTP to your mobile number manually:\n\n"${otp} is your OTP for login.\n${hash}"`
    );
  };

  const startListening = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        SmsRetriever.addSmsListener(event => {
          console.log('SMS Received:', event.message);
          const otpMatch = event.message.match(/(\d{4,6})/); // extract 4-6 digit OTP
          if (otpMatch) {
            const received = otpMatch[0];
            setOtp(received);
            validateOtp(received);
          }
          SmsRetriever.removeSmsListener();
        });
      }
    } catch (error) {
      console.log('Error in SMS Retriever:', error);
    }
  };

  const validateOtp = (receivedOtp) => {
    if (receivedOtp === generatedOtp) {
      Alert.alert('✅ OTP Validated');
    } else {
      Alert.alert('❌ Invalid OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Mobile Number:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        keyboardType="phone-pad"
      />

      <Button title="Generate OTP (Locally)" onPress={generateOtp} />

      <Text style={styles.label}>Received OTP:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
      />

      <Button title="Start Listening for OTP" onPress={startListening} />
      <Button title="Validate OTP" onPress={() => validateOtp(otp)} />

      <Text style={styles.hashText}>App Hash: {hash}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 8,
    marginBottom: 15,
    borderRadius: 5
  },
  hashText: {
    marginTop: 20,
    fontSize: 12,
    color: 'gray'
  }
});

export default OTPLoginScreen;
