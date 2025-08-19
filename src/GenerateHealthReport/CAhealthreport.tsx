import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Switch, Modal, Platform, Image, ActivityIndicator, FlatList, Button, Linking, Alert, BackHandler } from 'react-native';
import Navbar from '../../App/Navbar';
import useForm from '../../App/Common/Lib/useForm'// Assuming you have a utility function to create form data
import { Picker } from '@react-native-picker/picker';
import { launchCamera } from 'react-native-image-picker';
import styles from '../../theme/Healthreport';
import { PermissionsAndroid, Dimensions } from 'react-native';
import apiClient from '../../service/api/apiInterceptors';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createFormData } from '../../App/Common/Lib/createFormdata';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/Type';

import Storage from '../../utils/Storage';
import md5 from 'md5';


import { SafeAreaView } from 'react-native-safe-area-context';



const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

type ImageAsset = {
    uri: string;
    fileName: string;
    type: string;
};

type Chawl = {
    isCopiedFromFirst: boolean | undefined;
    isCopiedFromPrevious?: boolean;
    length: string;
    breadth: string;
    height: string;
    originalValues?: {
        length: string;
        breadth: string;
        height: string;
    };
};






const CAhealthreport = () => {
    const { t } = useTranslation();
    const { state, updateState } = useForm();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const currentStep = state?.hidden?.currentStep || 0;
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const previousSteps = state?.hidden?.previousSteps || [];
    const [selectedImage, setSelectedImage] = useState(null);
    const [isPressed, setIsPressed] = useState(false);
    const [clientId, setClientId] = useState(null);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);


    const [selectedStorageId, setSelectedStorageId] = useState('');

    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);


    const reportTypeOptions = [
        { label: 'Select Report Type', value: '' },
        { label: 'RECEIVE', value: 'RECEIVE' },

    ];

    const healthReportDispatchTypeOptions = [
        { label: 'Select Dispatch Type', value: '' },
        { label: 'CA', value: 'CA' },
    ];






    useEffect(() => {
        handleSomeAction();
    }, []);

    useEffect(() => {


        if (state.form.clientdata) {
            updateState({
                form: {
                    ...state.form,
                    opition1: '',
                    option2: '',



                },
                fielddata: {
                    ...state.fielddata,
                    Company: null,
                    Branchdata: null,


                }
            });
            CompanyDropdown(state.form.clientdata);

        }




    }, [state.form.clientdata]);



    useEffect(() => {
        if (state.form.option1) {
            console.log("branch id", state.form.option1);
            updateState({
                form: {
                    ...state.form,
                    option2: '',
                    federationType: '',
                    option3: '',
                    fpofpcdata: '',
                    Storagedata: ''
                },
                fielddata: {
                    ...state.fielddata,
                    Branchdata: null,
                    federation: null,
                    fpofpc: null,
                    storageLocation: null
                }
            });
            BranchDropdown(state.form.option1);
        }
    }, [state.form.option1]);

    useEffect(() => {
        if (state.form.option2) {

            updateState({
                form: {
                    ...state.form,
                    federationType: '',
                    option3: '',
                    fpofpcdata: '',
                    Storagedata: ''
                },
                fielddata: {
                    ...state.fielddata,
                    federation: null,
                    fpofpc: null,
                    storageLocation: null
                }
            });
            CaADmin(state.form.option2);
        }
    }, [state.form.option2]);





    useEffect(() => {

        if (state.form.Caadmindata) {
            updateState({
                form: {
                    ...state.form,
                    Storagedata: ''
                },
                fielddata: {
                    ...state.fielddata,
                    storageLocation: null
                }
            });
        }

        Storagelocation(state.form.Caadmindata);

    }, [state.form.Caadmindata]);

    const handleSomeAction = async () => {
        try {

            const clientResponse = await apiClient.get('/api/mobile/group?GroupType=CLIENT');


            if (clientResponse.data && clientResponse.data.length > 0) {

                setGroups(clientResponse.data);

                // Set first client as default and update form state
                const firstClientId = clientResponse.data[0].id;

                setClientId(firstClientId);

                updateState({
                    form: {
                        ...state.form,
                        clientdata: firstClientId // Set the default client in form state
                    }
                });
            } else {
                console.warn('No clients found in response');
            }
        } catch (error) {
            console.error('Error fetching clients:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
        }
    };

    const CompanyDropdown = (clientId: string) => {

        const apiUrl = `/api/group?GroupType=COMPANY&ApprovalStatus=APPROVED&IsActive=true&IsActive=false&parentid=${clientId}`;

        apiClient.get(apiUrl)
            .then((res) => {

                if (res?.data) {
                    updateState({
                        fielddata: {
                            ...state.fielddata,
                            Company: res.data,
                        }
                    });

                } else {
                    console.warn('No companies data received');
                }
            })
            .catch((error) => {
                console.error('Error fetching companies:', {
                    message: error.message,
                    url: apiUrl,
                    response: error.response?.data
                });
            });
    };

    const BranchDropdown = (companyId: string) => {
        const url = `/api/group?GroupType=BRANCH&ApprovalStatus=APPROVED&IsActive=true&IsActive=false&BranchType=PROCURING&BranchType=BOTH&parentid=${companyId}`;
        apiClient.get(url)
            .then((res) => {
                console.log('branch data:', res.data);
                if (res?.data) {
                    updateState({
                        fielddata: {
                            ...state.fielddata,
                            Branchdata: res.data
                        }
                    });
                }
            })
            .catch(console.error);
    };


    const CaADmin = (branchId: string) => {
        const url = `/api/group?grouptype=CAStorage&parentid=${branchId}`;
        console.log('Ca admin:', url); // URL bhi console pe dekh lo
        apiClient.get(url)
            .then((res) => {
                console.log('Ca admin', res.data); // Yeh pura response console pe print karega
                if (res?.data) {
                    updateState({
                        fielddata: {
                            ...state.fielddata,
                            CaAdmin: res.data,
                        }
                    });
                }
            })
            .catch((error) => {
                console.error('API error:', error); // Agar koi error aata hai toh usko bhi console pe dekh lo
            });
    };


    const Storagelocation = (CaAdmin: string) => {
        const url = `/api/storagelocation?StorageType=CA&LocationType=STORAGELOCATION&ApprovalStatus=PENDING&ApprovalStatus=APPROVED&parentid=${CaAdmin}`;

        apiClient.get(url)
            .then((res) => {

                if (res?.data) {
                    updateState({
                        fielddata: {
                            ...state.fielddata,
                            storageLocation: res.data,
                        }
                    });
                }
            })
            .catch((error) => {
                console.error('API error:', error); // Agar koi error aata hai toh usko bhi console pe dekh lo
            });
    };









    const handleDeleteImage = (index) => {
        const updatedImages = [...(state.form?.Files || [])];
        updatedImages.splice(index, 1);
        updateState({
            ...state,
            form: {
                ...state.form,
                Files: updatedImages
            }
        });
    };


    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Camera permission granted');
                    openCamera();
                } else {
                    console.log('Camera permission denied');
                }
            } catch (err) {
                console.warn(err);
            }
        } else {
            openCamera(); // iOS me direct open
        }
    };



    const openCamera = () => {
        launchCamera(
            {
                mediaType: 'photo',
                includeBase64: false,
                cameraType: 'back',
                saveToPhotos: true,
                quality: 0.4,
                maxWidth: 700,
                maxHeight: 700,
            },
            async (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.errorMessage) {
                    console.log('ImagePicker Error: ', response.errorMessage);
                } else if (response.assets && response.assets.length > 0) {
                    const capturedImage = response.assets[0];

                    // Generate MD5 hash from the image URI or fileName
                    const imageHash = md5(capturedImage.uri);

                    // Check if this hash already exists in the current list of files
                    const isDuplicate = state.form?.Files?.some(file => file.hash === imageHash);

                    if (isDuplicate) {
                        console.log('Duplicate image detected. Image will not be added.');
                    } else {
                        const newFile = {
                            uri: Platform.OS === 'android'
                                ? capturedImage.uri
                                : capturedImage.uri.replace('file://', ''),  // iOS mein remove karo, Android mein rehne do
                            fileName: capturedImage.fileName || `photo_${Date.now()}.jpg`,
                            type: capturedImage.type || 'image/jpeg',
                            hash: imageHash, // Adding the MD5 hash
                        };



                        // Update state with the new image (if not a duplicate)
                        updateState({
                            form: {
                                ...state.form,
                                Files: [...(state.form?.Files || []), newFile],
                            },

                        });



                    }
                }
            }
        );
    };

    const handleNext = (nextStep: number) => {
        let result: any = { isValid: true }; // Initialize with default valid state

        // Step 0 validation (company/branch/federation selection)
        if (currentStep === 0) {
            if (!state.form.reportType) {
                alert('Please select a report type');
                return;
            }
            if (!state.form.healthReportDispatchType) {
                alert('Please select a health report dispatch type');
                return;
            }
            if (!state.form.clientdata) {
                alert('Please select a client');
                return;
            }
            if (!state.form.option1) {
                alert('Please select a company');
                return;
            }
            if (!state.form.option2) {
                alert('Please select a branch');
                return;
            }
            if (!state.form.Caadmindata) {
                alert('Please select a CA Admin');
                return;
            }
            if (!state.form.Storagedata) {
                alert('Please select a storage location');
                return;
            }
        }
        // Step 1 validation (basic information)
        else if (currentStep === 1) {
            if (!state.form.Trucknumber || state.form.Trucknumber.trim() === '') {
                alert('Please enter truck number');
                return;
            }
            if (!state.form.grossWeight || isNaN(parseFloat(state.form.grossWeight))) {
                alert('Please enter a valid gross weight');
                return;
            }
            if (!state.form.tareWeight || isNaN(parseFloat(state.form.tareWeight))) {
                alert('Please enter a valid tare weight');
                return;
            }
            if (!state.form.date) {
                alert('Please select a date');
                return;
            }
            if (!state.form.bagCount || isNaN(parseInt(state.form.bagCount))) {
                alert('Please enter a valid bag count');
                return;
            }
            if (!state.form.size || isNaN(parseFloat(state.form.size))) {
                alert('Please enter a valid size');
                return;
            }
        }
        // Step 2 validation (quality parameters)
        else if (currentStep === 2) {
            // Validate percentages if switches are on
            if (state.form.stainingColour) {
                if (!state.form.stainingColourPercent || isNaN(parseFloat(state.form.stainingColourPercent))) {
                    alert('Please enter staining color percentage');
                    return;
                }
                if (parseFloat(state.form.stainingColourPercent) > 100) {
                    alert('Staining color percentage cannot exceed 100%');
                    return;
                }
            }

            if (state.form.blackSmutOnion) {
                if (!state.form.blackSmutPercent || isNaN(parseFloat(state.form.blackSmutPercent))) {
                    alert('Please enter black smut percentage');
                    return;
                }
                if (parseFloat(state.form.blackSmutPercent) > 100) {
                    alert('Black smut percentage cannot exceed 100%');
                    return;
                }
            }

            if (state.form.sproutedOnion) {
                if (!state.form.sproutedPercent || isNaN(parseFloat(state.form.sproutedPercent))) {
                    alert('Please enter sprouted percentage');
                    return;
                }
                if (parseFloat(state.form.sproutedPercent) > 100) {
                    alert('Sprouted percentage cannot exceed 100%');
                    return;
                }
            }

            if (state.form.spoiledOnion) {
                if (!state.form.spoiledPercent || isNaN(parseFloat(state.form.spoiledPercent))) {
                    alert('Please enter spoiled percentage');
                    return;
                }
                if (parseFloat(state.form.spoiledPercent) > 100) {
                    alert('Spoiled percentage cannot exceed 100%');
                    return;
                }
            }

            if (state.form.onionSkin === "SINGLE") {
                if (!state.form.onionSkinPercent || isNaN(parseFloat(state.form.onionSkinPercent))) {
                    alert('Please enter onion skin percentage');
                    return;
                }
                if (parseFloat(state.form.onionSkinPercent) > 100) {
                    alert('Onion skin percentage cannot exceed 100%');
                    return;
                }
            }

            if (state.form.moisture === "WET") {
                if (!state.form.moisturePercent || isNaN(parseFloat(state.form.moisturePercent))) {
                    alert('Please enter moisture percentage');
                    return;
                }
                if (parseFloat(state.form.moisturePercent) > 100) {
                    alert('Moisture percentage cannot exceed 100%');
                    return;
                }
            }

            if (state.form.isSpoiledPercentVisible) {
                if (!state.form.SpoliedPercent || isNaN(parseFloat(state.form.SpoliedPercent))) {
                    alert('Please enter spoiled percentage');
                    return;
                }
                if (parseFloat(state.form.SpoliedPercent) > 100) {
                    alert('Spoiled percentage cannot exceed 100%');
                    return;
                }
            }

            if (!state.form.SpoliedBranch || state.form.SpoliedBranch.trim() === '') {
                alert('Please enter branch person name');
                return;
            }
        }


        // if (currentStep === 0) {
        //     if (!selectedHelthReport) {
        //         alert('Please select a health report type');
        //         return;
        //     }
        //     // No other validation needed for step 0
        // } 
        // // Step 1 validation
        // else if (currentStep === 1) {
        //     result = validateStepOne(state.form);
        // } 
        // // Step 2 validation
        // else if (currentStep === 2) {
        //     result = validateStepTwo(state.form);
        // }
        // // Step 3 validation
        // else if (currentStep === 3) {
        //     result = validateStepThree(state.form);
        // }

        // // Check validation result (only if we did validation)
        // if (currentStep !== 0 && !result?.isValid) {
        //     alert(result.message);
        //     return;
        // }

        // Proceed to next step
        updateState({
            ...state,
            hidden: {
                ...state.hidden,
                previousSteps: [...previousSteps, currentStep],
                currentStep: nextStep
            }
        });
    };

    const handlePrevious = () => {
        if (previousSteps.length > 0) {
            const lastStep = previousSteps[previousSteps.length - 1];

            updateState({
                ...state,
                hidden: {
                    ...state.hidden,
                    previousSteps: previousSteps.slice(0, -1),
                    currentStep: lastStep
                }
            });
        }
    };

    const handleDateConfirm = (selectedDate: Date) => {
        setDatePickerVisibility(false);
        if (selectedDate) {
            // Format the date to ISO string without milliseconds
            const formattedDate = selectedDate.toISOString().split('.')[0] + 'Z';
            updateState({
                ...state,
                form: {
                    ...state.form,
                    date: formattedDate
                }
            });
        }
    };


    const handleGrossWeightChange = (text) => {
        const tare = parseFloat(state.form?.tareWeight) || 0;
        const gross = parseFloat(text) || 0;
        const net = gross - tare;

        updateState({
            ...state,
            form: {
                ...state.form,
                grossWeight: text,
                netWeight: isNaN(net) ? '' : net.toString(),
            },
        });
    };

    const handleTareWeightChange = (text) => {
        const gross = parseFloat(state.form?.grossWeight) || 0;
        const tare = parseFloat(text) || 0;
        const net = gross - tare;

        updateState({
            ...state,
            form: {
                ...state.form,
                tareWeight: text,
                netWeight: isNaN(net) ? '' : net.toString(),
            },
        });
    };




    // Update the handleSubmit function to include only required fields
    const handleSubmit = () => {
        // Create a new object with only the required fields
        const payload = {
            ReportType: state.form.reportType,
            HealthReportDispatchType: state.form.healthReportDispatchType,

            CAStorageId: state.form.StorageData,
            TruckNumber: state.form?.Trucknumber || '',
            GrossWeight: parseFloat(state.form?.grossWeight) || 0,
            NetWeight: parseFloat(state.form?.netWeight) || 0,
            TareWeight: parseFloat(state.form?.tareWeight) || 0,
            Date: state.form?.date || new Date().toISOString(),
            StainingColour: state.form?.stainingColour || false,
            StainingColourPercent: parseFloat(state.form?.stainingColourPercent) || 0,
            BagCount: parseInt(state.form?.bagCount) || 0,
            Size: parseInt(state.form?.size) || 0,
            BlackSmutOnion: state.form?.blackSmutOnion || false,
            BlackSmutPercent: parseFloat(state.form?.blackSmutPercent) || 0,
            SproutedOnion: state.form?.sproutedOnion || false,
            SproutedPercent: parseFloat(state.form?.sproutedPercent) || 0,
            OnionSkin: state.form?.onionSkin || 'DOUBLE',
            OnionSkinPercent: parseFloat(state.form?.onionSkinPercent) || 0,
            Moisture: state.form?.moisture || 'DRY',
            MoisturePercent: parseFloat(state.form?.moisturePercent) || 0,
            SpoiledOnion: state.form?.spoiledOnion || false,
            SpoiledPercent: parseFloat(state.form?.spoiledPercent) || 0,
            FPCPersonName: state.form?.SpoliedBranch || '',
            Files: state.form?.Files || [],
            Comment: state.form?.SpoliedComment || ''
        };

        // Ensure required fields are present
        if (!payload.Date) {
            alert('Please select a date');
            return;
        }

        const formData = createFormData(payload);

        setIsPressed(true); // Show loading indicator

        const token = Storage.getString('userToken');
        console.log('Submitting form with token:', token);
        apiClient.post('/api/mobile/healthreport/ca/move/dispatch', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`


            },
        })
            .then(response => {
                console.log('Submission successful:', response.data);
                alert('Form submitted successfully!');
                updateState({
                    ...state,
                    form: null,
                    hidden: { ...state.hidden, currentStep: 0 },
                });
            })
            .catch(error => {
                console.error('Submission failed:', error);
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                    console.error('Response headers:', error.response.headers);
                    alert(`Submission failed: ${error.response.data.message || error.response.status}`);
                } else {
                    alert('Submission failed. Please check console for details.');
                }
            })
            .finally(() => {
                setIsPressed(false); // Hide loading indicator
            });
    };














    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <SafeAreaView style={styles.container}>

                <View style={styles.customHeader}>
                    <TouchableOpacity onPress={() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'RecieveDhasboard' }],
                        });
                    }}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />

                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>CA Health Report form</Text>
                </View>




                {/* ScrollView with content */}
                <ScrollView
                    contentContainerStyle={styles.scrollView}

                >


                    {currentStep === 0 && (
                        <View style={styles.onecontainers}>
                            <View style={styles.content}>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={state.form.reportType}
                                        onValueChange={(value) => updateState({
                                            form: {
                                                ...state.form,
                                                reportType: value,
                                                healthReportDispatchType: '',
                                                clientdata: '',
                                                option1: '',
                                                option2: '',
                                                Caadmindata: '',
                                                Storagedata: ''
                                            },
                                            fielddata: {
                                                ...state.fielddata,
                                                Company: null,
                                                Branchdata: null,
                                                CaAdmin: null,
                                                storageLocation: null
                                            }
                                        })}
                                    >
                                        {reportTypeOptions.map((item) => (
                                            <Picker.Item key={item.value} label={item.label} value={item.value} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.content}>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={state.form.healthReportDispatchType}
                                        onValueChange={(value) => updateState({
                                            form: {
                                                ...state.form,
                                                healthReportDispatchType: value,
                                                clientdata: '',
                                                option1: '',
                                                option2: '',
                                                Caadmindata: '',
                                                Storagedata: ''
                                            },
                                            fielddata: {
                                                ...state.fielddata,
                                                Company: null,
                                                Branchdata: null,
                                                CaAdmin: null,
                                                storageLocation: null
                                            }
                                        })}
                                    >
                                        {healthReportDispatchTypeOptions.map((item) => (
                                            <Picker.Item key={item.value} label={item.label} value={item.value} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.content}>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={state.form.clientdata}
                                        onValueChange={(value) => {
                                            updateState({
                                                form: {
                                                    ...state.form,
                                                    clientdata: value,
                                                    option1: '',
                                                    option2: '',
                                                    Caadmindata: '',
                                                    Storagedata: ''
                                                },
                                                fielddata: {
                                                    ...state.fielddata,
                                                    Company: null,
                                                    Branchdata: null,
                                                    CaAdmin: null,
                                                    storageLocation: null
                                                }
                                            });
                                            if (value) {
                                                CompanyDropdown(value);
                                            }
                                        }}
                                    >
                                        <Picker.Item label="Select Client" value="" />
                                        {groups.map((item) => {
                                            const parentId = item?.parentList?.[0]?.id || item.id;
                                            return (
                                                <Picker.Item
                                                    key={item.id}
                                                    label={item.name}
                                                    value={parentId}
                                                />
                                            );
                                        })}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.content}>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={state.form.option1}
                                        onValueChange={(value) => {
                                            updateState({
                                                form: {
                                                    ...state.form,
                                                    option1: value,
                                                    option2: '',
                                                    Caadmindata: '',
                                                    Storagedata: ''
                                                },
                                                fielddata: {
                                                    ...state.fielddata,
                                                    Branchdata: null,
                                                    CaAdmin: null,
                                                    storageLocation: null
                                                }
                                            });
                                            if (value) {
                                                BranchDropdown(value);
                                            }
                                        }}
                                    >
                                        <Picker.Item label="Select Company Name" value="" />
                                        {state.fielddata.Company?.map((item) => (
                                            <Picker.Item
                                                key={item.id}
                                                label={item.name}
                                                value={item.id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.content}>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={state.form.option2}
                                        onValueChange={(value) => {
                                            updateState({
                                                form: {
                                                    ...state.form,
                                                    option2: value,
                                                    Caadmindata: '',
                                                    Storagedata: ''
                                                },
                                                fielddata: {
                                                    ...state.fielddata,
                                                    CaAdmin: null,
                                                    storageLocation: null
                                                }
                                            });
                                            if (value) {
                                                CaADmin(value);
                                            }
                                        }}
                                    >
                                        <Picker.Item label="Select Branch Name" value="" />
                                        {state.fielddata.Branchdata?.map((item) => (
                                            <Picker.Item key={item.id} label={item.name} value={item.id} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.content}>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={state.form.Caadmindata}
                                        onValueChange={(value) => {
                                            updateState({
                                                form: {
                                                    ...state.form,
                                                    Caadmindata: value,
                                                    Storagedata: ''
                                                },
                                                fielddata: {
                                                    ...state.fielddata,
                                                    storageLocation: null
                                                }
                                            });
                                            if (value) {
                                                Storagelocation(value);
                                            }
                                        }}
                                    >
                                        <Picker.Item label="Select CA Admin" value="" />
                                        {state.fielddata.CaAdmin?.map((item) => (
                                            <Picker.Item key={item.id} label={item.name} value={item.id} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.content}>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={state.form.Storagedata}
                                        onValueChange={(value) => {
                                            console.log('Selected Storage ID:', value);
                                            updateState({
                                                form: {
                                                    ...state.form,
                                                    Storagedata: value
                                                }
                                            });
                                            setSelectedStorageId(value || '');
                                        }}
                                    >
                                        <Picker.Item label="Select storage" value="" />
                                        {state.fielddata.storageLocation?.map((item) => (
                                            <Picker.Item key={item.id} label={item.name} value={item.id} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.buttoncontent}>
                                <TouchableOpacity style={styles.button} onPress={() => handleNext(1)}>
                                    <Text style={styles.buttonText}>{t('Next')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    )}

                    {/* Step 2 - Basic Information */}
                    {currentStep === 1 && (
                        <View style={styles.onecontainers}>

                            <TextInput
                                style={styles.input}
                                placeholder={t('TruckNumber')}
                                value={state.form?.Trucknumber || ''}
                                onChangeText={(text) => {
                                    const upperText = text.toUpperCase();
                                    updateState({
                                        ...state,
                                        form: {
                                            ...state.form,
                                            Trucknumber: upperText,
                                        }
                                    });
                                }}
                                autoCapitalize="characters"
                                keyboardType="default" // Yeh aap 'keyb' likh rahe the, pura likha
                            />

                            <TextInput
                                style={styles.input}
                                placeholder={t('Grossweight')}
                                value={state.form?.grossWeight || ''}
                                onChangeText={handleGrossWeightChange}
                                keyboardType="numeric"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder={t('Tareweight')}
                                value={state.form?.tareWeight || ''}
                                onChangeText={handleTareWeightChange}
                                keyboardType="numeric"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder={t('Netweight')}
                                value={state.form?.netWeight || ''}
                                editable={false}
                            />


                            <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        editable={false}
                                        placeholder={t('SelectDate')}
                                        value={state.form?.date ? new Date(state.form.date).toLocaleDateString() : ''}
                                    />
                                </View>
                            </TouchableOpacity>

                            {isDatePickerVisible && (
                                <DateTimePicker
                                    value={state.form?.date ? new Date(state.form.date) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, date) => handleDateConfirm(date)}
                                    minimumDate={threeMonthsAgo}
                                    maximumDate={today}
                                />
                            )}

                            <TextInput
                                style={styles.input}
                                placeholder={t('Bagcount')}
                                value={state.form?.bagCount || ''}
                                onChangeText={(text) => updateState({
                                    ...state,
                                    form: {
                                        ...state.form,
                                        bagCount: text
                                    }
                                })}
                                keyboardType="numeric"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder={t('Size')}
                                value={state.form?.size || ''}
                                onChangeText={(text) => updateState({
                                    ...state,
                                    form: {
                                        ...state.form,
                                        size: text
                                    }
                                })}
                                keyboardType="numeric"
                            />


                            <View style={styles.buttoncontent}>
                                <TouchableOpacity style={styles.button} onPress={handlePrevious}>
                                    <Text style={styles.buttonText}>{t('Previous')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={() => handleNext(2)}>
                                    <Text style={styles.buttonText}>{t('Next')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.thirdcontainers}>

                            {/* Staining Colour */}
                            <View style={styles.switchContainer}>
                                <Text style={styles.text}>{t("stainingColor")}</Text>
                                <Switch
                                    value={state.form?.stainingColour || false}
                                    onValueChange={(value) =>
                                        updateState({
                                            ...state,
                                            form: {
                                                ...state.form,
                                                stainingColour: value,
                                                stainingColourPercent: value ? state.form?.stainingColourPercent : ''
                                            }
                                        })
                                    }
                                    trackColor={{ false: '#F6A00191', true: '#FF9500' }}
                                    thumbColor={state.form?.stainingColour ? 'white' : '#f4f3f4'}
                                />
                            </View>

                            {state.form?.stainingColour && (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('StainingPercent')}
                                        value={state.form?.stainingColourPercent || ''}
                                        onChangeText={(text) =>
                                            updateState({
                                                ...state,
                                                form: { ...state.form, stainingColourPercent: text }
                                            })
                                        }
                                        keyboardType="numeric"
                                    />
                                    {parseFloat(state.form?.stainingColourPercent) > 100 && (
                                        <Text >
                                            {t('StainingcolorWaringText')}
                                        </Text>
                                    )}
                                </>
                            )}


                            {/* Black Smut Onion */}
                            <View style={styles.switchContainer}>
                                <Text style={styles.text}>{t('BlacksmutOnion')}</Text>
                                <Switch
                                    value={state.form?.blackSmutOnion || false}
                                    onValueChange={(value) =>
                                        updateState({
                                            ...state,
                                            form: {
                                                ...state.form,
                                                blackSmutOnion: value,
                                                blackSmutPercent: value ? state.form?.blackSmutPercent : ''
                                            }
                                        })
                                    }
                                    trackColor={{ false: '#F6A00191', true: '#FF9500' }}
                                    thumbColor={state.form?.blackSmutOnion ? 'white' : '#f4f3f4'}
                                />
                            </View>

                            {state.form?.blackSmutOnion && (
                                <>

                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('BlacksmutOnionpercent')}
                                        value={state.form?.blackSmutPercent || ''}
                                        onChangeText={(text) =>
                                            updateState({
                                                ...state,
                                                form: { ...state.form, blackSmutPercent: text }
                                            })
                                        }
                                        keyboardType="numeric"
                                    />
                                    {parseFloat(state.form?.blackSmutPercent) > 100 && (
                                        <Text>
                                            {t('BlacksmutText')}
                                        </Text>
                                    )}
                                </>
                            )}

                            {/* Sprouted Onion */}
                            <View style={styles.switchContainer}>
                                <Text style={styles.text}>{t('SproutedOnion')}</Text>
                                <Switch
                                    value={state.form?.sproutedOnion || false}
                                    onValueChange={(value) =>
                                        updateState({
                                            ...state,
                                            form: {
                                                ...state.form,
                                                sproutedOnion: value,
                                                sproutedPercent: value ? state.form?.sproutedPercent : ''
                                            }
                                        })
                                    }
                                    trackColor={{ false: '#F6A00191', true: '#FF9500' }}
                                    thumbColor={state.form?.sproutedOnion ? 'white' : '#f4f3f4'}
                                />
                            </View>

                            {state.form?.sproutedOnion && (
                                <>

                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('SproutedOnionpercent')}
                                        value={state.form?.sproutedPercent || ''}
                                        onChangeText={(text) =>
                                            updateState({
                                                ...state,
                                                form: { ...state.form, sproutedPercent: text }
                                            })
                                        }
                                        keyboardType="numeric"
                                    />
                                    {parseFloat(state.form?.sproutedPercent) > 100 && (
                                        <Text >
                                            {t('SproutedText')}
                                        </Text>
                                    )}

                                </>
                            )}

                            {/* Spoiled Onion */}
                            <View style={styles.switchContainer}>
                                <Text style={styles.text}>{t('SpoiledOnion')}</Text>
                                <Switch
                                    value={state.form?.spoiledOnion || false}
                                    onValueChange={(value) =>
                                        updateState({
                                            ...state,
                                            form: {
                                                ...state.form,
                                                spoiledOnion: value,
                                                spoiledPercent: value ? state.form?.spoiledPercent : ''
                                            }
                                        })
                                    }
                                    trackColor={{ false: '#F6A00191', true: '#FF9500' }}
                                    thumbColor={state.form?.spoiledOnion ? 'white' : '#f4f3f4'}
                                />
                            </View>

                            {state.form?.spoiledOnion && (
                                <>

                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('SpoiledOnionpercent')}
                                        value={state.form?.spoiledPercent || ''}
                                        onChangeText={(text) =>
                                            updateState({
                                                ...state,
                                                form: { ...state.form, spoiledPercent: text }
                                            })
                                        }
                                        keyboardType="numeric"
                                    />

                                    {parseFloat(state.form?.spoiledPercent) > 100 && (
                                        <Text>
                                            {t('SpoiledText')}
                                        </Text>
                                    )}

                                </>
                            )}

                            {/* Onion Skin */}
                            <View style={styles.switchContainer}>
                                <Text style={styles.text}>
                                    {t('Onionskin') + ' : ' + (state.form?.onionSkin === 'SINGLE' ? t('Single') : t('Double'))}
                                </Text>
                                <Switch
                                    value={state.form?.onionSkin === "SINGLE"}
                                    onValueChange={(value) =>
                                        updateState({
                                            ...state,
                                            form: {
                                                ...state.form,
                                                onionSkin: value ? 'SINGLE' : 'DOUBLE',
                                                onionSkinPercent: value ? state.form?.onionSkinPercent : ''
                                            }
                                        })
                                    }
                                    trackColor={{ false: '#F6A00191', true: '#FF9500' }}
                                    thumbColor={state.form?.onionSkin === "SINGLE" ? "white" : "#f4f3f4"}
                                />
                            </View>

                            {state.form?.onionSkin === "SINGLE" && (
                                <>

                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('Onionskinsinglepercent')}
                                        value={state.form?.onionSkinPercent || ''}
                                        onChangeText={(text) =>
                                            updateState({
                                                ...state,
                                                form: { ...state.form, onionSkinPercent: text }
                                            })
                                        }
                                        keyboardType="numeric"
                                    />
                                    {parseFloat(state.form?.onionSkinPercent) > 100 && (
                                        <Text>
                                            {t('OnionSkinSingle')}
                                        </Text>
                                    )}

                                </>
                            )}


                            {/* Moisture */}
                            <View style={styles.switchContainer}>
                                <Text style={styles.text}>
                                    {t('Moisture') + ' : ' + (state.form?.moisture === 'WET' ? t('Wet') : t('Dry'))}
                                </Text>
                                <Switch
                                    value={state.form?.moisture === "WET"}
                                    onValueChange={(value) =>
                                        updateState({
                                            ...state,
                                            form: {
                                                ...state.form,
                                                moisture: value ? 'WET' : 'DRY',
                                                moisturePercent: value ? state.form?.moisturePercent : ''
                                            }
                                        })
                                    }
                                    trackColor={{ false: '#F6A00191', true: '#FF9500' }}
                                    thumbColor={state.form?.moisture === "WET" ? "white" : "#f4f3f4"}
                                />
                            </View>

                            {state.form?.moisture === "WET" && (
                                <>

                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('Moisturewetpercent')}
                                        value={state.form?.moisturePercent || ''}
                                        onChangeText={(text) =>
                                            updateState({
                                                ...state,
                                                form: { ...state.form, moisturePercent: text }
                                            })
                                        }
                                        keyboardType="numeric"
                                    />

                                    {parseFloat(state.form?.moisturePercent) > 100 && (
                                        <Text >
                                            {t('MoistureWet')}
                                        </Text>
                                    )}

                                </>
                            )}

                            {/* Spoiled Switch and Percent */}
                            <View>
                                <Text style={styles.text}>{t('Spoiled')}</Text>
                                <Switch
                                    value={state.form?.isSpoiledPercentVisible || false}
                                    onValueChange={(value) =>
                                        updateState({
                                            ...state,
                                            form: { ...state.form, isSpoiledPercentVisible: value }
                                        })
                                    }
                                    trackColor={{ false: '#F6A00191', true: '#FF9500' }}
                                    thumbColor={state.form?.isSpoiledPercentVisible ? "white" : "#f4f3f4"}
                                />
                            </View>

                            {state.form?.isSpoiledPercentVisible && (
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('spoiledperecent')}
                                    value={state.form?.SpoliedPercent || ''}
                                    onChangeText={(text) =>
                                        updateState({
                                            ...state,
                                            form: { ...state.form, SpoliedPercent: text }
                                        })
                                    }
                                    keyboardType="numeric"
                                />
                            )}

                            {/* Comments and Branch person name */}
                            <TextInput
                                style={styles.input}
                                placeholder={t('typecomment')}
                                value={state.form?.SpoliedComment || ''}
                                onChangeText={(text) =>
                                    updateState({
                                        ...state,
                                        form: { ...state.form, SpoliedComment: text }
                                    })
                                }
                            />

                            <TextInput
                                style={styles.input}
                                placeholder={t('branchpersonname')}
                                value={state.form?.SpoliedBranch || ''}
                                onChangeText={(text) =>
                                    updateState({
                                        ...state,
                                        form: { ...state.form, SpoliedBranch: text }
                                    })
                                }
                            />

                            {/* Navigation Buttons */}
                            <View style={styles.buttoncontent}>
                                <TouchableOpacity style={styles.button} onPress={handlePrevious}>
                                    <Text style={styles.buttonText}>{t('Previous')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={() => handleNext(3)}>
                                    <Text style={styles.buttonText}>{t('Next')}</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={{ flex: 1, padding: 20 }}>
                            {/* Camera Button */}
                            <View style={styles.buttoncontent}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={requestCameraPermission}
                                    disabled={(state.form?.Files || []).length >= 9}
                                >
                                    <MaterialIcons name="camera" size={30} color="white" />
                                    <Text style={styles.buttonText}>{t('PickfromCamera')}</Text>
                                </TouchableOpacity>
                            </View>

                            {(state.form?.Files || []).length < 3 && (state.form?.Files || []).length > 0 && (
                                <Text style={styles.warningText}>

                                    You need to upload atleast three images

                                </Text>
                            )}
                            {(state.form?.Files || []).length > 9 && (
                                <Text style={styles.warningText}>
                                    You need to upload atleast Nine images
                                </Text>
                            )}

                            {/* Previous and Submit Buttons */}
                            <View style={styles.buttoncontent}>
                                <TouchableOpacity style={styles.button} onPress={handlePrevious}>
                                    <Text style={styles.buttonText}>{t('Previous')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleSubmit}


                                    disabled={(state.form?.Files || []).length < 3 || (state.form?.Files || []).length > 9 || isPressed} // Disable submit if image count is out of range
                                >

                                    {isPressed ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.buttonText}>
                                            {t('submit')}
                                        </Text>
                                    )}

                                </TouchableOpacity>
                            </View>

                            {/* Image Grid */}
                            <View style={styles.imageGrid}>
                                {(state.form?.Files || []).map((item, index) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <TouchableOpacity onPress={() => setSelectedImage(item.uri)}>
                                            <Image source={{ uri: item.uri }} style={styles.image} />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.deleteIcon}
                                            onPress={() => handleDeleteImage(index)}
                                        >
                                            <MaterialIcons name="cancel" size={24} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>






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
                    )}





                </ScrollView>

            </SafeAreaView>
        </KeyboardAvoidingView>
    );

};



export default CAhealthreport;