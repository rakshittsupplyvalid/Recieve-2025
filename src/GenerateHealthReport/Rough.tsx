import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Switch, Modal, Platform, Image, ActivityIndicator, FlatList, Button, Linking, Alert, BackHandler } from 'react-native';
import Navbar from '../../App/Navbar';
import useForm from '../../App/Common/Lib/useForm'
import { Picker } from '@react-native-picker/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
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
import VideoPlayer from 'react-native-video';
import { Video as VideoCompressor } from 'react-native-compressor';
import md5 from 'md5';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TestForm = () => {
  const { t } = useTranslation();
  const { state, updateState } = useForm();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const currentStep = state?.hidden?.currentStep || 0;
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const previousSteps = state?.hidden?.previousSteps || [];
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPressed, setIsPressed] = useState(false);

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const [clickCount, setClickCount] = useState(0);

  const handlePress = () => {
    if (clickCount < 2) {
      setClickCount(clickCount + 1);
      requestVideoPermission();
    } else {
      Alert.alert("Limit Reached", "You can upload maximum 2 videos");
    }
  };

  const handlePressCamera = () => {
    if ((state.form?.Files || []).filter(f => f.type?.startsWith("image")).length < 9) {
      requestCameraPermission();
    } else {
      Alert.alert("Maximum Reached", "You can upload maximum 9 images.");
    }
  };

  useEffect(() => {
    CompanyDropdown();
  }, []);

  // ... (other useEffect hooks remain the same)

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
      openCamera();
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
        if (response.assets && response.assets.length > 0) {
          const capturedImage = response.assets[0];
          const imageHash = md5(capturedImage.uri);

          const isDuplicate = state.form?.Files?.some(file => file.hash === imageHash);
          if (isDuplicate) {
            Alert.alert('Duplicate', 'This image is already added.');
            return;
          }

          // Check if already 9 images
          if ((state.form?.Files || []).filter(f => f.type?.startsWith("image")).length >= 9) {
            Alert.alert("Limit", "Maximum 9 images allowed.");
            return;
          }

          const newFile = {
            uri: Platform.OS === 'android' ? capturedImage.uri : capturedImage.uri.replace('file://', ''),
            fileName: capturedImage.fileName || `photo_${Date.now()}.jpg`,
            type: capturedImage.type || 'image/jpeg',
            hash: imageHash,
          };

          updateState({
            form: {
              ...state.form,
              Files: [...(state.form?.Files || []), newFile],
            },
          });
        }
      }
    );
  };

  const requestVideoPermission = async () => {
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
      openCameraForVideo();
    }
  };

  const openCameraForVideo = () => {
    launchCamera(
      {
        mediaType: 'video',
        videoQuality: 'high',
        durationLimit: 60,
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
            // Compress the video
            const compressedUri = await VideoCompressor.compress(
              capturedVideo.uri,
              {
                compressionMethod: 'auto',
              },
              (progress) => {
                console.log('Compression Progress: ', progress);
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
          }
        }
      }
    );
  };

  const handleNext = (nextStep: number) => {
    // ... (previous validation code remains the same)

    // Add validation for step 3 (media)
    if (currentStep === 2 && nextStep === 3) {
      // Check if we have at least 3 images
      const imageCount = (state.form?.Files || []).filter(f => f.type?.startsWith("image")).length;
      if (imageCount < 3) {
        Alert.alert("Insufficient Media", "Please upload at least 3 images before proceeding.");
        return;
      }
    }

    // Proceed to next step if validation passes
    updateState({
      ...state,
      hidden: {
        ...state.hidden,
        previousSteps: [...previousSteps, currentStep],
        currentStep: nextStep
      }
    });
  };

  const handleSubmit = () => {
    // Minimum 3 images required
    const imageFiles = (state.form?.Files || []).filter(f => f.type?.startsWith("image"));
    if (imageFiles.length < 3) {
      Alert.alert('Error', 'Please upload at least 3 images before submitting.');
      return;
    }

    // Maximum 9 images allowed
    if (imageFiles.length > 9) {
      Alert.alert('Error', 'Please upload maximum 9 images before submitting.');
      return;
    }

    // Maximum 2 videos allowed
    const videoFiles = (state.form?.Files || []).filter(f => f.type?.startsWith("video"));
    if (videoFiles.length > 2) {
      Alert.alert('Error', 'Please upload maximum 2 videos before submitting.');
      return;
    }

    // ... (rest of the submission code remains the same)
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
          <Text style={styles.headerTitle}>Normal Health Report form</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* Step 0, 1, 2 content remains the same */}

          {currentStep === 3 && (
            <View style={{ flex: 1, padding: 20 }}>
              {/* Media Count Info */}
              <View style={styles.mediaInfoContainer}>
                <Text style={styles.mediaInfoText}>
                  Images: {(state.form?.Files || []).filter(f => f.type?.startsWith("image")).length}/9
                </Text>
                <Text style={styles.mediaInfoText}>
                  Videos: {(state.form?.Files || []).filter(f => f.type?.startsWith("video")).length}/2
                </Text>
              </View>

              {/* Camera Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.Camerabutton, styles.halfButton]}
                  onPress={handlePressCamera}
                  disabled={(state.form?.Files || []).filter(f => f.type?.startsWith("image")).length >= 9}
                >
                  <MaterialIcons name="camera" size={24} color="white" />
                  <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.Camerabutton, styles.halfButton]}
                  onPress={requestVideoPermission}
                  disabled={(state.form?.Files || []).filter(f => f.type?.startsWith("video")).length >= 2}
                >
                  <MaterialIcons name="videocam" size={24} color="white" />
                  <Text style={styles.buttonText}>Record Video</Text>
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
                  disabled={
                    (state.form?.Files || []).filter(f => f.type?.startsWith("image")).length < 3 || 
                    isPressed
                  }
                >
                  {isPressed ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>{t('submit')}</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Media Grid */}
              <View style={styles.fileGrid}>
                {(state.form?.Files || []).map((item, index) => {
                  const fileType = item.type || "image/jpeg";

                  return (
                    <View key={index} style={styles.mediaContainer}>
                      {fileType.startsWith("image") ? (
                        <TouchableOpacity onPress={() => setSelectedImage(item.uri)}>
                          <View style={styles.mediaView}>
                            <Image source={{ uri: item.uri }} style={styles.mediaThumbnail} />
                            <View style={styles.mediaTypeIndicator}>
                              <MaterialIcons name="photo" size={16} color="white" />
                            </View>
                          </View>
                        </TouchableOpacity>
                      ) : fileType.startsWith("video") ? (
                        <TouchableOpacity onPress={() => setSelectedVideo(item.uri)}>
                          <View style={styles.mediaView}>
                            <VideoPlayer
                              source={{ uri: item.uri }}
                              paused={true}
                              style={styles.mediaThumbnail}
                              resizeMode="cover"
                            />
                            <View style={styles.mediaTypeIndicator}>
                              <MaterialIcons name="videocam" size={16} color="white" />
                            </View>
                            <View style={styles.playIconOverlay}>
                              <MaterialIcons name="play-circle-filled" size={30} color="white" />
                            </View>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <Text style={{ color: "red" }}>Unknown File</Text>
                      )}

                      <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() => handleDeleteImage(index)}
                      >
                        <MaterialIcons name="cancel" size={24} color="red" />
                      </TouchableOpacity>
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
                    <MaterialIcons name="close" size={30} color="white" />
                  </TouchableOpacity>
                  <Image source={{ uri: selectedImage }} style={styles.fullImage} />
                </View>
              </Modal>

              {/* Modal to show video */}
              <Modal visible={!!selectedVideo} transparent={true}>
                <View style={styles.modalContainer}>
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setSelectedVideo(null)}
                  >
                    <MaterialIcons name="close" size={30} color="white" />
                  </TouchableOpacity>
                  <VideoPlayer
                    source={{ uri: selectedVideo }}
                    style={styles.fullVideo}
                    controls={true}
                    resizeMode="contain"
                  />
                </View>
              </Modal>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default TestForm;