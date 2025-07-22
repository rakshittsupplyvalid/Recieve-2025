

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Linking,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import api from '../service/api/apiInterceptors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface FileViewProps {
  fileUris: string[];
}

const FileView: React.FC<FileViewProps> = ({ fileUris }) => {
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [fileTypes, setFileTypes] = useState<{ [key: string]: 'image' | 'pdf' | 'document' | 'unknown' }>({});
  const [showFile, setShowFile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getFileType = (uri: string) => {
    const ext = uri.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext || '')) {
      return 'image';
    } else if (['pdf'].includes(ext || '')) {
      return 'pdf';
    } else {
      return 'document';
    }
  };

  const getFullUri = (uri: string) => {
    if (uri.startsWith('http')) {
      return uri;

    } else 
    {
      return `${baseUrl}${uri}`;
    }
  };



  useEffect(() => {
    setBaseUrl(api.getUri());
    const types = fileUris.reduce((acc, uri) => {
      acc[uri] = getFileType(uri);
      return acc;
    }, {} as { [key: string]: 'image' | 'pdf' | 'document' | 'unknown' });
    setFileTypes(types);
    setLoading(false);
  }, [fileUris]);



  
  const renderFile = (uri: string) => {
   
    
    const fullUri = getFullUri(uri);
    const fileType = fileTypes[uri];
  
   
  
    switch (fileType) {
      case 'image':
        return (
          <TouchableOpacity key={uri} onPress={() => setSelectedImage(fullUri)}>
            <Image
              source={{ uri: fullUri }}
              style={{ width: 300, height: 300 }}
              onError={(error) => console.log("Image load error:", error.nativeEvent)}
              resizeMode="contain"
            />
          </TouchableOpacity>
        );
      case 'document':
        return (
          <View key={uri} style={styles.documentContainer}>
            <Text>Document file cannot be previewed directlyjjjj.</Text>
            <Text onPress={() => Linking.openURL(fullUri)} style={styles.linkText}>
              Open in external viewer
            </Text>
          </View>
        );
      default:
        return <Text key={uri}>Unsupported file type</Text>;
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <>
          {!showFile ? (
            <Icon name="eye" size={20} color="#666" onPress={() => setShowFile(true)} />
          ) : (
            <>
              <Icon name="close" size={20} color="#666" onPress={() => setShowFile(false)} />
              {fileUris.map((uri) => renderFile(uri))}
            </>
          )}
        </>
      )}

      {/* Modal for full-screen image view */}
      {selectedImage && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedImage(null)}
            >
              <Icon name="close" size={30} color="#fff" />
            </TouchableOpacity>

{/* 
            <View style={styles.zoomContainer}>
            <ReactNativeZoomableView
          maxZoom={30}
          minZoom={1}
       
        >
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
            </ReactNativeZoomableView>
            </View> */}
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  documentContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  zoomContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    flexShrink: 1,
    height: 600,
    width: 400,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
});

export default FileView;
