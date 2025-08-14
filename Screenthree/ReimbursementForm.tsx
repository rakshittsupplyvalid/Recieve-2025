import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { launchCamera, ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import apiClient from '../service/api/apiInterceptors';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import Navbar from '../App/Navbar';
import { ScrollView } from 'react-native-gesture-handler';

type ImageAsset = {
  uri: string;
  fileName: string;
  type: string;
};

const ReimbursementForm = () => {
  const [formData, setFormData] = useState({
    date: '',
    StartTripReading: '',
    EndTripReading: '',
    Amount: '',
    BillType: '',
    Purpose: '',
    VehicleType: '',
    VehicleNumber: '', // Added VehicleNumber field
  });
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [billTypeOpen, setBillTypeOpen] = useState(false);
  const [billTypeItems, setBillTypeItems] = useState([
    { label: 'Petrol', value: 'Petrol' },
    { label: 'Food', value: 'Food' },
    { label: 'Other', value: 'Other' },
  ]);
  const [vehicleTypeOpen, setVehicleTypeOpen] = useState(false);
  const [vehicleTypeItems, setVehicleTypeItems] = useState([
    { label: 'None', value: 'None' },
    { label: 'Two Wheeler', value: 'TwoWheeler' },
    { label: 'Four Wheeler', value: 'FourWheeler' },
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const { t, i18n } = useTranslation();

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleTakePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
        cameraType: 'back',
        quality: 0.4,
        maxWidth: 700,
        maxHeight: 700,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets) {
          const capturedImage = response.assets[0];
          const image = {
            uri: capturedImage.uri ?? '',
            fileName: capturedImage.fileName || `image_${capturedImage.id}.jpg`,
            type: capturedImage.type || 'image/jpeg',
          };
          setImages((prevImages) => [...prevImages, image]);
        }
      }
    );
    toggleModal();
  };

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        quality: 0.4,
        maxWidth: 700,
        maxHeight: 700,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets) {
          const pickedImage = response.assets[0];
          const image = {
            uri: pickedImage.uri ?? '',
            fileName: pickedImage.fileName || `image_${pickedImage.id}.jpg`,
            type: pickedImage.type || 'image/jpeg',
          };
          setImages((prevImages) => [...prevImages, image]);
        }
      }
    );
    toggleModal();
  };

  const handleDeleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const { date, StartTripReading, EndTripReading, Amount, BillType, Purpose, VehicleType, VehicleNumber } = formData;

    if (!date || !BillType || !Amount || !Purpose) {
      Alert.alert('Validation Error', 'All fields are required');
      return false;
    }

    if (BillType === 'Petrol') {
      if (!VehicleType || VehicleType === 'None') {
        Alert.alert('Validation Error', 'Please select a valid vehicle type');
        return false;
      }
      if (!VehicleNumber || VehicleNumber.trim().length < 5) {
        Alert.alert('Validation Error', 'Please enter a valid vehicle number (e.g. MH01AB1234)');
        return false;
      }
      if (!StartTripReading || isNaN(Number(StartTripReading))) {
        Alert.alert('Validation Error', 'Please enter a valid Start Trip Reading');
        return false;
      }
      if (!EndTripReading || isNaN(Number(EndTripReading))) {
        Alert.alert('Validation Error', 'Please enter a valid End Trip Reading');
        return false;
      }
      if (Number(EndTripReading) <= Number(StartTripReading)) {
        Alert.alert('Validation Error', 'End Trip Reading must be greater than Start Trip Reading');
        return false;
      }
    }

    if (!Amount || isNaN(Number(Amount)) || Number(Amount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount');
      return false;
    }

    if (images.length === 0) {
      Alert.alert('Validation Error', 'Please upload at least one image');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const data = new FormData();
    data.append('Date', formData.date);
    data.append('StartTripReading', formData.StartTripReading);
    data.append('EndTripReading', formData.EndTripReading);
    data.append('Amount', formData.Amount);
    data.append('BillType', formData.BillType);
    data.append('Purpose', formData.Purpose);
    data.append('VehicleType', formData.VehicleType);
    data.append('VehicleNumber', formData.VehicleNumber); // Added VehicleNumber to form data

    images.forEach((image) => {
      data.append('Images', {
        uri: image.uri,
        name: image.fileName,
        type: image.type,
      } as any);
    });

    try {
      const response = await apiClient.post('api/mobile/Reimbursment', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setFormData({
          date: '',
          StartTripReading: '',
          EndTripReading: '',
          Amount: '',
          BillType: '',
          Purpose: '',
          VehicleType: '',
          VehicleNumber: '',
        });
        setImages([]);
        setSelectedDate(new Date());
        Alert.alert('Success', response.data.message || 'Reimbursement added successfully');
      }
    } catch (error) {
      console.error('Error submitting form:', error.response.data);
      Alert.alert('Error', 'Something went wrong while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
    const formattedDate = currentDate.toISOString().split('T')[0];
    handleInputChange('date', formattedDate);
  };

  return (
    <ScrollView style={styles.container}>
      <Navbar />
      <View style={styles.formContent}>
        {/* Date Picker */}
        <Text style={styles.label}>{t('Date')}</Text>
        <View style={styles.inputWrapper}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={styles.input}
              placeholder={t('selecteddate')}
              value={formData.date}
              onChangeText={(text) => handleInputChange('date', text)}
              editable={false}
            />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={threeMonthsAgo}
            maximumDate={today}
          />
        )}

        {/* Bill Type Dropdown */}
        <Text style={styles.label}>{t("Billtype")}</Text>
        <DropDownPicker
          open={billTypeOpen}
          value={formData.BillType}
          items={billTypeItems}
          setOpen={setBillTypeOpen}
          setValue={(callback) =>
            setFormData((prevState) => {
              const selectedType = callback(prevState.BillType);
              return {
                ...prevState,
                BillType: selectedType,
                StartTripReading: '',
                EndTripReading: '',
                VehicleType: selectedType === 'Petrol' ? prevState.VehicleType : '',
                VehicleNumber: selectedType === 'Petrol' ? prevState.VehicleNumber : '',
              };
            })
          }
          setItems={setBillTypeItems}
          placeholder={t('selectBilltype')}
          style={styles.dropdown}
        />

        {/* Petrol-Specific Fields */}
        {formData.BillType === 'Petrol' && (
          <>
            <Text style={styles.label}>{t("Vehicle Type")}</Text>
            <DropDownPicker
              open={vehicleTypeOpen}
              value={formData.VehicleType}
              items={vehicleTypeItems}
              setOpen={setVehicleTypeOpen}
              setValue={(callback) =>
                setFormData((prevState) => ({
                  ...prevState,
                  VehicleType: callback(prevState.VehicleType)
                }))
              }
              setItems={setVehicleTypeItems}
              placeholder="Select Vehicle Type"
              style={styles.dropdown}
            />

            <Text style={styles.label}>{t("Vehicle Number")}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. MH01AB1234"
              value={formData.VehicleNumber}
              onChangeText={(text) => handleInputChange('VehicleNumber', text)}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>{t("StartTripReading")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("StartTripReading")}
              keyboardType="numeric"
              value={formData.StartTripReading}
              onChangeText={(text) => handleInputChange('StartTripReading', text)}
            />

            <Text style={styles.label}>{t("EndTripReading")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("EndTripReading")}
              keyboardType="numeric"
              value={formData.EndTripReading}
              onChangeText={(text) => handleInputChange('EndTripReading', text)}
            />
          </>
        )}

        {/* Common Fields */}
        <Text style={styles.label}>{t("Amount")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("Amount")}
          keyboardType="numeric"
          value={formData.Amount}
          onChangeText={(text) => handleInputChange('Amount', text)}
        />

        <Text style={styles.label}>{t("purpose")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("purpose")}
          value={formData.Purpose}
          onChangeText={(text) => handleInputChange('Purpose', text)}
        />

        {/* Image Upload Section */}
        <View>
          <Pressable style={styles.button} onPress={toggleModal}>
            <Text style={styles.buttonText}>{t("CaptureImage")}</Text>
          </Pressable>

          <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
            <View style={styles.modalContainer}>
              <Pressable onPress={handleTakePhoto} style={styles.pressable}>
                <Text style={styles.buttonText}>{t("Camera")}</Text>
                <MaterialIcons name="camera" size={30} color="#fff" />
              </Pressable>

              <Pressable onPress={handlePickImage} style={styles.pressable}>
                <Text style={styles.buttonText}>{t("Gallery")}</Text>
                <MaterialIcons name="photo-library" size={30} color="#fff" />
              </Pressable>

              <Pressable style={styles.closeButton} onPress={toggleModal}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </Pressable>
            </View>
          </Modal>
        </View>

        {/* Image Preview */}
        {images.length > 0 && (
          <View>
            {images.map((item, index) => (
              <View key={`${item.uri}-${index}`} style={styles.imageContainer}>
                <TouchableOpacity
                  onPress={() => handleDeleteImage(index)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
                <Image source={{ uri: item.uri }} style={styles.image} />
              </View>
            ))}
          </View>
        )}
        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles remain the same as in your original code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  formContent: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    marginTop: 20,
    fontWeight: '700',
    color: '#F79B00',
    marginBottom: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'Arial-BoldMT',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#F79B00',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginTop: 8,
    fontSize: 16,
  },
  inputWrapper: {
    flexDirection: 'column',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#F79B00',
    borderRadius: 50,
    marginTop: 8,
    backgroundColor: '#fff',
    paddingLeft: 12,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#F79B00',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#6b7b8f',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
    padding: 10
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  deleteButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff4d4d',
    padding: 5,
    borderRadius: 50,
    zIndex: 1
  },
  buttonDisabled: {
    backgroundColor: '#9c9c9c',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: '#ff5c5c',
    borderRadius: 20,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'grey',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginTop: 30,
    width: 180,
    justifyContent: 'center'
  },
  modalContainer: {
    width: '100%',
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default ReimbursementForm;