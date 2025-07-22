import React, { useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Navbar from '../App/Navbar';
import apiClient from '../service/api/apiInterceptors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImageViewing from "react-native-image-viewing";
import moment from "moment";
import { useTranslation } from 'react-i18next';
import { HealthreportStyle } from '../theme/HealthreportStyle';
import { useFocusEffect } from '@react-navigation/native';

interface Report {
  id: string;
  assayername: string;
  date: string;
  trucknumber: string;
  approvalstatus?: string;
  datastring?: string;
  files?: string[];
}

interface ProfileData {
  id: string;
  // Add other profile fields as needed
}

const HealthReportlist = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userId, setUserId] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showImages, setShowImages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const pageSize = 30;
  const { t } = useTranslation();

  useFocusEffect(
    React.useCallback(() => {
      setSearchQuery('');
      refreshData();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/user/profile");
      setProfileData(response.data);
      setUserId(response.data.id);
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (reset = false) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const newPageNumber = reset ? 1 : pageNumber;
      
      const response = await apiClient.get(
        `/api/mobile/healthreport/list?ReportType=RECEIVE&Id=${userId}&PageNumber=${newPageNumber}&PageSize=${pageSize}`
      );
      
      const newReports = response.data || [];
      
      if (reset) {
        setReports(newReports);
        setHasMoreData(newReports.length === pageSize);
      } else {
        setReports(prev => [...prev, ...newReports]);
        setHasMoreData(newReports.length > 0);
      }
      
      if (newReports.length > 0 && !reset) {
        setPageNumber(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching health reports:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    setPageNumber(1);
    fetchReports(true);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchReports(true);
    }
  }, [userId]);

  useEffect(() => {
    let filteredData = reports;

    if (searchQuery) {
      filteredData = filteredData.filter(item => {
        const formattedDate = moment(item.date).add(5, "hours").format("DD-MM-YYYY");
        return (
          item.assayername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.trucknumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          formattedDate.includes(searchQuery)
        );
      });
    }

    if (startDate && endDate) {
      filteredData = filteredData.filter(item => {
        const reportDate = new Date(item.date);
        return reportDate >= startDate && reportDate <= endDate;
      });
    }

    setFilteredReports(filteredData);
  }, [searchQuery, reports, startDate, endDate]);

  const fetchReportDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/healthreport/${id}`);
      setSelectedReport(response.data);
      setModalVisible(true);
      setShowImages(false);
    } catch (error) {
      console.error('Error fetching report details:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <View style={HealthreportStyle.one}>
      <View style={HealthreportStyle.card}>
        <View style={HealthreportStyle.topRightCorner} />
        <View style={HealthreportStyle.bottomLeftCorner} />
        <View style={HealthreportStyle.row}>
          <Text style={HealthreportStyle.label}>{t('assyarerName')}</Text>
          <Text style={HealthreportStyle.value}>{item.assayername || 'N/A'}</Text>
        </View>
        <View style={HealthreportStyle.row}>
          <Text style={HealthreportStyle.label}>{t('Date')}</Text>
          <Text style={HealthreportStyle.value}>
            {item.date ? moment(item.date).add(5, "hours").format("DD-MM-YYYY") : 'N/A'}
          </Text>
        </View>
        <View style={HealthreportStyle.row}>
          <Text style={HealthreportStyle.label}>{t('TruckNumber')}</Text>
          <Text style={HealthreportStyle.value}>{item.trucknumber || 'N/A'}</Text>
        </View>
        <View style={HealthreportStyle.parentbutton}>
          <TouchableOpacity 
            style={HealthreportStyle.button} 
            onPress={() => fetchReportDetails(item.id)}
            disabled={loading}
          >
            {loading && selectedReport?.id === item.id ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={HealthreportStyle.buttonText}>{t('ViewReport')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderReportDetail = () => {
    if (!selectedReport) return null;
    
    const parsedData = selectedReport.datastring ? JSON.parse(selectedReport.datastring) : null;

    return (
      <>
        <View style={HealthreportStyle.rowone}>
          <Text style={HealthreportStyle.labelone}>{t('TruckNumber')}</Text>
          <Text style={HealthreportStyle.valueone}>{selectedReport.trucknumber || 'N/A'}</Text>
        </View>

        <View style={HealthreportStyle.rowone}>
          <Text style={HealthreportStyle.labelone}>{t('Date')}</Text>
          <Text style={HealthreportStyle.valueone}>
            {selectedReport.date ? 
              new Date(selectedReport.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) : 'N/A'}
          </Text>
        </View>

        <View style={HealthreportStyle.rowone}>
          <Text style={HealthreportStyle.labelone}>{t('ApprovalStatus')}:</Text>
          <Text style={HealthreportStyle.valueone}>{selectedReport.approvalstatus || 'N/A'}</Text>
        </View>

        {parsedData && (
          <>
            <View style={HealthreportStyle.rowone}>
              <Text style={HealthreportStyle.labelone}>{t('Grossweight')}</Text>
              <Text style={HealthreportStyle.valueone}>{parsedData.GrossWeight || 'N/A'}</Text>
            </View>
            <View style={HealthreportStyle.rowone}>
              <Text style={HealthreportStyle.labelone}>{t('Netweight')}</Text>
              <Text style={HealthreportStyle.valueone}>{parsedData.NetWeight || 'N/A'}</Text>
            </View>
            <View style={HealthreportStyle.rowone}>
              <Text style={HealthreportStyle.labelone}>{t('Tareweight')}</Text>
              <Text style={HealthreportStyle.valueone}>{parsedData.TareWeight || 'N/A'}</Text>
            </View>
          </>
        )}

        <View style={HealthreportStyle.rowone}>
          <Text style={HealthreportStyle.labelone}>{t('images')}</Text>
          <TouchableOpacity onPress={() => setShowImages(!showImages)}>
            <MaterialIcons
              name={showImages ? 'visibility-off' : 'visibility'}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {selectedReport.files && selectedReport.files.length > 0 && (
          <>
            <ImageViewing
              images={selectedReport.files.map(file => ({ uri: apiClient.defaults.baseURL + file }))}
              imageIndex={0}
              visible={showImages}
              onRequestClose={() => setShowImages(false)}
            />

            {showImages && (
              <FlatList
                data={selectedReport.files}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
           contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 20 }}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: apiClient.defaults.baseURL + item }}
                    style={HealthreportStyle.image}
                    resizeMode="contain"
                  />
                )}
              />
            )}
          </>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={HealthreportStyle.container}>
      <Navbar />

      <TextInput
        style={HealthreportStyle.searchInput}
        placeholder={t('SearchAssayerNameanddate')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#999"
      />

      <View style={HealthreportStyle.dateFilterContainer}>
        <TouchableOpacity 
          style={HealthreportStyle.dateButton} 
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={HealthreportStyle.buttonText}>
            {startDate ? startDate.toDateString() : t('StartDate')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={HealthreportStyle.dateButton} 
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={HealthreportStyle.buttonText}>
            {endDate ? endDate.toDateString() : t('EndDate')}
          </Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
              setPageNumber(1);
              fetchReports(true);
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
              setPageNumber(1);
              fetchReports(true);
            }
          }}
        />
      )}

      <FlatList
        data={filteredReports}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        renderItem={renderReportItem}
        onEndReached={() => hasMoreData && !loading && fetchReports()}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={['#FF0000']}
            tintColor="#FF0000"
          />
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator size="large" color="red"  />
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <View >
              <Text>{t('NoReportsFound')}</Text>
            </View>
          )
        }
      />

      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={modalVisible} 
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={HealthreportStyle.modalContainer}>
          <View style={HealthreportStyle.heading}>
            <Text style={HealthreportStyle.text}>{t('RecieveHealthReportDetails')}</Text>
          </View>
          <View style={HealthreportStyle.modalContent}>
            {loading ? (
              <ActivityIndicator size="large" color="red" />
            ) : (
              renderReportDetail()
            )}
            <TouchableOpacity 
              style={HealthreportStyle.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={HealthreportStyle.buttonText}>{t('Close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HealthReportlist;