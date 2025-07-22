import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Switch, ScrollView, SafeAreaView, Platform, Image,  PermissionsAndroid } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../theme/Healthreport';
import moment from "moment";
import { MMKV } from 'react-native-mmkv';
import NetInfo from "@react-native-community/netinfo";
import { launchCamera, ImagePickerResponse, ImageLibraryOptions } from 'react-native-image-picker';
import Navbar from "../App/Navbar";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from 'react-i18next';

const storage = new MMKV();


type ImageAsset = {
  uri: string;
  fileName: string;
  type: string;
};

const OfflineForm = () => {

  const [truckNumber, setTruckNumber] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [tareWeight, setTareWeight] = useState('');
  const [bagCount, setBagCount] = useState('');
  const [size, setSize] = useState('');
    const { t, i18n } = useTranslation();



  const [isComment, setIsComment] = useState(false);

  const [open, setOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  const [previousSteps, setPreviousSteps] = useState<number[]>([]);

  const [stainingColour, setStainingColour] = useState(false);

  const [stainingColourPercent, setStainingColourPercent] = useState('');
  
  const [blackSmutOnion, setBlackSmutOnion] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
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
  const [isSpoiledPercentVisible, setIsSpoiledPercentVisible] = useState(false);
  const [SpoliedPercent, setSpoliedPercent] = useState('');
  const [SpoliedBranch, setSpoliedBranch] = useState('');
  const [SpoliedComment, setSpoliedComment] = useState('');
    const [imageUri, setImageUri] = useState<ImageAsset[]>([]);

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const resetForm = () => {
    setTruckNumber('');
    setGrossWeight('');
    setTareWeight('');
    setNetWeight('');
    setBagCount('');
    setSize('');
    setDate('');
    setStainingColourPercent('');
    setBlackSmatPercent('');
    setSproutedPercent('');
    setSpoiledPercent('');
    setOnionSkinPercent('');
    setMoisturePercent('');
    setSpoliedPercent('');
    setSpoliedComment('');
    setImageUri(null); // 
  };
  

  const saveFormOffline = (formData) => {
    try {
      let existingData = storage.getString('offlineForms');
      let offlineForms = existingData ? JSON.parse(existingData) : [];

      offlineForms.push(formData);

      console.log('Offline Forms to be saved:', JSON.stringify(offlineForms, null, 2));

      storage.set('offlineForms', JSON.stringify(offlineForms));

      Alert.alert("Offline Mode", "Form saved offline successfully!");

      // **Check Saved Data**
      let savedData = storage.getString('offlineForms');
      console.log('Saved Offline Forms:', JSON.stringify(JSON.parse(savedData), null, 2));
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Camera permission granted');
            openCamera(); // **Agar permission mil gayi to camera open hoga**
          } else {
            console.log('Camera permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        openCamera(); // iOS ke liye directly open kar do
      }
    };
  
    const openCamera = () => {
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
          } else if (response.errorMessage) {
            console.log('ImagePicker Error: ', response.errorMessage);
          } else if (response.assets && response.assets.length > 0) {
            const capturedImage = response.assets[0]; 
  
            console.log('Captured image URI:', capturedImage.uri); // Debugging ke liye
  
            const image = {
              uri: capturedImage.uri ?? '',
              fileName: capturedImage.fileName || `photo_${Date.now()}.jpg`,
              type: capturedImage.type || 'image/jpeg',
            };
  
            setImageUri((prevImages) => [...prevImages, image]); // **Naye images add honge**
          }
        }
      );
    };





  const handleNext = (nextStep: number) => {

    const validateTruckNumber = (truckNumber: string) => {
      truckNumber = truckNumber.trim().toUpperCase();

      // Length check (minimum length 6 and maximum length 12)
      if (truckNumber.length < 8 || truckNumber.length > 12) {
          return false;
      }

      // Check for only alphabets and numbers (no special characters)
      if (!/^[A-Za-z0-9]+$/.test(truckNumber)) {
          return false;
      }

      return true;
  };

     if (currentStep === 1) {
          if (!truckNumber || !grossWeight || !tareWeight || !date || !bagCount || !size) {
            Alert.alert("Validation Error", "All fields are required!");
            return;
          }
          if (!validateTruckNumber(truckNumber)) {
            Alert.alert("Validation Error", "Enter a Valid Truck Number!");
            return;
        }
        }
    
     
    
        if (currentStep === 2) {
          const validations = [
            { key: 'Staining Colour', value: stainingColour, percent: stainingColourPercent },
            { key: 'Black Smut Onion', value: blackSmutOnion, percent: BlackSmutPercent },
            { key: 'Sprouted Onion', value: sproutedOnion, percent: sproutedPercent },
            { key: 'Spoiled Onion', value: spoiledOnion, percent: spoiledPercent },
          ];
        
          for (const item of validations) {
            if (item.value) {
              if (!item.percent.trim()) {
                Alert.alert("Validation error", `${item.key} Percent is required!`);
                return;
              }
        
              const percent = parseFloat(item.percent.trim());
              if (isNaN(percent) || percent < 1 || percent > 100) {
                Alert.alert("Validation error", `${item.key} Percent must be between 1 and 100!`);
                return;
              }
            }
          }
        
          // Onion Skin
          if (onionSkin === 'SINGLE') {
            if (!onionSkinPercent.trim()) {
              Alert.alert("Validation error", `Onion Skin Percent is required!`);
              return;
            }
            const percent = parseFloat(onionSkinPercent.trim());
            if (isNaN(percent) || percent < 1 || percent > 100) {
              Alert.alert("Validation error", `Onion Skin Percent must be between 1 and 100!`);
              return;
            }
          }
        
          // Moisture
          if (moisture === 'WET') {
            if (!moisturePercent.trim()) {
              Alert.alert("Validation error", `Moisture Percent is required!`);
              return;
            }
            const percent = parseFloat(moisturePercent.trim());
            if (isNaN(percent) || percent < 1 || percent > 100) {
              Alert.alert("Validation error", `Moisture Percent must be between 1 and 100!`);
              return;
            }
          }
        

          // Spoiled Percent field (manual one)
          if (isSpoiledPercentVisible) {
            // Spoiled Percent validation
            if (!SpoliedPercent.trim()) {
              Alert.alert("Validation error", `Spoiled Percent is required!`);
              return;
            }
          
            const percent = parseFloat(SpoliedPercent.trim());
            if (isNaN(percent) || percent < 1 || percent > 100) {
              Alert.alert("Validation error", `Spoiled Percent must be between 1 and 100!`);
              return;
            }
          
            // Spoiled Comment validation
            if (!SpoliedComment.trim()) {
              Alert.alert("Validation error", "Spoiled Comment is required!");
              return;
            }
          
            // Branch Person Name validation
            if (!SpoliedBranch.trim()) {
              Alert.alert("Validation error", "Branch Person name is required!");
              return;
            }
          }
          
        }
        
            setPreviousSteps([...previousSteps, currentStep]);
            setCurrentStep(nextStep);

 
  };

  const handleSubmit = () => {

    // Save form locally if offline
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        saveFormOffline({
          truckNumber, grossWeight, tareWeight, netWeight, bagCount, size, date, stainingColourPercent, BlackSmutPercent, sproutedPercent, spoiledPercent, onionSkinPercent, moisturePercent, SpoliedPercent , SpoliedComment , imageUri
        });
      }
    });
  
    Alert.alert("Success", "Form submitted successfull!");
  };

  const handlePrevious = () => {
    if (previousSteps.length > 0) {
      const lastStep = previousSteps[previousSteps.length - 1]; // Get the last step

      setPreviousSteps(previousSteps.slice(0, -1)); // Remove last step from history
      setCurrentStep(lastStep);
    }

  };



  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate: any, type: "date" | "time") => {
    if (selectedDate) {
      if (type === "date") {
        const formattedDate = moment(selectedDate).format("YYYY-MM-DD"); //  UTC hata diya
        setDate(formattedDate);
        console.log("Formatted date:", formattedDate);
        hideDatePicker();
        setTimePickerVisibility(true);
      } else if (type === "time") {
        const formattedTime = moment(selectedDate).format("HH:mm:ss"); //  Local time liya

        setDate((prevDate) => {
          const dateTime = `${prevDate} ${formattedTime}`;
          console.log("Formatted Date & Time:", dateTime);
          return dateTime;
        });

        setTimePickerVisibility(false);
      }
    }
  };

    useEffect(() => {
  
      const gross = parseFloat(grossWeight) || 0;
      const tare = parseFloat(tareWeight) || 0;
      setNetWeight((gross - tare).toString());
    }, [grossWeight, tareWeight]);
  



  return (


    <SafeAreaView style={styles.container}>

<Navbar />

      <ScrollView contentContainerStyle={styles.scrollView}>


        {currentStep === 1 && (
          <View style={styles.secondcontainers}>

            <TextInput
              maxLength={12}
              style={styles.input}
              placeholder={t('TruckNumber')}
              value={truckNumber}
              autoCapitalize="characters"
              onChangeText={(text) => setTruckNumber(text.toUpperCase())}
            />


            <TextInput
              style={styles.input}
              placeholder={t('Grossweight')}
              value={grossWeight}
              onChangeText={setGrossWeight}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder={t('Tareweight')}
              value={tareWeight}
              onChangeText={setTareWeight}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={t('Netweight')}
              value={netWeight}

              keyboardType="numeric"
            />



            {isDatePickerVisible && (
              <DateTimePicker
                value={date ? new Date(date) : new Date()}
                mode="date"
                onChange={(event, selectedDate) => handleConfirm(selectedDate, "date")}
                display="default"
                minimumDate={threeMonthsAgo} // Set minimum date to 3 months ago
                maximumDate={today} // Set maximum date to today
              />
            )}

            {isTimePickerVisible && (
              <DateTimePicker
                value={new Date()} // Default value current time
                mode="time"
                onChange={(event, selectedTime) => handleConfirm(selectedTime, "time")}
                display="default"
              />
            )}


            <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  editable={false} // User manually edit nahi kar sakta
                  value={
                    date
                        ? `${new Date(date).toLocaleDateString()} ${time ? new Date(time).toLocaleTimeString() : ""}`
                        : t('selecteddate')
                  }
                />
              </View>
            </TouchableOpacity>




            <TextInput
              style={styles.input}
              placeholder={t('Bagcount')}
              value={bagCount}
              onChangeText={setBagCount}
              keyboardType="numeric"
            />
            {
              isComment == false ?
                (<TextInput
                  style={styles.input}
                  placeholder={t('size')}
                  value={size}
                  onChangeText={setSize}
                  keyboardType="numeric"
                />) : (
                  <>
                  </>
                )
            }

             <View style={styles.buttoncontent} >
              <TouchableOpacity style={styles.button} onPress={() => handleNext(currentStep + 1)}>
                <Text style={styles.buttonText}>{t('Next')}</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View>


            <View style={styles.thirdcontainers}>
              <View style={styles.switchContainer}>
                <Text style={styles.text}>{t("stainingColor")}</Text>
                <Switch
                  value={stainingColour}
                  onValueChange={(value) => {
                    setStainingColour(value);
                    if (!value) setStainingColourPercent('');
                  }}
                  trackColor={{ false: '#F6A00191', true: '#FF9500' }} // Red track when ON
                  thumbColor={stainingColour ? 'white' : '#f4f3f4'} // White thumb when ON
                />
              </View>
              {stainingColour && (
                <TextInput
                  style={styles.input}
                  placeholder={t('stainingcolorpercent')}
                  value={stainingColourPercent}
                  onChangeText={(text) => setStainingColourPercent(text)}
                  keyboardType="numeric"
                />
              )}

              <View style={styles.switchContainer}>
                <Text style={styles.text}>{t('BlacksmutOnion')}</Text>
                <Switch
                  value={blackSmutOnion}
                  onValueChange={(value) => {
                    setBlackSmutOnion(value);
                    if (!value) setBlackSmatPercent('');
                  }}
                  trackColor={{ false: '#F6A00191', true: '#FF9500' }} 
                  thumbColor={stainingColour ? 'white' : '#f4f3f4'} // White thumb when ON
                />
              </View>
              {blackSmutOnion && (
                <TextInput
                  style={styles.input}
                  placeholder={t('BlacksmutOnionpercent')}
                  value={BlackSmutPercent}
                  onChangeText={(text) => setBlackSmatPercent(text)}
                  keyboardType="numeric"
                />
              )}


              <View style={styles.switchContainer}>
                <Text style={styles.text}>{t('SproutedOnion')}</Text>
                <Switch
                  value={sproutedOnion}
                  onValueChange={(value) => {
                    setSproutedOnion(value);
                    if (!value) setSproutedPercent('');
                  }}
                  trackColor={{ false: '#F6A00191', true: '#FF9500' }} // Red track when ON
                  thumbColor={stainingColour ? 'white' : '#f4f3f4'} // White thumb when ON
                />
              </View>
              {sproutedOnion && (
                <TextInput
                  style={styles.input}
                  placeholder={t('SproutedOnionpercent')}
                  value={sproutedPercent}
                  onChangeText={(text) => setSproutedPercent(text)}
                  keyboardType="numeric"
                />
              )}

              <View style={styles.switchContainer}>
                <Text style={styles.text}>{t('SpoiledOnion')}</Text>
                <Switch
                  value={spoiledOnion}
                  onValueChange={(value) => {
                    setSpoiledOnion(value);
                    if (!value) setSpoiledPercent('');
                  }}
                  trackColor={{ false: '#F6A00191', true: '#FF9500' }} // Red track when ON
                  thumbColor={stainingColour ? 'white' : '#f4f3f4'} // White thumb when ON
                />
              </View>
              {spoiledOnion && (
                <TextInput
                  style={styles.input}
                  placeholder={t('SpoiledOnionpercent')}
                  value={spoiledPercent}
                  onChangeText={(text) => setSpoiledPercent(text)}
                  keyboardType="numeric"
                />
              )}

<View style={styles.switchContainer}>
                  <Text style={styles.text}>
                    {t('Onionskin') + ' : ' + (onionSkin === 'SINGLE' ? t('Single') : t('Double'))}
                  </Text>

                  <Switch
                    value={onionSkin === "SINGLE"}
                    onValueChange={(value) => {
                      if (value) {
                        setOnionSkin("SINGLE");
                      } else {
                        setOnionSkin("DOUBLE");
                        setOnionSkinPercent(""); // DOUBLE hone par input clear
                      }
                    }}
                    trackColor={{ false: '#F6A00191', true: '#FF9500' }}
                    thumbColor={onionSkin === "SINGLE" ? "white" : "#f4f3f4"}
                  />
                </View>

                {onionSkin === "SINGLE" && (
                  <TextInput
                    style={styles.input}
                    placeholder={t('Onionskinsinglepercent')}
                    value={onionSkinPercent}
                    onChangeText={setOnionSkinPercent}
                    keyboardType="numeric"
                  />
                )}





<View style={styles.switchContainer}>
                  <Text style={styles.text}>
                    {t('Moisture') + ' : ' + (moisture === 'WET' ? t('Wet') : t('Dry'))}

                  </Text>
                  <Switch
                    value={moisture === "WET"}
                    onValueChange={(value) => {
                      if (value) {
                        setMoisture("WET");
                      } else {
                        setMoisture("DRY");
                        setMoisturePercent(""); // DRY hone par input clear
                      }
                    }}
                    trackColor={{ false: '#F6A00191', true: '#FF9500' }}
                    thumbColor={moisture === "WET" ? "white" : "#f4f3f4"}
                  />
                </View>

                {moisture === "WET" 
                &&
                 (
                  <TextInput
                    style={styles.input}
                    placeholder={t('Moisturewetpercent')}
                    value={moisturePercent}
                    onChangeText={setMoisturePercent}
                    keyboardType="numeric"
                  />
                )}

              <Text style={styles.text}>{t('Spoiled')}</Text>

              <Switch
                value={isSpoiledPercentVisible}
                onValueChange={setIsSpoiledPercentVisible}
                trackColor={{ false: '#F6A00191', true: '#FF9500' }}
                thumbColor={moisture === "WET" ? "white" : "#f4f3f4"}
              />

              {isSpoiledPercentVisible && (
                <TextInput
                  style={styles.input}
                  placeholder={t('spoiledperecent')}
                  value={SpoliedPercent}
                  onChangeText={setSpoliedPercent}
                  keyboardType="numeric"
                />
              )}

              <TextInput
                style={styles.input}
                placeholder={t('typecomment')}
                value={SpoliedComment}
                onChangeText={setSpoliedComment}
              />


              <TextInput
                style={styles.input}
                placeholder={t('branchpersonname')}
                value={SpoliedBranch}
                onChangeText={setSpoliedBranch}

              />


              <View style={styles.buttoncontent} >
     

                <TouchableOpacity style={styles.button} onPress={handlePrevious}>
                  <Text style={styles.buttonText}>{t('Previous')}</Text>
                </TouchableOpacity>



                <TouchableOpacity style={styles.button} onPress={() => handleNext(currentStep + 1)}>
                  <Text style={styles.buttonText}>{t('Next')}</Text>
                </TouchableOpacity>


              </View>


            </View>






          </View>
        )}


{currentStep === 3 && (
            <View>
              <View style={styles.centerContainer}>
                <Text style={styles.title}>{t('CaptureImage')}</Text>
              </View>

              <View style={styles.buttoncontent}>
                <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
                  <MaterialIcons name="camera" size={30} color="white" />
                  <Text style={styles.buttonText}>{t('PickfromCamera')}</Text>
                </TouchableOpacity>



              </View>
              {/* <View style={styles.buttoncontent}>
                <TouchableOpacity style={styles.button} onPress={openGallery}>
                  <MaterialIcons name="photo-library" size={30} color="white" />
                  <Text style={styles.buttonText}>Pick from Gallery</Text>
                </TouchableOpacity>
              </View> */}

              <View style={styles.buttoncontent}>
                <TouchableOpacity style={styles.button} onPress={handlePrevious}>
                  <Text style={styles.buttonText}>{t('Previous')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>{t('submit')}</Text>
                </TouchableOpacity>
              </View>

              {/* Image Grid */}
              <View style={styles.imageGrid}>
                {imageUri.map((img, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: img.uri }} style={styles.image} />
                  </View>
                ))}
              </View>
            </View>
          )}

      </ScrollView>



      </SafeAreaView>

  );
};



export default OfflineForm;
