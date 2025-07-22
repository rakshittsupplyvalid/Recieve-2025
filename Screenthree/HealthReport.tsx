import React, { useState } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/Type';

const HealthReport = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'HealthReport'>>();

  const {
    truckNumber,
    grossWeight,
    netWeight,
    tareWeight,
    bagCount,
    size,
    selectedDate = new Date(route.params.selectedDate)
  } = route.params || {};

  const formattedDate = selectedDate instanceof Date
    ? selectedDate.toLocaleDateString()
    : new Date(selectedDate).toLocaleDateString();

  const [stainingColour, setStainingColour] = useState(false);
  const [stainingColourPercent, setStainingColourPercent] = useState('');
  const [blackSmutOnion, setBlackSmutOnion] = useState(false);
  const [BlackSmutPercent, setBlackSmatPercent] = useState('');
  const [sproutedOnion, setSproutedOnion] = useState(false);
  const [sproutedPercent, setSproutedPercent] = useState('');
  const [spoiledOnion, setSpoiledOnion] = useState(false);
  const [spoiledPercent, setSpoiledPercent] = useState('');
  const [onionSkin, setOnionSkin] = useState('DOUBLE');
  const [moisture, setMoisture] = useState('DRY');
  const [onionSkinPercent, setOnionSkinPercent] = useState('');
  const [moisturePercent, setMoisturePercent] = useState('');
  const [fpcPersonName, setFpcPersonName] = useState('');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text>Truck Number: {truckNumber} kg</Text>
        <Text>Gross Weight: {grossWeight} kg</Text>
        <Text>Net Weight: {netWeight} kg</Text>
        <Text>Tare Weight: {tareWeight} kg</Text>
        <Text>Bag Count: {bagCount}</Text>
        <Text>Size: {size}</Text>
        <Text>Selected Date: {formattedDate}</Text>

        <View style={styles.switchContainer}>
          <Text>Staining Colour</Text>
          <Switch
            value={stainingColour}
            onValueChange={(value) => {
              setStainingColour(value);
              if (!value) setStainingColourPercent('');
            }}
          />
        </View>
        {stainingColour && (
          <TextInput
            style={styles.input}
            placeholder="Staining Colour Percent"
            value={stainingColourPercent}
            onChangeText={(text) => setStainingColourPercent(text)}
            keyboardType="numeric"
          />
        )}

        <View style={styles.switchContainer}>
          <Text>Black Smat Onion</Text>
          <Switch
            value={blackSmutOnion}
            onValueChange={(value) => {
              setBlackSmutOnion(value);
              if (!value) setBlackSmatPercent('');
            }}
          />
        </View>
        {blackSmutOnion && (
          <TextInput
            style={styles.input}
            placeholder="Black Smat Percent"
            value={BlackSmutPercent}
            onChangeText={(text) => setBlackSmatPercent(text)}
            keyboardType="numeric"
          />
        )}

        <View style={styles.switchContainer}>
          <Text>Sprouted Onion</Text>
          <Switch
            value={sproutedOnion}
            onValueChange={(value) => {
              setSproutedOnion(value);
              if (!value) setSproutedPercent('');
            }}
          />
        </View>
        {sproutedOnion && (
          <TextInput
            style={styles.input}
            placeholder="Sprouted Percent"
            value={sproutedPercent}
            onChangeText={(text) => setSproutedPercent(text)}
            keyboardType="numeric"
          />
        )}

        <View style={styles.switchContainer}>
          <Text>Spoiled Onion</Text>
          <Switch
            value={spoiledOnion}
            onValueChange={(value) => {
              setSpoiledOnion(value);
              if (!value) setSpoiledPercent('');
            }}
          />
        </View>
        {spoiledOnion && (
          <TextInput
            style={styles.input}
            placeholder="Spoiled Percent"
            value={spoiledPercent}
            onChangeText={(text) => setSpoiledPercent(text)}
            keyboardType="numeric"
          />
        )}

        {/* OnionSkin Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text>Onion Skin</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={onionSkin}
              onValueChange={(itemValue) => setOnionSkin(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="DOUBLE" value="DOUBLE" />
              <Picker.Item label="SINGLE" value="SINGLE" />
            </Picker>
          </View>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Onion Skin Percent"
          value={onionSkinPercent}
          onChangeText={setOnionSkinPercent}
          keyboardType="numeric"
        />

        {/* Moisture Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text>Moisture</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={moisture}
              onValueChange={(itemValue) => setMoisture(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="DRY" value="DRY" />
              <Picker.Item label="WET" value="WET" />
            </Picker>
          </View>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Moisture Percent"
          value={moisturePercent}
          onChangeText={setMoisturePercent}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="FPC Person Name"
          value={fpcPersonName}
          onChangeText={setFpcPersonName}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'grey',
    justifyContent: 'center',
    padding: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50, // Match the height of the text inputs
    justifyContent: 'center',
  },
  picker: {
    height: 50, // Match the height of the text inputs
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    height: 50, // Ensure all inputs are the same height
  },
});

export default HealthReport;
