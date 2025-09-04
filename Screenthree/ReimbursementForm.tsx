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
import { Picker } from '@react-native-picker/picker';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';
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

type ValidationErrors = {
  [key: string]: string;
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
    VehicleNumber: '',
  });
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [billTypeItems] = useState([
    { label: 'Petrol', value: 'Petrol' },
    { label: 'Food', value: 'Food' },
    { label: 'Other', value: 'Other' },
  ]);
  const [vehicleTypeItems] = useState([
    { label: 'None', value: 'None' },
    { label: 'Two Wheeler', value: 'TwoWheeler' },
    { label: 'Four Wheeler', value: 'FourWheeler' },
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const validateField = (field: string, value: any) => {
    let error = '';

    switch (field) {
      case 'date':
        if (!value) error = 'Date is required';
        break;
      case 'BillType':
        if (!value) error = 'Bill type is required';
        break;
      case 'Amount':
        if (!value) {
          error = 'Amount is required';
        } else if (isNaN(Number(value)) || Number(value) <= 0) {
          error = 'Please enter a valid amount';
        }
        break;
      case 'Purpose':
        if (!value) error = 'Purpose is required';
        break;
      case 'VehicleType':
        if (formData.BillType === 'Petrol' && (!value || value === 'None')) {
          error = 'Please select a valid vehicle type';
        }
        break;
      case 'VehicleNumber':
        const truckRegex = /^[A-Z0-9 ]{1,12}$/;
        if (formData.BillType === 'Petrol' && !value) {
          error = 'Vehicle number is required';
        } else if (formData.BillType === 'Petrol' && !truckRegex.test(value.trim())) {
          error = 'Please enter a valid Vehicle Number';
        }
        break;
      case 'StartTripReading':
        if (formData.BillType === 'Petrol' && value &&
          (isNaN(Number(value)) || Number(value) < 0)) {
          error = 'Please enter a valid reading';
        }
        break;
      case 'EndTripReading':
        if (formData.BillType === 'Petrol') {
          if (!value) {
            error = 'End trip reading is required';
          } else if (isNaN(Number(value)) || Number(value) < 0) {
            error = 'Please enter a valid reading';
          } else if (Number(value) <= Number(formData.StartTripReading)) {
            error = 'End reading must be greater than start reading';
          }
        }
        break;
      case 'images':
        if ((formData.BillType === 'Food' || formData.BillType === 'Petrol') && images.length === 0) {
          error = 'Please upload at least one image';
        }
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    if (formData.BillType === 'Food') {
      ['date', 'Amount', 'Purpose'].forEach(field => {
        const error = validateField(field, formData[field as keyof typeof formData]);
        if (error) newErrors[field] = error;
      });
      const imageError = validateField('images', null);
      if (imageError) newErrors.images = imageError;
    }

    if (formData.BillType === 'Petrol') {
      ['date', 'Amount', 'Purpose', 'VehicleType', 'VehicleNumber', 'StartTripReading', 'EndTripReading'].forEach(field => {
        const error = validateField(field, formData[field as keyof typeof formData]);
        if (error) newErrors[field] = error;
      });
      const imageError = validateField('images', null);
      if (imageError) newErrors.images = imageError;
    }

    if (!formData.BillType) {
      newErrors.BillType = 'Bill type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join('\n');
      Alert.alert('Validation Error', errorMessages);
      return false;
    }

    return true;
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          handleTakePhoto();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      handleTakePhoto();
    }
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
        if (response.assets) {
          const capturedImage = response.assets[0];
          const image = {
            uri: capturedImage.uri ?? '',
            fileName: capturedImage.fileName || `image_${Date.now()}.jpg`,
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
        if (response.assets) {
          const pickedImage = response.assets[0];
          const image = {
            uri: pickedImage.uri ?? '',
            fileName: pickedImage.fileName || `image_${Date.now()}.jpg`,
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const data = new FormData();
    data.append('Date', formData.date);
    data.append('Amount', formData.Amount);
    data.append('BillType', formData.BillType);
    data.append('Purpose', formData.Purpose);

    if (formData.BillType === 'Petrol') {
      data.append('StartTripReading', formData.StartTripReading);
      data.append('EndTripReading', formData.EndTripReading);
      data.append('VehicleType', formData.VehicleType);
      data.append('VehicleNumber', formData.VehicleNumber);
    }

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
      console.error('Error submitting form:', error);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Navbar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContent}>
        {/* Date Picker */}
        <Text style={styles.label}>{t('Date')}</Text>
        <View style={styles.inputWrapper}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={styles.input}
              placeholder={t('selecteddate')}
              value={formData.date}
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
        <View style={styles.dropdowntwo}>
          <Picker
            selectedValue={formData.BillType}
            onValueChange={(itemValue) => {
              handleInputChange('BillType', itemValue);
            }}
          >
            <Picker.Item label={t('selectBilltype')} value="" />
            {billTypeItems.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>

        {/* Petrol Specific */}
        {formData.BillType === 'Petrol' && (
          <>
            <Text style={styles.label}>{t("Vehicle Type")}</Text>
            <View style={styles.dropdowntwo}>
              <Picker
                selectedValue={formData.VehicleType}
                onValueChange={(itemValue) => {
                  handleInputChange('VehicleType', itemValue);
                }}
              >
                <Picker.Item label="Select Vehicle Type" value="" />
                {vehicleTypeItems.map((item) => (
                  <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>{t("Vehicle Number")}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. MH01AB1234"
              value={formData.VehicleNumber}
              onChangeText={(text) => handleInputChange('VehicleNumber', text)}
              autoCapitalize="characters"
              maxLength={13}
            />

            <Text style={styles.label}>{t("StartTripReading")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("StartTripReading")}
              keyboardType="numeric"
              value={formData.StartTripReading}
              onChangeText={(text) => handleInputChange('StartTripReading', text)}
              maxLength={7}
            />

            <Text style={styles.label}>{t("EndTripReading")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("EndTripReading")}
              keyboardType="numeric"
              value={formData.EndTripReading}
              onChangeText={(text) => handleInputChange('EndTripReading', text)}
              maxLength={7}
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
          maxLength={6}
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
              <Pressable onPress={requestCameraPermission} style={styles.pressable}>
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
          <View style={styles.imagesContainer}>
            <Text style={styles.imageLabel}>Uploaded Images:</Text>
            <View style={styles.imagesList}>
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
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Submit'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    backgroundColor: '#ffffff',
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    marginTop: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#F79B00',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputWrapper: {
    flexDirection: 'column',
  },
  dropdowntwo: {
    borderWidth: 1,
    borderColor: '#F79B00',
    borderRadius: 40,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#F79B00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#F79B00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagesContainer: {
    marginTop: 15,
  },
  imagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 12,
    padding: 2,
    zIndex: 1,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  pressable: {
    backgroundColor: '#F79B00',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#F79B00',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default ReimbursementForm;
