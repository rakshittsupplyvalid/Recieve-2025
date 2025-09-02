import React, { useState, useEffect } from 'react';
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
import { launchCamera, ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid} from 'react-native';
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
  date?: string;
  StartTripReading?: string;
  EndTripReading?: string;
  Amount?: string;
  BillType?: string;
  Purpose?: string;
  VehicleType?: string;
  VehicleNumber?: string;
  images?: string;
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
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAlerts, setShowAlerts] = useState(false);
  const { t, i18n } = useTranslation();

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  useEffect(() => {
    // Validate fields as they change
    validateField();
  }, [formData, images]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    setTouched({ ...touched, [key]: true });
    // Validate the specific field immediately after change
    validateField(key, true);
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, true);
  };

  const validateField = (field?: string, showAlert = false) => {
    const { date, StartTripReading, EndTripReading, Amount, BillType, Purpose, VehicleType, VehicleNumber } = formData;
    const newErrors: ValidationErrors = { ...errors };

    // Clear specific field error when validating all or a specific field
    if (!field || field === 'date') {
      if (!date) {
        newErrors.date = 'Date is required';
        if (showAlert && showAlerts) Alert.alert('Validation Error', 'Date is required');
      } else {
        delete newErrors.date;
      }
    }

    if (!field || field === 'BillType') {
      if (!BillType) {
        newErrors.BillType = 'Bill type is required';
        if (showAlert && showAlerts) Alert.alert('Validation Error', 'Bill type is required');
      } else {
        delete newErrors.BillType;
      }
    }

    if (!field || field === 'Amount') {
      if (!Amount) {
        newErrors.Amount = 'Amount is required';
        if (showAlert && showAlerts) Alert.alert('Validation Error', 'Amount is required');
      } else if (isNaN(Number(Amount)) || Number(Amount) <= 0) {
        newErrors.Amount = 'Please enter a valid amount';
        if (showAlert && showAlerts) Alert.alert('Validation Error', 'Please enter a valid amount');
      } else {
        delete newErrors.Amount;
      }
    }

    if (!field || field === 'Purpose') {
      if (!Purpose) {
        newErrors.Purpose = 'Purpose is required';
        if (showAlert && showAlerts) Alert.alert('Validation Error', 'Purpose is required');
      } else {
        delete newErrors.Purpose;
      }
    }

    if (BillType === 'Petrol') {
      if (!field || field === 'VehicleType') {
        if (!VehicleType || VehicleType === 'None') {
          newErrors.VehicleType = 'Please select a valid vehicle type';
          if (showAlert && showAlerts) Alert.alert('Validation Error', 'Please select a valid vehicle type');
        } else {
          delete newErrors.VehicleType;
        }
      }

      if (!field || field === 'VehicleNumber') {
        const truckRegex = /^[A-Z0-9 ]{1,12}$/;
        if (!VehicleNumber) {
          newErrors.VehicleNumber = 'Vehicle number is required';
          if (showAlert && showAlerts) Alert.alert('Validation Error', 'Vehicle number is required');
        } else if (!truckRegex.test(VehicleNumber.trim())) {
          newErrors.VehicleNumber = 'Please enter a valid Vehicle Number (only capital letters & numbers, max 12 chars)';
          if (showAlert && showAlerts) Alert.alert('Validation Error', 'Please enter a valid Vehicle Number (only capital letters & numbers, max 12 chars)');
        } else {
          delete newErrors.VehicleNumber;
        }
      }

      if (!field || field === 'StartTripReading') {
        if (!StartTripReading) {
          newErrors.StartTripReading = 'Start trip reading is required';
          if (showAlert && showAlerts) Alert.alert('Validation Error', 'Start trip reading is required');
        } else if (isNaN(Number(StartTripReading)) || Number(StartTripReading) < 0) {
          newErrors.StartTripReading = 'Please enter a valid reading';
          if (showAlert && showAlerts) Alert.alert('Validation Error', 'Please enter a valid reading');
        } else {
          delete newErrors.StartTripReading;
        }
      }

      if (!field || field === 'EndTripReading') {
        if (!EndTripReading) {
          newErrors.EndTripReading = 'End trip reading is required';
          if (showAlert && showAlerts) Alert.alert('Validation Error', 'End trip reading is required');
        } else if (isNaN(Number(EndTripReading)) || Number(EndTripReading) < 0) {
          newErrors.EndTripReading = 'Please enter a valid reading';
          if (showAlert && showAlerts) Alert.alert('Validation Error', 'Please enter a valid reading');
        } else if (Number(EndTripReading) <= Number(StartTripReading)) {
          newErrors.EndTripReading = 'End reading must be greater than start reading';
          if (showAlert && showAlerts) Alert.alert('Validation Error', 'End reading must be greater than start reading');
        } else {
          delete newErrors.EndTripReading;
        }
      }
    } else {
      // Clear petrol-specific errors if bill type is not petrol
      delete newErrors.VehicleType;
      delete newErrors.VehicleNumber;
      delete newErrors.StartTripReading;
      delete newErrors.EndTripReading;
    }

    if (!field || field === 'images') {
      if (images.length === 0) {
        newErrors.images = 'Please upload at least one image';
        if (showAlert && showAlerts) Alert.alert('Validation Error', 'Please upload at least one image');
      } else {
        delete newErrors.images;
      }
    }

    setErrors(newErrors);
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Camera permission granted');
          handleTakePhoto();
        } else {
          console.log('Camera permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      handleTakePhoto(); // iOS me direct open
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
          // Validate images after adding
          validateField('images', true);
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
          // Validate images after adding
          validateField('images', true);
        }
      }
    );
    toggleModal();
  };

  const handleDeleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    // Validate images after deletion
    setTimeout(() => validateField('images', true), 100);
  };

  const handleSubmit = async () => {
    // Enable alerts for final validation
    setShowAlerts(true);
    
    // Validate all fields before submission
    validateField(undefined, true);
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      Alert.alert('Validation Error', 'Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    data.append('Date', formData.date);
    data.append('StartTripReading', formData.StartTripReading);
    data.append('EndTripReading', formData.EndTripReading);
    data.append('Amount', formData.Amount);
    data.append('BillType', formData.BillType);
    data.append('Purpose', formData.Purpose);
    data.append('VehicleType', formData.VehicleType);
    data.append('VehicleNumber', formData.VehicleNumber);

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
        // Clear form data
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
        
        // Clear images
        setImages([]);
        
        // Clear validation errors
        setErrors({});
        
        // Clear touched fields
        setTouched({});
        
        // Reset date
        setSelectedDate(new Date());
        
        // Disable alerts
        setShowAlerts(false);
        
        Alert.alert('Success', response.data.message || 'Reimbursement added successfully');
      }
    } catch (error) {
      console.error('Error submitting form:', error.response?.data);
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
              style={[styles.input, touched.date && errors.date ? styles.inputError : null]}
              placeholder={t('selecteddate')}
              value={formData.date}
              onChangeText={(text) => handleInputChange('date', text)}
              onBlur={() => handleBlur('date')}
              editable={false}
            />
          </TouchableOpacity>
          {touched.date && errors.date && (
            <Text style={styles.errorText}>{errors.date}</Text>
          )}
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
        <View style={[styles.dropdowntwo, touched.BillType && errors.BillType ? styles.inputError : null]}>
          <Picker
            selectedValue={formData.BillType}
            onValueChange={(itemValue) => {
              setFormData((prevState) => {
                return {
                  ...prevState,
                  BillType: itemValue,
                  StartTripReading: '',
                  EndTripReading: '',
                  VehicleType: itemValue === 'Petrol' ? prevState.VehicleType : '',
                  VehicleNumber: itemValue === 'Petrol' ? prevState.VehicleNumber : '',
                };
              });
              setTouched({ ...touched, BillType: true });
              validateField('BillType', true);
            }}
          >
            <Picker.Item label={t('selectBilltype')} value="" />
            {billTypeItems.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
        {touched.BillType && errors.BillType && (
          <Text style={styles.errorText}>{errors.BillType}</Text>
        )}

        {/* Petrol-Specific Fields */}
        {formData.BillType === 'Petrol' && (
          <>
            <Text style={styles.label}>{t("Vehicle Type")}</Text>
            <View style={[styles.dropdowntwo, touched.VehicleType && errors.VehicleType ? styles.inputError : null]}>
              <Picker
                selectedValue={formData.VehicleType}
                onValueChange={(itemValue) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    VehicleType: itemValue,
                  }));
                  setTouched({ ...touched, VehicleType: true });
                  validateField('VehicleType', true);
                }}
              >
                <Picker.Item label="Select Vehicle Type" value="" />
                {vehicleTypeItems.map((item) => (
                  <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
              </Picker>
            </View>
            {touched.VehicleType && errors.VehicleType && (
              <Text style={styles.errorText}>{errors.VehicleType}</Text>
            )}

            <Text style={styles.label}>{t("Vehicle Number")}</Text>
            <TextInput
              style={[styles.input, touched.VehicleNumber && errors.VehicleNumber ? styles.inputError : null]}
              placeholder="e.g. MH01AB1234"
              value={formData.VehicleNumber}
              onChangeText={(text) => handleInputChange('VehicleNumber', text)}
              onBlur={() => handleBlur('VehicleNumber')}
              autoCapitalize="characters"
            />
            {touched.VehicleNumber && errors.VehicleNumber && (
              <Text style={styles.errorText}>{errors.VehicleNumber}</Text>
            )}

            <Text style={styles.label}>{t("StartTripReading")}</Text>
            <TextInput
              style={[styles.input, touched.StartTripReading && errors.StartTripReading ? styles.inputError : null]}
              placeholder={t("StartTripReading")}
              keyboardType="numeric"
              value={formData.StartTripReading}
              onChangeText={(text) => handleInputChange('StartTripReading', text)}
              onBlur={() => handleBlur('StartTripReading')}
              maxLength={7}
            />
            {touched.StartTripReading && errors.StartTripReading && (
              <Text style={styles.errorText}>{errors.StartTripReading}</Text>
            )}

            <Text style={styles.label}>{t("EndTripReading")}</Text>
            <TextInput
              style={[styles.input, touched.EndTripReading && errors.EndTripReading ? styles.inputError : null]}
              placeholder={t("EndTripReading")}
              keyboardType="numeric"
              value={formData.EndTripReading}
              onChangeText={(text) => handleInputChange('EndTripReading', text)}
              onBlur={() => handleBlur('EndTripReading')}
              maxLength={7}
            />
            {touched.EndTripReading && errors.EndTripReading && (
              <Text style={styles.errorText}>{errors.EndTripReading}</Text>
            )}
          </>
        )}

        {/* Common Fields */}
        <Text style={styles.label}>{t("Amount")}</Text>
        <TextInput
          style={[styles.input, touched.Amount && errors.Amount ? styles.inputError : null]}
          placeholder={t("Amount")}
          keyboardType="numeric"
          value={formData.Amount}
          onChangeText={(text) => handleInputChange('Amount', text)}
          onBlur={() => handleBlur('Amount')}
          maxLength={6}
        />
        {touched.Amount && errors.Amount && (
          <Text style={styles.errorText}>{errors.Amount}</Text>
        )}

        <Text style={styles.label}>{t("purpose")}</Text>
        <TextInput
          style={[styles.input, touched.Purpose && errors.Purpose ? styles.inputError : null]}
          placeholder={t("purpose")}
          value={formData.Purpose}
          onChangeText={(text) => handleInputChange('Purpose', text)}
          onBlur={() => handleBlur('Purpose')}
        />
        {touched.Purpose && errors.Purpose && (
          <Text style={styles.errorText}>{errors.Purpose}</Text>
        )}

        {/* Image Upload Section */}
        <View>
          <Pressable style={styles.button} onPress={toggleModal}>
            <Text style={styles.buttonText}>{t("CaptureImage")}</Text>
          </Pressable>
          {touched.images && errors.images && (
            <Text style={styles.errorText}>{errors.images}</Text>
          )}

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
  inputError: {
    borderColor: '#ff4d4d',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 14,
    marginTop: 5,
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
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4d4d',
    padding: 5,
    borderRadius: 15,
    zIndex: 1
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
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
    backgroundColor: '#F79B00',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    justifyContent: 'center',
    width: '80%',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default ReimbursementForm;