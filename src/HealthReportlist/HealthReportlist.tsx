import React, { useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
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
import Navbar from '../../App/Navbar';
import apiClient from '../../service/api/apiInterceptors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImageViewing from "react-native-image-viewing";
import moment from "moment";
import { useTranslation } from 'react-i18next';
import { HealthreportStyle } from '../../theme/HealthreportStyle';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/Type';
import { useNavigation } from '@react-navigation/native';

interface Report {
  id: string;
  assayerName: string;
  date: string;
  truckNumber: string;
  approvalStatus?: string;
  datastring?: string;
  files?: string[];
}

interface ProfileData {
  id: string;
}

const HealthReportlist = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userId, setUserId] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const viewReportDetails = (report: Report) => {
        console.log('Passing to navigation:', { 
      reportId: report.id 
    });
    navigation.navigate('HealthReportDetails', { 
      reportId: report.id // Only passing the id field
    });
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
          item.assayerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.truckNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const renderReportItem = ({ item }: { item: Report }) => (
    <View style={HealthreportStyle.one}>
      <View style={HealthreportStyle.card}>
        <View style={HealthreportStyle.topRightCorner} />
        <View style={HealthreportStyle.bottomLeftCorner} />
        <View style={HealthreportStyle.row}>
          <Text style={HealthreportStyle.label}>{t('assyarerName')}</Text>
          <Text style={HealthreportStyle.value}>{item.assayerName || 'N/A'}</Text>
        </View>
        <View style={HealthreportStyle.row}>
          <Text style={HealthreportStyle.label}>{t('Date')}</Text>
          <Text style={HealthreportStyle.value}>
            {item.date ? moment(item.date).add(5, "hours").format("DD-MM-YYYY") : 'N/A'}
          </Text>
        </View>
        <View style={HealthreportStyle.row}>
          <Text style={HealthreportStyle.label}>{t('TruckNumber')}</Text>
          <Text style={HealthreportStyle.value}>{item.truckNumber || 'N/A'}</Text>
        </View>
        <View style={HealthreportStyle.parentbutton}>
          <TouchableOpacity 
            style={HealthreportStyle.button} 
            onPress={() => viewReportDetails(item)}
            disabled={loading}
          >
            <Text style={HealthreportStyle.buttonText}>{t('ViewReport')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id} // Using id as the key
        renderItem={renderReportItem}
        onEndReached={() => hasMoreData && !loading && fetchReports()}
        onEndReachedThreshold={0.5}
       
       
        ListEmptyComponent={
          !loading && (
            <View>
              <Text>{t('NoReportsFound')}</Text>
            </View>
          )
        }
      />

      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default HealthReportlist;