import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Button,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { launchCamera, ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import {useTranslation} from 'react-i18next';


import api from '../service/api/apiInterceptors';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
  });
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [billTypeOpen, setBillTypeOpen] = useState(false);
  const [billTypeItems, setBillTypeItems] = useState([
    { label: 'Petrol', value: 'Petrol' },
    { label: 'Food', value: 'Food' },
    { label: 'Other', value: 'Other' },
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [isModalVisible, setModalVisible] = useState(false);
   const { t ,  i18n } = useTranslation();
  


  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // const handleButtonClick = (buttonName: string) => {
  //   console.log(`${buttonName} clicked`);
  //   setModalVisible(false); // Close the modal after clicking a button
  // };

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };



  const handleTakePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
        cameraType: 'back', // can be 'front' or 'back'
        quality: 0.4, // set the photo quality (0.0 to 1.0)
        maxWidth: 700, // set maximum width for compression
        maxHeight: 700, // set maximum height for compression
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets) {
          const capturedImage = response.assets[0];
          
          // Log the image file size in bytes
          console.log('Captured image size (in bytes):', capturedImage.fileSize);
  
          // Construct image object
          const image = {
            uri: capturedImage.uri ?? '',
            fileName: capturedImage.fileName || `image_${capturedImage.id}.jpg`,
            type: capturedImage.type || 'image/jpeg', // Default type is 'image/jpeg'
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
        mediaType: 'photo',  // Pick only photos
        includeBase64: false, // Don't include base64 data
        quality: 0.4,         // Set image quality to 0.4 (lower quality)
        maxWidth: 700,        // Set maximum width for image compression
        maxHeight: 700,       // Set maximum height for image compression
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets) {
          const pickedImage = response.assets[0];
  
          const image = {
            uri: pickedImage.uri ?? '', // URI of the selected image
            fileName: pickedImage.fileName || `image_${pickedImage.id}.jpg`, // Default file name
            type: pickedImage.type || 'image/jpeg', // Default type
          };
  
          // Log image size to check if it's close to 200 KB
          const fileSize = pickedImage.fileSize ?? 0; // Use nullish coalescing to handle undefined
  
          console.log('Picked image size:', fileSize);
  
        
  
          // Add image to your state
          setImages((prevImages) => [...prevImages, image]);
        }
      }
    );
  
    toggleModal();
  };
        
  
  const handleDeleteImage = (index: number) => {
    // Remove the image from the array based on the index
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };


  const validateForm = () => {
    const { date, StartTripReading, EndTripReading, Amount, BillType, Purpose } = formData;




    if (!date || !BillType || !Amount || !Purpose) {
      Alert.alert('Validation Error', 'All Field Required');
      return false;
    }

    if (!date) {
      Alert.alert('Validation Error', 'Please select a date');
      return false;
    }


    if (!BillType) {
      Alert.alert('Validation Error', 'Please select a bill type');
      return false;
    }
    if (BillType === 'Petrol') {
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
    if (!Purpose.trim()) {
      Alert.alert('Validation Error', 'Please provide a purpose');
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

    console.log('Submitting reimbursement form...');

    const data = new FormData();
    data.append('date', formData.date);
    data.append('StartTripReading', formData.StartTripReading);
    data.append('EndTripReading', formData.EndTripReading);
    data.append('Amount', formData.Amount);
    data.append('BillType', formData.BillType);
    data.append('Purpose', formData.Purpose);

    images.forEach((image) => {
      data.append('images', {
        uri: image.uri,
        name: image.fileName,
        type: image.type,
      } as any);
    });

    try {
      const response = await api.post('/api/reimbursment', data, {
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
        });
        setImages([]);
        setSelectedDate(new Date());

       
        Alert.alert('Success', response.data.message || 'Reimbursement added successfully');
      } else {
        console.log('Response:', response.data);
        Alert.alert('Error', response.data.message || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Something went wrong while submitting the form');
    }
  };


  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
    const formattedDate = currentDate.toISOString().split('T')[0]; // Formatting to YYYY-MM-DD
    handleInputChange('date', formattedDate);
  };


  const handlePress = () => {
    Alert.alert('Image Pressed');
  };

  return (
    
    <ScrollView style={styles.container}>

      <Navbar />
      <FlatList
        data={[{ key: 'form' }]} // Dummy data to render content
        keyExtractor={(item) => item.key}
        renderItem={() => (
          <View style={styles.formContent}>
            <Text style={styles.label}>{t('Date')}</Text>
            <View style={styles.inputWrapper}>

     
           
            <TouchableOpacity onPress={() => setShowDatePicker(true)} >
            <TextInput
              style={styles.input}
              placeholder={t('selecteddate')}
              value={formData.date}
              onChangeText={(text) => handleInputChange('date', text)}
              editable={false}
             


            />

{/* <Icon name="arrow-right" size={25} color="#666" /> */}
           
             
            </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={threeMonthsAgo} // Set minimum date to 3 months ago
          maximumDate={today} // Set maximum date to today
             
              />
            )}

            <Text style={styles.label}>{t("Billtype")}</Text>
            <DropDownPicker
              open={billTypeOpen}
              value={formData.BillType}
              items={billTypeItems}
              setOpen={setBillTypeOpen}
              setValue={(callback) =>
                setFormData((prevState) => {
                  const selectedType = callback(prevState.BillType);
                  // If 'Food' is selected, reset the readings fields
                  if (selectedType === 'Food') {
                    return { ...prevState, BillType: selectedType, StartTripReading: '', EndTripReading: '' };
                  }
                  return { ...prevState, BillType: selectedType };
                })
              }
              setItems={setBillTypeItems}
              placeholder={t('selectBilltype')}
              style={styles.dropdown}
            />

            {/* Only show Start and End Trip Reading if Bill Type is 'Petrol' */}
            {formData.BillType === 'Petrol' && (
              <>
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

            {/* <TouchableOpacity onPress={handleTakePhoto} style={styles.button}>
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>


            <TouchableOpacity onPress={handlePickImage} style={styles.button}>
              <Text style={styles.buttonText}>Photo From Gallery</Text>
            </TouchableOpacity> */}

<View>
  <Pressable style={styles.button} onPress={toggleModal}>
    <Text style={styles.buttonText}>{t("CaptureImage")}</Text>
  </Pressable>
  
  <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
   

      

   

      <View style={{
  width: '100%', 
  height: '50%', 
  
  backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  justifyContent: 'center', 
  alignItems: 'center', 

}}>
         <Pressable onPress={handleTakePhoto} style={styles.pressable}>
    <Text style={styles.buttonText}>{t("Camera")}</Text>
    <MaterialIcons name="camera" size={30} color="#fff" />
  </Pressable>

  <Pressable onPress={handlePickImage} style={styles.pressable} >
    <Text style={styles.buttonText}>{t("Gallery")}</Text>
    <MaterialIcons name="photo-library" size={30} color="#fff" />
  </Pressable>

        <Pressable 
        style={styles.closeButton} 
        onPress={toggleModal}
      >
            <MaterialIcons name="close" size={20} color="#fff" />
        
      </Pressable>
      </View>

  </Modal>
</View>






            {images.length > 0 && (
  <>
    <FlatList
      data={images}
      horizontal
      keyExtractor={(item, index) => `${item.uri}-${index}`}
      renderItem={({ item, index }) => (
        <View style={styles.imageContainer}>
          {/* Delete icon above the image */}
          <TouchableOpacity
            onPress={() => handleDeleteImage(index)}
            style={styles.deleteButton}
          >
            <MaterialIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>


        
            <TouchableOpacity onPress={handlePress}>
          
          <Image source={{ uri: item.uri }} style={styles.image} />
              
          </TouchableOpacity>


    
        </View>
      )}
    />
  </>
)}


            <TouchableOpacity onPress={handleSubmit} style={[styles.button, isSubmitting && styles.buttonDisabled]} disabled={isSubmitting}>
              <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Submit'}</Text>
            </TouchableOpacity>

          </View>
        )}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false} 
      />
    </ScrollView>
 
  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // light background
  
  },
  formContent: {
    padding: 20,
    backgroundColor: '#ffffff',
    
    marginBottom: 20,
  },
  label: {
    fontSize: 20,                          // Increase font size for a bold look
    marginTop: 20,                         // Increase margin-top to give more space
    fontWeight: '700',                      // Use a bolder font weight
    color: '#F79B00',                       // A deeper color for a more professional look
    marginBottom: 10,                       // Increase margin-bottom for more spacing between inputs
    letterSpacing: 1,                       // Add letter spacing for a clean, spacious look
    textTransform: 'uppercase',             // Make the label text uppercase for emphasis
    fontFamily: 'Arial-BoldMT',              // Add a more modern font (use system font or custom)
    shadowColor: '#000',                    // Add a subtle shadow for depth
    shadowOffset: { width: 0, height: 2 },   // Soft shadow for a floating effect
    shadowOpacity: 0.1,                     // Low opacity for a light shadow
    shadowRadius: 4,                        // Increased radius for more subtle shadow effect
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
    backgroundColor: '#F79B00', // vibrant yellow/orange
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
    position: 'relative', // Ensures the delete button is positioned relative to the image container
    marginRight: 10,

  
    padding : 10
 
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
  datePicker: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    position: 'absolute',
    top: 2, // Adjust this value to position the delete button higher or lower
    right: 2, // Positions the button at the top-right of the image
    backgroundColor: '#ff4d4d', // Red color for delete button
    padding: 5,
    borderRadius: 50, // Circular delete button
    zIndex :1
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  flatListContent: {
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9c9c9c',
  },
  modal :{
    backgroundColor : 'red '
  },
  closeButton: {
    // Close button styles
    position: 'absolute', 
    top: 10, 
    right: 10,
    padding: 10,
    backgroundColor: '#ff5c5c', // Red color for close button
    borderRadius: 20,
  },
  pressable :{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'grey',
    paddingVertical: 10,      
    paddingHorizontal: 15,    // horizontal padding to create space around the text and icon
    borderRadius: 5,         // rounded corners for a smoother look
    marginHorizontal: 10,    // space between the buttons
    elevation: 3,            // shadow for Android (for better button visibility)
    shadowColor: '#000',     // shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // shadow offset
    shadowOpacity: 0.1,      // opacity of the shadow
    shadowRadius: 5,  
    marginTop : 30,
    width : 180,    
    justifyContent : 'center'   // blur radius of the shadow
  }
});


export default ReimbursementForm;
