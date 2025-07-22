import React, { useState, useEffect } from 'react';
import { SafeAreaView, Modal, StyleSheet, Text, View, ActivityIndicator, Image, KeyboardAvoidingView, Platform, TextInput, Button, ScrollView, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Navbar from '../App/Navbar';
import api from '../service/api/apiInterceptors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/Type';
import { launchCamera, launchImageLibrary, ImagePickerResponse, ImageLibraryOptions } from 'react-native-image-picker';
import styles from '../theme/Healthreport';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { PermissionsAndroid } from 'react-native';
import { Alert } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';








type HealthReportSelection = StackNavigationProp<RootStackParamList, 'HealthReportselect'>;

type ImageAsset = {
  uri: string;
  fileName: string;
  type: string;
};

const storage = new MMKV();
const GenerateHealthReport = () => {


  const navigation = useNavigation<HealthReportSelection>();
  const { t, i18n } = useTranslation();

  const [data2, setData2] = useState([]);
  const [destinationBranch, setDestinationBranch] = useState([]);
  const [destinationDistrict, setDestinationDistrict] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [truckNumber, setTruckNumber] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [tareWeight, setTareWeight] = useState('');
  const [bagCount, setBagCount] = useState('');
  const [size, setSize] = useState('');
  const [isComment, setIsComment] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [selectedbranchs, setSelectedbranch] = useState("");
  const [selectedBranchName, setSelectedBranchName] = useState("");
  const [selectedDistrict, setSelecteddistrict] = useState("");
  const [selectedDistrictName, setSelecteddistrictName] = useState("");
  const [selectedDistrictValue, setSelectedDistrictValue] = useState('');
  const [selectedDistrictText, setSelectedDistrictText] = useState('');

  const [currentStep, setCurrentStep] = useState(1);
  const [previousSteps, setPreviousSteps] = useState<number[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [stainingColour, setStainingColour] = useState(false);
  const [stainingColourPercent, setStainingColourPercent] = useState('');
  const [blackSmutOnion, setBlackSmutOnion] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
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
  const [items, setItems] = useState(
    data2.map((item) => ({ label: item.text, value: item.value }))
  );


  useFocusEffect(
    useCallback(() => {
      loadInitialData();
      return () => {
        // Screen is unfocused, reset form here
        resetAllFields();
      };
    }, [])
  );



  const resetAllFields = () => {
    setSelectedCompany('');
    setCompanyId('');
    setSelecteddistrictName('');
    setSelectedbranch('');
    setBranchId('');
    setSelectedBranchName('');
    setSelectedDistrictValue('');
    setSelectedDistrictText('');
    setTruckNumber('');
    setGrossWeight('');
    setTareWeight('');
    setNetWeight('');
    setDate('');
    setTime('');
    setBagCount('');
    setSize('');
    setStainingColour(false);
    setStainingColourPercent('');
    setBlackSmutOnion(false);
    setBlackSmatPercent('');
    setSproutedOnion(false);
    setSproutedPercent('');
    setSpoiledOnion(false);
    setSpoiledPercent('');
    setOnionSkin('DOUBLE');
    setOnionSkinPercent('');
    setImageUri([]);

    setCompanyId('');
    setData2([]);
    setDestinationBranch([]);
    setDestinationDistrict([]);
    setBranchId('');
    setTruckNumber('');
    setGrossWeight('');
    setTareWeight('');
    setNetWeight('');
    setBagCount('');
    setSize('');
    setFpcPersonName('');
    setBlackSmatPercent('');
    setStainingColourPercent('');
    setSproutedPercent('');
    setSpoiledPercent('');
    setOnionSkin('');
    setMoisture('');
    setOnionSkinPercent('');
    setMoisturePercent('');
    setSpoliedPercent('');
    setSpoliedBranch('');
    setSpoliedComment('');
    setCurrentStep(1);
  };

  const handleDeleteImage = (indexToDelete) => {
    const updatedImages = imageUri.filter((_, i) => i !== indexToDelete);
    setImageUri(updatedImages);
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



  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);




  const handleNext = (nextStep: number) => {



    const validateTruckNumber = (truckNumber: string) => {
      truckNumber = truckNumber.trim().toUpperCase();


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
      if (!selectedCompany) {
        Alert.alert("Validation Error", "Company is required");
        return;
      }
      if (!selectedbranchs) {
        Alert.alert("Validation Error", "Branch is required");
        return;
      }
      if (!selectedDistrictValue) {
        Alert.alert("Validation Error", "District is required");
        return;
      }
    }


    if (currentStep === 2) {
      if (!truckNumber || !grossWeight || !tareWeight || !date || !bagCount || !size)
         {
        Alert.alert("Validation Error", "All fields are required!");
        return;
        }

      const netWeight = parseFloat(grossWeight) - parseFloat(tareWeight);



      if (netWeight < 0)
         {
        Alert.alert("Validation Error", "Net Weight cannot be negative!");
        return;
        }

      if (parseFloat(grossWeight) <= 0 || parseFloat(tareWeight) <= 0) {
        Alert.alert("Validation Error", "Gross and Tare Weight must be greater than zero!");
        return;
      }


      if (!validateTruckNumber(truckNumber)) {
        Alert.alert("Validation Error", "Enter a Valid Truck Number!");
        return;
      }


    }



    if (currentStep === 3) {
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


    setPreviousSteps([...previousSteps, currentStep]); // Store current step in history
    setCurrentStep(nextStep);


  };

  const handlePrevious = (


  ) => {
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
        const formattedDate = moment(selectedDate).format("YYYY-MM-DD"); // 🔹 UTC hata diya
        setDate(formattedDate);
        console.log("Formatted date:", formattedDate);
        hideDatePicker();
        setTimePickerVisibility(true);
      } else if (type === "time") {
        const formattedTime = moment(selectedDate).format("HH:mm:ss"); // 🔹 Local time liya

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
    if (truckNumber.length >= 6) {
      fetchHealthReport(truckNumber);
    }
  }, [truckNumber]);

  const fetchHealthReport = async (trucknumber: any) => {
    try {
      const response = await api.get(
        `/api/healthreport?TruckNumber=${trucknumber}&ReportType=DISPATCH`
      );

      console.log("API Response:", response.data);


      if (response.data && response.data.length > 0) {
        const reportId = response.data[0].id; // Pehla report ka ID le rahe hain
        fetchReportDetails(reportId); // ID pass karke details fetch kar rahe hain
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  const fetchReportDetails = async (id: any) => {
    try {
      const response = await api.get(`/api/healthreport/${id}`);
      setSelectedReport(response.data);
      console.log("Report details:", response.data);
      if (response.data && response.data.datastring) {
        const parsedData = JSON.parse(response.data.datastring);
        setGrossWeight(parsedData.GrossWeight.toString());
        setTareWeight(parsedData.TareWeight.toString());
        setBagCount(parsedData.BagCount.toString());
        setSize(parsedData.Size.toString());
        setSpoiledOnion(parsedData.SpoiledOnion);
        setSpoiledPercent(parsedData.SpoiledPercent ? parsedData.SpoiledPercent.toString() : '0');
        setSproutedOnion(parsedData.SproutedOnion);
        setSproutedPercent(parsedData.SproutedPercent ? parsedData.SproutedPercent.toString() : '0');
        setBlackSmutOnion(parsedData.BlackSmutOnion);
        setBlackSmatPercent(parsedData.BlackSmutPercent ? parsedData.BlackSmutPercent.toString() : '0');
        setStainingColour(parsedData.StainingColour);
        setStainingColourPercent(parsedData.StainingColourPercent ? parsedData.StainingColourPercent.toString() : '0');
        setOnionSkin(parsedData.OnionSkin);
        setOnionSkinPercent(parsedData.OnionSkinPercent ? parsedData.OnionSkinPercent.toString() : '0');
        setMoisture(parsedData.Moisture);
        setMoisturePercent(parsedData.MoisturePercent ? parsedData.MoisturePercent.toString() : '0');
      }
    } catch (error) {
      console.error("Error fetching report details:", error);
    }
  };



  const loadInitialData = async () => {
    try {
      // Load companies
      const companyResponse = await api.get("/api/dropdown/company");
      setData2(companyResponse.data);

      // If you have a default company selected, load its branches
      if (selectedCompany) {
        const branchResponse = await api.get(
          `/api/group?GroupType=Branch&BranchType=Receiving&ApprovalStatus=APPROVED&CompanyId=${selectedCompany}`
        );
        setDestinationBranch(branchResponse.data);
      }

      // If you have a default branch selected, load its districts
      if (selectedbranchs) {
        const districtResponse = await api.get(
          `/api/dropdown/group/${selectedbranchs}/location?locationType=GENERAL`
        );
        setDestinationDistrict(districtResponse.data);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };


  useEffect(() => {
    loadInitialData();
  }, []);


  useEffect(() => {
    fetchData2();

  }, []);

  useEffect(() => {

    if (companyId) fetchData3(companyId);
  }, [companyId]);


  useEffect(() => {

  }, [destinationDistrict]);


  const fetchData2 = async () => {
    try {
      const response = await api.get("/api/dropdown/company");
      setData2(response.data);


    } catch (error) {
      console.error("Error fetching data2:", error);
      console.log("a");
    }
  };

  const fetchData3 = async (companyId: any) => {
    try {
      const response = await api.get(
        `/api/group?GroupType=Branch&BranchType=Receiving&ApprovalStatus=APPROVED&CompanyId=${companyId}`

      );

      setDestinationBranch(response.data);
    } catch (error) {
      console.log("b");
    }
  };

  const fetchData5 = async (branchId: any) => {
    try {
      const response = await api.get(
        `/api/dropdown/group/${branchId}/location?locationType=GENERAL`

      );

      setDestinationDistrict(response.data);




    } catch (error) {
      console.error("Error fetching data5:", error);
      console.log("c");
    }
  };





  useEffect(() => {

    if (branchId) fetchData5(branchId);
  }, [branchId]);

  useEffect(() => {

    const gross = parseFloat(grossWeight) || 0;
    const tare = parseFloat(tareWeight) || 0;
    setNetWeight((gross - tare).toString());
  }, [grossWeight, tareWeight]);


  const handleSubmit = async () => {


    if (imageUri.length < 3) {
      Alert.alert('Error', 'Please upload at least 3 images before submitting.');
      return;
    }

    if (imageUri.length > 9) {
      Alert.alert('Error', 'Please upload Maximum 3 images before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append("CNAName", selectedCompanyName)
    formData.append("DestinationBranch", selectedBranchName);
    formData.append('DestinationDistrict', selectedDistrictValue);
    formData.append('truckNumber', truckNumber);
    formData.append('GrossWeight', grossWeight);
    formData.append('TareWeight', tareWeight);
    formData.append('NetWeight', netWeight);
    formData.append('BagCount', bagCount);
    formData.append('Size', size);
    formData.append('StainingColour', stainingColour.toString());
    formData.append('StainingColourPercent', stainingColourPercent);
    formData.append('BlackSmutOnion', blackSmutOnion.toString());
    formData.append('BlackSmutPercent', BlackSmutPercent);
    formData.append('SproutedOnion', sproutedOnion.toString());
    formData.append('SproutedPercent', sproutedPercent);
    formData.append('SpoiledOnion', spoiledOnion.toString());
    formData.append('SpoiledPercent', spoiledPercent);
    formData.append('OnionSkin', onionSkin);
    formData.append('Moisture', moisture);
    formData.append('OnionSkinPercent', onionSkinPercent);
    formData.append('MoisturePercent', moisturePercent);
    formData.append('FPCPersonName', fpcPersonName);
    formData.append('SpoliedPercent', SpoliedPercent);
    formData.append('SpoliedBranch', SpoliedBranch);
    formData.append('Date', date);
    // formData.append('Date', updatedata);
    // Image Upload
    if (imageUri) {
      imageUri.forEach((image) => {
        formData.append('Files', {
          uri: image.uri,
          name: image.fileName || 'image.jpg',
          type: image.type || 'image/jpeg',
        } as any);

      });
    }
    console.log("FormData content:");
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    try {
      const response = await api.post('/api/healthreport/receive', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Form submitted successfully:', response.data);
      alert('Health Report Submitted Successfully!');
      resetAllFields();
      await loadInitialData();
      // Reset step
      setCurrentStep(1);
      console.log('response', response.data);

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit Health Report. Please try again.');
      console.log('error', error);
    }
  };





  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <SafeAreaView style={styles.container}>
        <Navbar />
        <ScrollView contentContainerStyle={styles.scrollView}>



          {currentStep === 1 && (
            <View style={styles.onecontainers}>

              <View style={styles.content}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCompany}
                    onValueChange={(value) => {


                      setSelectedCompany(value);
                      setCompanyId(value);

                      const selectedCompanyObj = data2.find(item => item.value === value);
                      if (selectedCompanyObj) {
                        setSelecteddistrictName(selectedCompanyObj.text); // Alag state me store karo
                        console.log('Selected Company Name:', selectedCompanyObj.text); // 👈 This will log the label/text
                      }
                    }}
                  >
                    <Picker.Item label={t('SelectedCompany')} value="" />
                    {data2.map((item, idx) => (
                      <Picker.Item key={idx} label={item.text} value={item.value} />
                    ))}
                  </Picker>
                </View>
              </View>



              <View style={styles.content}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedbranchs}
                    onValueChange={(value) => {
                      setSelectedbranch(value);
                      setBranchId(String(value));
                      const selectedBranch = destinationBranch.find(item => item.id === value);
                      if (selectedBranch) {
                        setSelectedBranchName(selectedBranch.name);// Alag state me store karo
                        console.log('Selected branch Name:', selectedBranch.name); // 👈 This will log the label/text); 
                      }
                    }}
                  >
                    <Picker.Item label={t('SelectedBranch')} value="" />
                    {destinationBranch.map((item, idx) => (
                      <Picker.Item key={idx} label={item.name} value={item.id} />
                    ))}
                  </Picker>
                </View>

              </View>






              <View style={styles.content}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedDistrictValue}
                    onValueChange={(value) => {
                      const selectedItem = destinationDistrict.find(item => item.value === value);
                      if (selectedItem) {
                        // Save current step to history before changing
                        setPreviousSteps(prev => [...prev, currentStep]);

                        setSelectedDistrictValue(selectedItem.value);
                        setSelectedDistrictText(selectedItem.text);
                      }
                    }}
                  >
                    <Picker.Item label={t('SelectedDistrict')} value="" />
                    {destinationDistrict.map((item, idx) => (
                      <Picker.Item key={idx} label={item.text} value={item.value} />
                    ))}
                  </Picker>
                </View>

              </View>









              {/* 
              <View style={styles.content}>
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.picker}
                    selectedValue={selectedDistrict} // Ab text store ho raha hai
                    onValueChange={(value) => {
                       // ID ke corresponding text dhoondo
                      const selectedText = destinationDistrict.find(item => item.value === value)?.text || "Not Selected";
                        if (selectedText){ 
                      setSelecteddistrict(selectedText); // Text ko store karo 
                      console.log('Selected District:', selectedText);
                        }
                    }}
              
                  >
                    <Picker.Item label={t('SelectedDistrict')} value="" />
                    {destinationDistrict.map((item, idx) => (
                      <Picker.Item key={idx} label={item.text} value={item.value} />
                    ))}
                  </Picker>

                </View>
              </View> */}




              <View style={styles.buttoncontent}>
                <TouchableOpacity style={styles.button} onPress={() => handleNext(2)}>
                  <Text style={styles.buttonText}>{t('Next')}</Text>
                </TouchableOpacity>
              </View>



            </View>
          )}

          {currentStep === 2 && (
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



                <TouchableOpacity style={styles.button} onPress={handlePrevious}>
                  <Text style={styles.buttonText}>{t('Previous')}</Text>
                </TouchableOpacity>


                <TouchableOpacity style={styles.button} onPress={() => handleNext(currentStep + 1)}>
                  <Text style={styles.buttonText}>{t('Next')}</Text>
                </TouchableOpacity>

                {/* 
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity> */}

              </View>







            </View>
          )}

          {currentStep === 3 && (
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
                    trackColor={{ false: '#F6A00191', true: '#FF9500' }} // Red track when ON
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


                {/* OnionSkin Dropdown */}
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

                {/* OnionSkin Dropdown */}
                {/* <View style={styles.dropdownContainer}>
                  <Text style={styles.text}>Onion Skin</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={onionSkin}
                      onValueChange={(itemValue) => {
                        setOnionSkin(itemValue);
                        if (itemValue === "DOUBLE") {
                          setOnionSkinPercent("0"); // DOUBLE select hone par value 0 set karo
                        } else {
                          setOnionSkinPercent(""); // SINGLE ke liye input blank rakho
                        }
                      }}
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
                  editable={onionSkin === "SINGLE"} // SINGLE hone par editable, DOUBLE hone par non-editable
                /> */}


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

                {moisture === "WET" && (
                  <TextInput
                    style={styles.input}
                    placeholder={t('Moisturewetpercent')}
                    value={moisturePercent}
                    onChangeText={setMoisturePercent}
                    keyboardType="numeric"
                  />
                )}


                <View>
                  <Text style={styles.text}> {t('Spoiled')} </Text>

                  <Switch
                    value={isSpoiledPercentVisible}
                    onValueChange={setIsSpoiledPercentVisible}
                    trackColor={{ false: '#F6A00191', true: '#FF9500' }}
                    thumbColor={moisture === "WET" ? "white" : "#f4f3f4"}
                  />
                </View>

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


          {currentStep === 4 && (
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
                    <TouchableOpacity onPress={() => setSelectedImage(img.uri)}>
                      <Image source={{ uri: img.uri }} style={styles.image} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteIcon}
                      onPress={() => handleDeleteImage(index)}
                    >
                      <MaterialIcons name="cancel" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Modal to show full image */}
                <Modal visible={!!selectedImage} transparent={true}>
                  <View style={styles.modalContainer}>
                    <TouchableOpacity
                      style={styles.modalClose}
                      onPress={() => setSelectedImage(null)}
                    >
                      <MaterialIcons name="cancel" size={30} color="white" />
                    </TouchableOpacity>

                    <Image source={{ uri: selectedImage }} style={styles.fullImage} />
                  </View>
                </Modal>
              </View>

            </View>
          )}

        </ScrollView>





      </SafeAreaView>





    </KeyboardAvoidingView>


  );
};




export default GenerateHealthReport;
