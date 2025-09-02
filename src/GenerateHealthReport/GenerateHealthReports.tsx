import React, { useState } from 'react';
import { View, Text, Button, Platform, StyleSheet, Alert, ScrollView } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Video from 'react-native-video';
import md5 from 'md5';

const VideoCapture = () => {
  const [videos, setVideos] = useState<any[]>([]);

  const openCameraForVideo = () => {
    launchCamera(
      {
        mediaType: 'video',   // only video
        videoQuality: 'high', // low | medium | high
        durationLimit: 30,    // max seconds
        saveToPhotos: true,
      },
      async (response) => {
        if (response.didCancel) {
          console.log('User cancelled video capture');
        } else if (response.errorMessage) {
          console.log('Camera Error: ', response.errorMessage);
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const capturedVideo = response.assets[0];
          const videoHash = md5(capturedVideo.uri);

          const isDuplicate = videos.some(file => file.hash === videoHash);

          if (isDuplicate) {
            Alert.alert('Duplicate', 'This video is already added.');
          } else {
            const newVideo = {
              uri: Platform.OS === 'android'
                ? capturedVideo.uri
                : capturedVideo.uri.replace('file://', ''),
              fileName: capturedVideo.fileName || `video_${Date.now()}.mp4`,
              type: capturedVideo.type || 'video/mp4',
              hash: videoHash,
            };

            setVideos([...videos, newVideo]);
            console.log('Video added:', newVideo);
          }
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🎥 Video Capture Example</Text>
      <Button title="Record Video" onPress={openCameraForVideo} />

      <ScrollView style={styles.list}>
        {videos.map((v, index) => (
          <View key={index} style={styles.videoContainer}>
            <Text style={styles.videoText}>{v.fileName}</Text>
            <Video
              source={{ uri: v.uri }}
              style={styles.video}
              controls   // 👈 play/pause controls enable karega
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default VideoCapture;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    marginTop: 20,
  },
  videoContainer: {
    marginBottom: 20,
  },
  videoText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  video: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
});
