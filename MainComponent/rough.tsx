import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import RNSmsRetriever from 'react-native-sms-retriever';

const LoginApp = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false); // prevent duplicate calls

  // Phone number hint picker (Google dialog)
  const requestPhoneNumber = async () => {
    if (isFetching) return; // avoid duplicate call
    setIsFetching(true);
    setIsLoading(true);

    try {
      const number = await RNSmsRetriever.requestPhoneNumber();
      console.log("Phone Number: ", number);
      setPhoneNumber(number);
      setError(null);
    } catch (err) {
      console.log("Error: ", err);
      setError("Phone number selection failed");
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const handleLogin = () => {
    console.log(`Logging in with ${phoneNumber} and OTP: ${otp}`);
    // Yahan apna backend OTP API call karo
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      <Text>Phone Number:</Text>
      <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Select or enter phone number"
        keyboardType="phone-pad"
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />

      <Button title="Pick Number" onPress={requestPhoneNumber} />

      <Text style={{ marginTop: 20 }}>OTP:</Text>
      <TextInput
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default LoginApp;
