import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Switch, Modal, Platform, Image, ActivityIndicator, FlatList, Button, Linking, Alert, BackHandler } from 'react-native';

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
import VideoPlayer from 'react-native-video'; // 👈 yeh sirf video play karne ke liye
import { Video as VideoCompressor } from 'react-native-compressor';

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
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
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


    const sizeOptions = [
        '20-25',
        '26-30',
        '31-35',
        '36-40',
        '41-45',
        '46-50',
        '51-55',
        '56-60'
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



    const requestvideoPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Camera permission granted');
                    openCameraForVideo();
                } else {
                    console.log('Camera permission denied');
                }
            } catch (err) {
                console.warn(err);
            }
        } else {
            openCameraForVideo(); // iOS me direct open
        }
    };

    const openCameraForVideo = () => {
        launchCamera(
            {
                mediaType: 'video',
                videoQuality: 'high', // high quality capture, baad me compress hoga
                durationLimit: 30,
                saveToPhotos: true,
            },
            async (response) => {
                if (response.assets && response.assets.length > 0) {
                    const capturedVideo = response.assets[0];

                    // Max 2 videos check
                    if ((state.form?.Files || []).filter(f => f.type?.startsWith("video")).length >= 2) {
                        Alert.alert("Limit", "Maximum 2 videos allowed.");
                        return;
                    }

                    try {
                        // Show compression UI
                        setIsCompressing(true);
                        setCompressionProgress(0);

                        // 👉 Compress the video
                        const compressedUri = await VideoCompressor.compress(
                            capturedVideo.uri,
                            {
                                compressionMethod: 'auto',
                            },
                            (progress) => {
                                console.log('Compression Progress: ', progress);
                                setCompressionProgress(progress); // Update progress (0 to 1)
                            }
                        );

                        console.log("Original URI:", capturedVideo.uri);
                        console.log("Compressed URI:", compressedUri);

                        const newVideo = {
                            uri: Platform.OS === 'android' ? compressedUri : compressedUri.replace('file://', ''),
                            fileName: capturedVideo.fileName || `video_${Date.now()}.mp4`,
                            type: capturedVideo.type || 'video/mp4',
                        };

                        updateState({
                            form: {
                                ...state.form,
                                Files: [...(state.form?.Files || []), newVideo],
                            },
                        });
                    } catch (error) {
                        console.log("Video compression error:", error);
                        Alert.alert("Error", "Failed to compress video");
                    } finally {
                        // Hide compression UI
                        setIsCompressing(false);
                        setCompressionProgress(0);
                    }
                }
            }
        );
    };



    const handleNext = (nextStep: number) => {
        let result: any = { isValid: true }; // Initialize with default valid state

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

        else if (currentStep === 1) {


            const truckNumber = state.form.Trucknumber || "";


            if (truckNumber.length < 6) {
                alert("Truck number must be at least 6 characters");
                return;
            }

            // ✅ Maximum length check
            if (truckNumber.length > 12) {
                alert("Truck number must not be more than 12 characters");
                return;
            }


            // Gross weight validation
            if (!state.form.grossWeight || isNaN(parseFloat(state.form.grossWeight))) {
                alert('Please enter a valid gross weight');
                return;
            }

            // Tare weight validation
            if (!state.form.tareWeight || isNaN(parseFloat(state.form.tareWeight))) {
                alert('Please enter a valid tare weight');
                return;
            }

            // Net weight validation (Gross - Tare >= 0)
            const netWeight = parseFloat(state.form.grossWeight) - parseFloat(state.form.tareWeight);
            if (netWeight < 0) {
                alert('Net weight cannot be negative');
                return;
            }

            // Date validation
            if (!state.form.date) {
                alert('Please select a date');
                return;
            }

            // Bag count validation
            if (!state.form.bagCount || isNaN(parseInt(state.form.bagCount))) {
                alert('Please enter a valid bag count');
                return;
            }


        }


        else if (currentStep === 2) {


            if (!state.form.SpoliedBranch || state.form.SpoliedBranch.trim() === '') {
                alert('Please enter branch person name');
                return;
            }
        }





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





    const uploadVideos = async (files: any[]) => {

        try {




            const videoFormData = new FormData();

            setIsSubmitted(true); // Disable submit button

            files
                .filter(file => file.type?.startsWith("video")) // sirf videos
                .forEach((video, index) => {
                    videoFormData.append("Files", {
                        uri: video.uri,
                        type: video.type,
                        name: video.fileName || `video_${index}.mp4`,
                    } as any);
                });

            // 👇 dispatchId state se nikala
            const dispatchId = state.hidden?.dispatchId;

            if (!dispatchId) {
                throw new Error("Dispatch ID missing in state");
            }

            const response = await apiClient.post(
                `/api/mobile/healthreport/videoupload/${dispatchId}`,
                videoFormData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",

                    },
                }
            );

            console.log("Video upload success:", response.data);
            Alert.alert("Success", "HealthReport uploaded successfully");
            updateState({
                ...state,
                form: null,
                hidden: { ...state.hidden, currentStep: 0 }
            });

            return response.data;
        } catch (error: any) {
            setIsSubmitted(false);
            console.error("Video upload failed:", error.response?.data || error.message);
            throw error;
        }
    };



    // 🔹 Dispatch API call
    const handleSubmit = () => {

        const filesLength = (state.form?.Files || []).length;

        if (filesLength < 3) {
            alert("Please select at least 3 images.");
            return;
        }




        const payload = {
            ReportType: state.form.reportType,
            HealthReportDispatchType: state.form.healthReportDispatchType,
            CAStorageId: state.form.StorageData,
            TruckNumber: state.form?.Trucknumber || "",
            GrossWeight: parseFloat(state.form?.grossWeight) || 0,
            NetWeight: parseFloat(state.form?.netWeight) || 0,
            TareWeight: parseFloat(state.form?.tareWeight) || 0,
            Date: state.form?.date || new Date().toISOString(),
            StainingColour: false,
            StainingColourPercent: 0,
            BagCount: parseInt(state.form?.bagCount) || 0,
            Size: state.form?.size || "46-50",
            BlackSmutOnion: false,
            BlackSmutPercent: 0,
            SproutedOnion: false,
            SproutedPercent: 0,
            OnionSkin: "DOUBLE",
            OnionSkinPercent: 0,
            Moisture: "DRY",
            MoisturePercent: 0,
            SpoiledOnion: false,
            SpoiledPercent: 0,
            FPCPersonName: state.form?.SpoliedBranch || "",
            Files: (state.form?.Files || []).filter(f => !f.type?.startsWith("video")), // sirf images dispatch me
            Comment: state.form?.SpoliedComment || "",
        };

        if (!payload.Date) {
            alert("Please select a date");
            return;
        }

        const formData = createFormData(payload);
        setIsPressed(true);

        const token = Storage.getString("userToken");

        apiClient
            .post("/api/mobile/healthreport/ca/move/dispatch", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(async (response) => {
                console.log("Submission successful:", response.data);

                if (response.data?.id) {
                    const newId = response.data.id; // ✅ dispatch ID
                    console.log("New Dispatch ID:", newId);





                    updateState({
                        ...state,
                        form: null,
                        hidden: { ...state.hidden, currentStep: 3, dispatchId: newId }
                    });
                } else {
                    throw new Error("ID not found in dispatch response!");
                }
            })
            .catch((error) => {
                console.error("Submission failed:", error);
                if (error.response) {
                    alert(
                        `Submission failed: ${error.response.data.message || error.response.status}`
                    );
                } else {
                    alert("Submission failed. Please check console for details.");
                }
            })
            .finally(() => {
                setIsPressed(false);
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




                <Modal
                    visible={isCompressing}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={compressionStyles.overlay}>
                        <View style={compressionStyles.container}>
                            <ActivityIndicator size="large" color="#FF9500" />
                            <Text style={compressionStyles.text}>Compressing video...</Text>
                            <Text style={compressionStyles.progress}>
                                {Math.round(compressionProgress * 100)}% complete
                            </Text>
                        </View>
                    </View>
                </Modal>




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

                                    // ✅ Min length aur max length validation
                                    if (upperText.length <= 12) {
                                        updateState({
                                            ...state,
                                            form: {
                                                ...state.form,
                                                Trucknumber: upperText,
                                            }
                                        });
                                    }
                                }}
                                autoCapitalize="characters"
                                keyboardType="default"
                                maxLength={12} // Max length fix kar diya
                                onBlur={() => {
                                    if ((state.form?.Trucknumber || '').length < 6) {
                                        alert('Truck number must be at least 6 characters');
                                    }
                                }}
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
                                maxLength={5}
                            />
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={state.form?.size || "46-50"}
                                    onValueChange={(value) => {
                                        console.log("Selected Size:", value);
                                        updateState({
                                            ...state,
                                            form: {
                                                ...state.form,
                                                size: value,
                                            },
                                        });
                                    }}
                                >
                                    <Picker.Item label="Select Onion Size" value="" />
                                    {sizeOptions.map((option) => (
                                        <Picker.Item key={option} label={option} value={option} />
                                    ))}
                                </Picker>
                            </View>

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
                        <View style={{ flex: 1, padding: 20 }}>
                            {/* Camera Button */}
                            <View style={styles.buttoncontent}>
                                <TouchableOpacity
                                    style={[
                                        styles.Camerabutton,
                                        (state.form?.Files || []).length >= 9 && styles.disabledButton
                                    ]}
                                    onPress={() => {
                                        if ((state.form?.Files || []).length >= 9) {
                                            Alert.alert(
                                                "Maximum  image Limit Reached",
                                                "You can only capture up to Maximum  9 images.",
                                                [{ text: "OK" }]
                                            );
                                        } else {
                                            requestCameraPermission();
                                        }
                                    }}
                                >
                                    <MaterialIcons name="camera" size={30} color="white" />
                                    <Text style={styles.buttonText}>{t('PickfromCamera')}</Text>
                                </TouchableOpacity>
                            </View>





                            {/* Previous and Submit Buttons */}
                            <View style={styles.buttoncontent}>
                                <TouchableOpacity style={styles.button} onPress={handlePrevious}>
                                    <Text style={styles.buttonText}>{t('Previous')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleSubmit}


                                    disabled={isPressed} // Disable submit if image count is out of range
                                >

                                    {isPressed ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (

                                        <Text style={styles.buttonText}>{t('Next')}</Text>

                                    )}

                                </TouchableOpacity>
                            </View>




                            <View style={styles.fileGrid}>
                                {(state.form?.Files || []).map((item, index) => {
                                    // 👇 safe type check
                                    const fileType = item.type || "image/jpeg";

                                    return (
                                        <View key={index} style={styles.imageContainer}>
                                            {fileType.startsWith("image") && (
                                                <TouchableOpacity onPress={() => setSelectedImage(item.uri)}>
                                                    <View style={styles.videoView}>
                                                        <Image source={{ uri: item.uri }} style={styles.image} />
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                    );
                                })}

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



                    {currentStep === 3 && (
                        <View style={{ flex: 1, padding: 20 }}>
                            {/* Camera Button */}

                            <View style={styles.buttoncontent}>
                                <TouchableOpacity
                                    style={[
                                        styles.Camerabutton,
                                        (state.form?.Files || []).filter(f => f.type?.startsWith("video")).length >= 2 && styles.disabledButton
                                    ]}
                                    onPress={() => {
                                        const videoCount = (state.form?.Files || []).filter(f => f.type?.startsWith("video")).length;

                                        if (videoCount >= 2) {
                                            Alert.alert(
                                                "Maximum Video Limit Reached",
                                                "You can only capture up to Maximum 2 videos.",
                                                [{ text: "OK" }]
                                            );
                                        } else {
                                            requestvideoPermission();
                                        }
                                    }}
                                >
                                    <MaterialIcons name="videocam" size={30} color="white" />
                                    <Text style={styles.buttonText}>Pick From Video</Text>
                                </TouchableOpacity>
                            </View>



                            {/* Previous and Submit Buttons */}
                            <View style={styles.buttoncontent}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => uploadVideos(state.form?.Files || [])}
                                    disabled={isSubmitted} // Disable submit if image count is out of range
                                >
                                    {isPressed ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (

                                        <Text style={styles.buttonText}>Submit</Text>

                                    )}

                                </TouchableOpacity>

                            </View>





                            <View style={styles.fileGrid}>
                                {(state.form?.Files || []).map((item, index) => {
                                    const fileType = item.type || "video/mp4"; // default video type

                                    return (
                                        fileType.startsWith("video") && (
                                            <View key={index} style={styles.imageContainer}>
                                                <View style={styles.videoView}>
                                                    <VideoPlayer
                                                        source={{ uri: item.uri }}
                                                        style={styles.video}
                                                        controls
                                                        resizeMode="contain"
                                                    />
                                                </View>
                                            </View>
                                        )
                                    );
                                })}
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


const compressionStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 200,
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    progress: {
        marginTop: 5,
        fontSize: 14,
        color: '#666',
    },
});




export default CAhealthreport;