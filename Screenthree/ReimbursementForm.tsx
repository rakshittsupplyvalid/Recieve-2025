import React, { useState, useRef } from 'react';
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
  ActivityIndicator,
  Dimensions
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
import * as Location from 'expo-location';
import ViewShot from 'react-native-view-shot';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

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
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [imageUri, setImageUri] = useState<ImageAsset[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [screenshots, setScreenshots] = useState<ImageAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const viewShotRefs = useRef<Array<ViewShot | null>>([]);
  const { t } = useTranslation();

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  // Validate minimum and maximum images
  const validateImages = () => {
    if (screenshots.length === 0) {
      return 'Please upload at least one image';
    }
    if (screenshots.length > 5) {
      return 'Maximum 5 images allowed';
    }
    return '';
  };

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
        const imageError = validateImages();
        if (imageError) error = imageError;
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
    }

    if (formData.BillType === 'Petrol') {
      ['date', 'Amount', 'Purpose', 'VehicleType', 'VehicleNumber', 'StartTripReading', 'EndTripReading'].forEach(field => {
        const error = validateField(field, formData[field as keyof typeof formData]);
        if (error) newErrors[field] = error;
      });
    }

    // Always validate images
    const imageError = validateImages();
    if (imageError) newErrors.images = imageError;

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

  const fetchLocation = async () => {
    try {
      setIsCapturingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission denied');
        return;
      }

      let locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation(locationData.coords);

      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        setAddress(reverseGeocode[0] || null);
        const addr = reverseGeocode[0];
        const formatted = `${addr.name || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.country || ''}`.replace(/\s*,\s*,/g, ',').replace(/^,\s*|\s*,$/g, '');
        setFormattedAddress(formatted);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', 'Could not fetch location');
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          openCamera();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      openCamera();
    }
  };

  const openCamera = async () => {
    // First get location
    await fetchLocation();
    
    launchCamera({ 
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const newImage: ImageAsset = {
          uri: asset.uri!,
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg'
        };
        const newIndex = imageUri.length;

        setImageUri((prev) => {
          const updatedList = [...prev, newImage];
          // Capture screenshot with geolocation
          setTimeout(() => {
            captureSingleScreenshot(newIndex);
          }, 1000);
          return updatedList;
        });
      }
    });
    toggleModal();
  };

  const captureSingleScreenshot = async (index: number) => {
    try {
      const ref = viewShotRefs.current[index];
      if (ref && typeof ref.capture === 'function') {
        const uri = await ref.capture();
        if (uri) {
          const screenshotImage: ImageAsset = {
            uri,
            fileName: `geotagged_${Date.now()}_${index}.jpg`,
            type: 'image/jpeg',
          };
          setScreenshots((prev) => {
            const newScreenshots = [...prev];
            newScreenshots[index] = screenshotImage;
            return newScreenshots;
          });
        }
      }
    } catch (error) {
      console.error('Screenshot error:', error);
    }
  };

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        selectionLimit: 5 - screenshots.length // Limit selection based on remaining slots
      },
      (response: ImagePickerResponse) => {
        if (response.assets) {
          const newImages: ImageAsset[] = response.assets.map((asset, index) => ({
            uri: asset.uri ?? '',
            fileName: asset.fileName || `gallery_${Date.now()}_${index}.jpg`,
            type: asset.type || 'image/jpeg',
          }));

          setImageUri((prev) => [...prev, ...newImages]);
          
          // For gallery images, we need to capture them with geolocation overlay
          newImages.forEach((_, index) => {
            setTimeout(() => {
              captureSingleScreenshot(imageUri.length + index);
            }, 1000);
          });
        }
      }
    );
    toggleModal();
  };

  const handleDeleteImage = (index: number) => {
    setImageUri((prev) => prev.filter((_, i) => i !== index));
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
    
    // Clean up refs
    viewShotRefs.current = viewShotRefs.current.filter((_, i) => i !== index);
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

    // Use the geotagged screenshots instead of original images
    screenshots.forEach((image, index) => {
      if (image && image.uri) {
        data.append('Images', {
          uri: image.uri,
          name: image.fileName || `image_${index}.jpg`,
          type: image.type || 'image/jpeg'
        } as any);
      }
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
        setImageUri([]);
        setScreenshots([]);
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
          <Text style={styles.label}>Images </Text>
        
          
          <Pressable 
            style={[styles.button, screenshots.length >= 5 && styles.buttonDisabled]} 
            onPress={toggleModal}
            disabled={screenshots.length >= 5}
          >
            <Text style={styles.buttonText}>
              {screenshots.length >= 5 ? 'Maximum 5 images reached' : t("CaptureImage")}
            </Text>
          </Pressable>

          <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
            <View style={styles.modalContainer}>
              <Pressable 
                onPress={requestCameraPermission} 
                style={styles.pressable}
                disabled={isCapturingLocation}
              >
                <Text style={styles.buttonText}>{t("Camera")}</Text>
                <MaterialIcons name="camera" size={30} color="#fff" />
                {isCapturingLocation && <ActivityIndicator color="#fff" style={{ marginLeft: 10 }} />}
              </Pressable>

              <Pressable 
                onPress={handlePickImage} 
                style={styles.pressable}
                disabled={screenshots.length >= 5}
              >
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
        {imageUri.map((img, index) => (
          <View key={index} style={{ marginBottom: 20, marginTop: 10 }}>
            <ViewShot
              ref={(ref) => { viewShotRefs.current[index] = ref; }}
              options={{ format: 'jpg', quality: 1.0 }}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: img.uri }} style={styles.image} resizeMode="cover" />
                <View style={styles.overlay}>
                  {location && address ? (
                    <>
                      <Text style={styles.overlayText}>
                        Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                      </Text>
                      <Text style={styles.overlayText}>
                        {address.city || ''} {address.region || ''} {address.country || ''}
                      </Text>
                      <Text style={styles.overlayText}>
                        {new Date().toLocaleString()}
                      </Text>
                    </>
                  ) : (
                    <ActivityIndicator size="small" color="#ffffff" />
                  )}
                </View>
              </View>
            </ViewShot>
            
            <TouchableOpacity 
              style={styles.deleteImageButton}
              onPress={() => handleDeleteImage(index)}
            >
              <MaterialIcons name="delete" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Screenshot Preview Section */}
{screenshots.length > 0 && (
  <View style={{ marginTop: 20 }}>
    <Text style={styles.label}>Geo-tagged Screenshots</Text>
    {screenshots.map((shot, idx) => (
      <View key={idx} style={{ marginBottom: 10 }}>
        <Image
          source={{ uri: shot.uri }}
          style={{
            width: '100%',
            height: isSmallDevice ? 180 : 200,
            borderRadius: 8,
          }}
          resizeMode="cover"
        />
      </View>
    ))}
  </View>
)}


        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
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
    marginTop: 10,
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
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
    overflow: 'hidden',
   
  },
  image: {
    width: '100%',
    height: isSmallDevice ? 180 : 200,
    resizeMode: 'cover',
  },
  deleteImageButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  deleteButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
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
    minWidth: 150,
    justifyContent: 'center',
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
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 10 : 12,
    marginBottom: 2,
    textAlign: 'center',
  }
});

export default ReimbursementForm;