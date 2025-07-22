import React, { useState } from 'react';
import { View, Button, TextInput, Image, Platform, StyleSheet, Text } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/Type';



const DispatchRecieve = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [TruckimageUri, setTruckImageUri] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  // Use RouteProp to define the type for the route
  const route = useRoute<RouteProp<RootStackParamList, 'DispatchRecieve'>>();

  const { quantitymt } = route.params || {}; // Get quantitymt from params

  // Function to open the camera
  const openCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 1 }, response => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const openTruckCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 1 }, response => {
      if (response.assets && response.assets.length > 0) {
        setTruckImageUri(response.assets[0].uri);
      }
    });
  };

  // Function to handle date change
  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text>Received Quantity: {quantitymt}</Text>
      <View style={{ padding: 20 }}>
        <Text style={{ marginBottom: 10 }}>Select an option:</Text>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => setSelectedValue(itemValue)}
        >
          <Picker.Item label="None" value="None" />
          <Picker.Item label="Onefourth" value="Onefourth" />
          <Picker.Item label="Half" value="Half" />
          <Picker.Item label="ThreeFourth" value="ThreeFourth" />
          <Picker.Item label="Full" value="Full" />
        </Picker>
      </View>

      {/* Date Picker Button */}
      <Button title="Select Date" onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
        />
      )}

      {/* Camera Button */}
      <Button title="Capture Weightment Slip" onPress={openCamera} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <Button title="Capture Truck image" onPress={openTruckCamera} />
      {TruckimageUri && <Image source={{ uri: TruckimageUri }} style={styles.image} />}
    </View>
  );
};

// Basic CSS Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  image: {
    width: 120,
    height: 120,
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 10,
  },
});

export default DispatchRecieve;
