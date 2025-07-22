import React, { useEffect, useState } from "react";
import { View, Text, Button, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, PermissionsAndroid } from "react-native";
import styles from '../theme/Healthreport';
import { useRoute, RouteProp } from "@react-navigation/native";
import api from '../service/api/apiInterceptors';
import Navbar from "../App/Navbar";
import { Picker } from "@react-native-picker/picker";

import { MMKV } from 'react-native-mmkv';

type RouteParams = {
  params: {
    truckData: {
      truckNumber: string;
      date: string;
      grossWeight?: number | null;
      netWeight?: number | null;
      tareWeight?: number | null;
      stainingColourPercent?: number | null;
      BlackSmutPercent?: number | null;
      sproutedPercent?: number | null;
      spoiledPercent?: number | null;
      onionSkinPercent?: number | null;
      moisturePercent?: number | null;
      SpoliedPercent?: number | null;
      SpoliedComment: string;
      bagCount?: number | null;
      size?: number | null;
      Branchpersonname: string;
      imageUri: string[]; 
    };
  };
};

type ImageAsset = {
  uri: string;
  fileName: string;
  type: string;
};

const SubmitTruckData = () => {
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const { truckData } = route.params;
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [destinationBranch, setDestinationBranch] = useState([]);
  const [destinationDistrict, setDestinationDistrict] = useState([]);
  const [selectedbranchs, setSelectedbranch] = useState("");
  const [selectedDistrict, setSelecteddistrict] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [previousSteps, setPreviousSteps] = useState<number[]>([]);
  const [companyId, setCompanyId] = useState('');
   const [branchId, setBranchId] = useState('');
  const [data2, setData2] = useState([]);
  const [imageUri, setImageUri] = useState<ImageAsset[]>([]);


    const storage = new MMKV();



 


  const handleNext = (nextStep: number) => {
  


    setPreviousSteps([...previousSteps, currentStep]); // Store current step in history
    setCurrentStep(nextStep);


  };

  const handlePrevious = () => {
    if (previousSteps.length > 0) {
      const lastStep = previousSteps[previousSteps.length - 1]; // Get the last step

      setPreviousSteps(previousSteps.slice(0, -1)); // Remove last step from history
      setCurrentStep(lastStep);
    }

  };

  const handleSubmit = async () => {

    const formData = new FormData();
    formData.append("CNAName", selectedCompanyName)     
    formData.append("DestinationBranch", selectedbranchs);
    formData.append('DestinationDistrict', selectedDistrict); 
    formData.append('truckNumber', truckData.truckNumber);
    formData.append('GrossWeight', truckData.grossWeight?.toString() || '0');
    formData.append('TareWeight', truckData.tareWeight?.toString() || '0');
    formData.append('NetWeight', truckData.netWeight?.toString() || '0');
    formData.append('BagCount', truckData.bagCount?.toString() || '0');
    formData.append('Size', truckData.size?.toString() || '0');
    formData.append('StainingColourPercent', truckData.stainingColourPercent?.toString() || '0');
    formData.append('BlackSmutPercent', truckData.BlackSmutPercent?.toString() || '0');
    formData.append('SproutedPercent', truckData.sproutedPercent?.toString() || '0');
    formData.append('SpoiledPercent', truckData.spoiledPercent?.toString() || '0');
    formData.append('OnionSkinPercent', truckData.onionSkinPercent?.toString() || '0');
    formData.append('MoisturePercent', truckData.moisturePercent?.toString() || '0');
    formData.append('SpoliedPercent', truckData.SpoliedPercent?.toString() || '0');
    formData.append('FPCPersonName', truckData.Branchpersonname);
  
    formData.append('SpoliedComment', truckData.SpoliedComment?.toString() || '0');
  

    formData.append('Date', truckData.date);
    // formData.append('Date', updatedata);
    // Image Upload
    if (truckData.imageUri) {
      truckData.imageUri.forEach((image: ImageAsset | string) => {
        formData.append('Files', {
          uri: typeof image === 'string' ? image : image.uri,
          name: typeof image === 'string' ? 'image.jpg' : image.fileName || 'image.jpg',
          type: typeof image === 'string' ? 'image/jpeg' : image.type || 'image/jpeg',
        } as any);
      });


    }

    try {
      const response = await api.post('/api/healthreport/receive', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        // Delete formData
        storage.delete('formData');
      
        // Remove from offlineForms list
        const existingOfflineData = storage.getString("offlineForms");
        let parsedOfflineData = existingOfflineData ? JSON.parse(existingOfflineData) : [];
      
        const filteredOfflineData = parsedOfflineData.filter((form: any) => {
          return !(form.truckNumber === truckData.truckNumber && form.date === truckData.date);
        });
      
        storage.set("offlineForms", JSON.stringify(filteredOfflineData));
      
        console.log('Data submitted and removed from MMKV!');
        alert('Health Report Submitted Successfully!');
      
        // Reset everything
        setCompanyId('');
        setData2([]);
        setDestinationBranch([]);
        setDestinationDistrict([]);
        setBranchId('');
        setImageUri([]);
        setCurrentStep(1);
        console.log('response', response.data);
      }
      

      console.log('Form submitted successfully:', response.data);
      alert('Health Report Submitted Successfully!');


      setCompanyId('');
      setData2([]);
      setDestinationBranch([]);
      setDestinationDistrict([]);
      setBranchId('');
     

      setImageUri([]);

      // Reset step
      setCurrentStep(1);
      console.log('response', response.data);

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit Health Report. Please try again.');
      console.log('error', error);
    }
  };


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
    }
  };

  const fetchData3 = async (companyId: any) => {
    try {
      const response = await api.get(
        `/api/group?GroupType=Branch&BranchType=Receiving&ApprovalStatus=APPROVED&CompanyId=${companyId}`

      );

      setDestinationBranch(response.data);
    } catch (error) {
      console.error("Error fetching data3:", error);
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
    }
  };

  useEffect(() => {

    if (branchId) fetchData5(branchId);
  }, [branchId]);


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

              {/* 
                        <View style={styles.content}>
                          <View style={styles.pickerContainer}>
                          <DropDownPicker
                  open={open}
                  value={selectedCompany}
                  items={items}
                  setOpen={setOpen}
                  setValue={setSelectedCompany}
                  setItems={setItems}
                  searchable={true}
                  placeholder="Select Company"
                  onChangeValue={(value) => {
                    const selectedCompanyObj = data2.find((item) => item.value === value);
                    if (selectedCompanyObj) {
                      console.log("Selected Company:", selectedCompanyObj.text);
                    }
                  }}
                />
                          </View>
                        </View> */}
              <View style={styles.content}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCompany}
                    onValueChange={(value) => {


                      setSelectedCompany(value);
                      setCompanyId(value);

                      // ID ke corresponding text dhoondo
                      const selectedCompanyObj = data2.find(item => item.value === value);
                      if (selectedCompanyObj) {
                        setSelectedCompanyName(selectedCompanyObj.text); // Alag state me store karo

                      }
                    }}
                  >
                    <Picker.Item label="Select Company" value="" />
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
                      setBranchId(String(value));
                      const selectedBranch = destinationBranch.find(item => item.id === value);
                      if (selectedBranch) {
                        setSelectedbranch(selectedBranch.name);
                      }
                    }}
                  >
                    <Picker.Item label="Select Branch" value="" />
                    {destinationBranch.map((item, idx) => (
                      <Picker.Item key={idx} label={item.name} value={item.id} />
                    ))}
                  </Picker>
                </View>

              </View>


              <View style={styles.content}>
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.picker}
                    onValueChange={(value) => {


                      // ID ke corresponding text dhoondo
                      const selectedText = destinationDistrict.find(item => item.value === value)?.text || "Not Selected";

                      setSelecteddistrict(selectedText); // Text ko store karo
                      console.log('Selected District:', selectedText);
                    }}
                    selectedValue={selectedDistrict} // Ab text store ho raha hai
                  >
                    <Picker.Item label="Select District location" value="" />
                    {destinationDistrict.map((item, idx) => (
                      <Picker.Item key={idx} label={item.text} value={item.value} />
                    ))}
                  </Picker>

                </View>
              </View>




              <View style={styles.buttoncontent}>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>



            </View>
          )}


    
    

{/* 
          <View >
            <Text>Truck Numbser: {truckData.truckNumber}</Text>
            <Text>Date: {truckData.date}</Text>
            <Text> GrossWeight: {truckData.grossWeight}</Text>
            <Text> Net weight : {truckData.netWeight}</Text>
            <Text> Tare weight : {truckData.tareWeight}</Text>
            <Text> stainingColourPercent : {truckData.stainingColourPercent}</Text>
            <Text>  BlackSmutPercent : {truckData.BlackSmutPercent}</Text>
            <Text>  sproutedPercent : {truckData.sproutedPercent}</Text>
            <Text>   spoiledPercent : {truckData.spoiledPercent}</Text>

          </View> */}

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>


  );
};

export default SubmitTruckData;
