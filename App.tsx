import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { NativeModules } from 'react-native';

const { MyNativeModule } = NativeModules;

const App = () => {
  const [message, setMessage] = useState('');
  const [showBox, setShowBox] = useState(false);

  const handleGreet = async () => {
    try {
      const response = await MyNativeModule.greet('Rakshit');
      console.log('Native Response:', response);
      setMessage(response);
      setShowBox(true);
    } catch (err) {
      console.error('Native Module Error:', err);
      Alert.alert('Error', 'Failed to call greet method');
    }
  };

  const handleShowUI = async () => {
    try {
      const res = await MyNativeModule.showGreetingUI('Khushi');
      console.log('Activity launched:', res);
      Alert.alert('Launched', res);
    } catch (err) {
      console.error('Native UI Error:', err);
      Alert.alert('Error', 'Could not launch native UI');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Greet from Native" onPress={handleGreet} />
      <View style={{ height: 20 }} />
      <Button title="Open Native Greeting UI" onPress={handleShowUI} />

      {showBox && (
        <View style={styles.box}>
          <Text style={styles.boxText}>{message}</Text>
        </View>
      )}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  box: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#E0F7FA',
    borderRadius: 10,
    elevation: 3,
  },
  boxText: {
    fontSize: 18,
    color: '#00796B',
    textAlign: 'center',
  },
});
