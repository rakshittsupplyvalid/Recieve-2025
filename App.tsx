import React from 'react';
import { View, Button, Alert } from 'react-native';
import { NativeModules } from 'react-native';

const { GeoCameraModule } = NativeModules;

export default function App() {
  const openCamera = async () => {
    try {
      const result = await GeoCameraModule.openCamera();
      Alert.alert('Image Path', result);
    } catch (err) {
      console.error('Camera Error:', err);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Launch Native Camera" onPress={openCamera} />
    </View>
  );
}
