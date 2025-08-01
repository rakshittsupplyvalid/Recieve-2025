import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image , Platform} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { PermissionsAndroid } from 'react-native';

const LicensePlateScanner = () => {
  const [scannedText, setScannedText] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Camera permission granted');
            handleScanPress(); // **Agar permission mil gayi to camera open hoga**
          } else {
            console.log('Camera permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        handleScanPress(); // iOS ke liye directly open kar do
      }
    };

  const handleScanPress = async () => {
    setIsLoading(true);
    setError('');
    setScannedText('');
    
    try {
      // 1. Launch camera
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        cameraType: 'back',
        includeBase64: false,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        setIsLoading(false);
        return;
      }

      if (!result.assets || !result.assets[0].uri) {
        throw new Error('No image selected');
      }

      const uri = result.assets[0].uri;
      setImageUri(uri);

      // 2. Perform text recognition - CORRECTED THIS LINE
      const recognitionResult = await TextRecognition.recognize(uri);
      
      // 3. Process all recognized text
      let allText = '';
      if (recognitionResult.blocks) {
        for (const block of recognitionResult.blocks) {
          allText += block.text + ' ';
        }
      }

      // 4. Extract license plate number
      const licensePlate = extractLicensePlate(allText);
      
      if (licensePlate) {
        setScannedText(licensePlate);
      } else {
        setError('No license plate detected in the image');
      }
    } catch (err) {
      setError(err.message || 'Failed to scan license plate');
      console.error('Scanning error:', err.data);
    } finally {
      setIsLoading(false);
    }
  };

 const extractLicensePlate = (text) => {
  // Normalize text (remove extra spaces, new lines)
  const cleanedText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').toUpperCase();

  // Indian vehicle number pattern: MH12AB1234
  const indiaPattern = /\b[A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{1,2}[ -]?[0-9]{4}\b/g;

  const matches = cleanedText.match(indiaPattern);

  if (matches && matches.length > 0) {
    // Clean spaces or dashes and return the first match
    return matches[0].replace(/[\s-]/g, '');
  }

  // Fallback: try detecting simple alphanumeric plate (like DL8C1234)
  const fallbackPattern = /\b[A-Z]{2,3}[ -]?[0-9]{3,4}\b/g;
  const fallbackMatches = cleanedText.match(fallbackPattern);
  
  if (fallbackMatches && fallbackMatches.length > 0) {
    return fallbackMatches[0].replace(/[\s-]/g, '');
  }

  return null;
};


  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.scanButton} 
        onPress={requestCameraPermission}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Processing...' : 'Scan License Plate'}
        </Text>
      </TouchableOpacity>

      {isLoading && <ActivityIndicator size="large" style={styles.loader} />}

      {imageUri ? (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.previewImage} 
          resizeMode="contain"
        />
      ) : null}

      {scannedText ? (
        <View style={styles.resultContainer}>
          <Text>Detected Plate: {scannedText}</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e1f5fe',
    borderRadius: 10,
    width: '80%',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0277bd',
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default LicensePlateScanner;