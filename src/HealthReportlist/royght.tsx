import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ImageViewing from 'react-native-image-viewing';
import Video from 'react-native-video';
import apiClient from '../../service/api/apiInterceptors';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HealthReportDetails = () => {
  const route = useRoute();
  const { reportId } = route.params as { reportId: string };
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImages, setShowImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const response = await apiClient.get(`/api/healthreport/${reportId}`);
        setReport(response.data);
      } catch (error) {
        console.error('Error fetching report details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.loader}>
        <Text>No report found</Text>
      </View>
    );
  }

  const images = report.files?.filter((file: string) => !file.endsWith('.mp4')) || [];
  const videos = report.files?.filter((file: string) => file.endsWith('.mp4')) || [];

  return (
    <View style={styles.container}>
      {/* Images Section */}


      
      {images.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome name="camera" size={20} color="#F79B00" />
            <Text style={styles.cardTitle}>Images</Text>
          </View>

          <FlatList
            data={images}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => {
                  setCurrentImageIndex(index);
                  setShowImages(true);
                }}
              >
                <Image
                  source={{ uri: apiClient.defaults.baseURL + item }}
                  style={styles.imageThumbnail}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />

          <ImageViewing
            images={images.map((file: string) => ({ uri: apiClient.defaults.baseURL + file }))}
            imageIndex={currentImageIndex}
            visible={showImages}
            onRequestClose={() => setShowImages(false)}
          />
        </View>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome name="video-camera" size={20} color="#F79B00" />
            <Text style={styles.cardTitle}>Videos</Text>
          </View>

          {videos.map((video: string, index: number) => (
            <View key={index} style={{ marginBottom: 20 }}>
              <Text style={styles.videoName}>Video {index + 1}</Text>
              <Video
                source={{ uri: apiClient.defaults.baseURL + video }}
                style={styles.videoPlayer}
                controls
                resizeMode="contain"
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB', padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginLeft: 10, color: '#333' },
  imageThumbnail: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  videoName: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  videoPlayer: {
    width: width - 64,
    height: 220,
    borderRadius: 10,
    backgroundColor: '#000',
  },
});

export default HealthReportDetails;
