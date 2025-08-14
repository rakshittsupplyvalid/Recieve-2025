import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  RefreshControl, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal, 
  Image, 
  ScrollView,
  StyleSheet 
} from 'react-native';
import api from '../service/api/apiInterceptors';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { tableStyles } from '../theme/TableStyles';
import Navbar from '../App/Navbar';
import { StackNavigationProp } from '@react-navigation/stack';
import { formatDate } from '../utils/dateUtils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { HealthreportStyle } from '../theme/HealthreportStyle';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types/Type';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';

interface TableData {
  id: string;
  username?: string;
  date: string;
  billType?: string;
  amount: string | number;
  approvalStatus?: string;
  purpose?: string;
  images?: string[];
  vehicleNumber?: string;
  vehicleType?: string;
  startTripReading?: number;
  endTripReading?: number;
}

const ReimbursementList: React.FC = () => {
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();

  type RouteParams = {
    ApprovalStatus?: string;
    BillPaymentStatus?: string;
  };

  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { ApprovalStatus, BillPaymentStatus } = route.params || {};
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = "/api/mobile/reimbursment?";

      if (BillPaymentStatus) {
        url += `BillPaymentStatus=${BillPaymentStatus}&`;
      }
      if (ApprovalStatus) {
        url += `ApprovalStatus=${ApprovalStatus}`;
      }

      const response = await api.get(url);

      const data = response.data.map((x: any) => ({
        id: x.id || '',
        username: x.userName || 'N/A',
        date: formatDate(x.date) || 'N/A',
        billType: x.billType || 'N/A',
        amount: x.amount ? x.amount : 'N/A',
        approvalStatus: x.approvalStatus || 'N/A',
        purpose: x.purpose || 'No purpose available',
        images: x.images || [],
        vehicleNumber: x.vehicleNumber || 'N/A',
        vehicleType: x.vehicleType || 'N/A',
        startTripReading: x.startTripReading || 0,
        endTripReading: x.endTripReading || 0
      }));

      setTableData(data);
    } catch (error) {
      console.error("Error fetching reimbursement data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchReimbursementDetails = async (id: string) => {
    try {
      const response = await api.get(`/api/reimbursment/${id}`);
      const data = response.data ? {
        ...response.data,
        date: formatDate(response.data.date) || 'N/A',
        billType: response.data.billType,
        amount: response.data.amount ? response.data.amount : 'N/A',
        purpose: response.data.purpose || 'No purpose available',
        images: response.data.images || [],
        vehicleNumber: response.data.vehicleNumber || 'N/A',
        vehicleType: response.data.vehicleType || 'N/A',
        startTripReading: response.data.startTripReading || 0,
        endTripReading: response.data.endTripReading || 0
      } : null;
      setSelectedReimbursement(data);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching reimbursement details:", error);
    }
  };

  const filteredData = tableData
    .filter((item) => {
      if (!item) return false;
      const searchTerm = searchQuery.toUpperCase().trim();

      const itemDate = item.date ? item.date.trim() : '';
      const normalizedItemDate = itemDate.split('/').reverse().join('');
      const normalizedSearchQuery = searchQuery.split('/').reverse().join('');

      return (
        (item.username && item.username.toUpperCase().includes(searchTerm)) ||
        (itemDate && normalizedItemDate.includes(normalizedSearchQuery)) ||
        (item.billType && item.billType.toUpperCase().includes(searchTerm)) ||
        (item.approvalStatus && item.approvalStatus.toUpperCase().includes(searchTerm)) ||
        (item.amount && item.amount.toString().includes(searchTerm))
      );
    })
    .sort((a, b) => {
      const dateA = a.date ? a.date.split('/').reverse().join('-') : '';
      const dateB = b.date ? b.date.split('/').reverse().join('-') : '';
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const renderItem = ({ item, index }: { item: TableData; index: number }) => (
    <View style={[tableStyles.row, { backgroundColor: index % 2 === 0 ? '#f2f0ed' : '#fff' }]}>
      <Text style={tableStyles.cell}>{item.date}</Text>
      <Text style={tableStyles.cell}>{item.billType}</Text>
      <Text style={tableStyles.cell}>{item.amount}</Text>
      <TouchableOpacity onPress={() => item.id && fetchReimbursementDetails(item.id)}>
        <MaterialIcons name="visibility" size={25} color="black" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      <View style={tableStyles.container}>
        <TextInput
          style={tableStyles.searchInput}
          placeholder={`Search by ${filteredData.length} Item`}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <View style={tableStyles.header}>
          <Text style={tableStyles.headerCell}>{t('Date')}</Text>
          <Text style={tableStyles.headerCell}>{t('Billtype')}</Text>
          <Text style={tableStyles.headerCell}>{t('Amount')}</Text>
          <Text style={tableStyles.headerCell}>{t('View')}</Text>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("Reimbursement Details")}</Text>
            </View>
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalContent}
            >
              {selectedReimbursement && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('Date')}</Text>
                    <Text style={styles.detailValue}>{selectedReimbursement.date}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('Billtype')}</Text>
                    <Text style={styles.detailValue}>{selectedReimbursement.billType}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('Amount')}</Text>
                    <Text style={styles.detailValue}>₹{selectedReimbursement.amount}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('Purpose')}</Text>
                    <Text style={styles.detailValue}>{selectedReimbursement.purpose}</Text>
                  </View>

                  {selectedReimbursement.vehicleNumber && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('Vehicle Number')}</Text>
                      <Text style={styles.detailValue}>{selectedReimbursement.vehicleNumber}</Text>
                    </View>
                  )}

                  {selectedReimbursement.vehicleType && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('Vehicle Type')}</Text>
                      <Text style={styles.detailValue}>{selectedReimbursement.vehicleType}</Text>
                    </View>
                  )}

                  {selectedReimbursement.startTripReading !== undefined && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('Start Trip Reading')}</Text>
                      <Text style={styles.detailValue}>{selectedReimbursement.startTripReading}</Text>
                    </View>
                  )}

                  {selectedReimbursement.endTripReading !== undefined && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('End Trip Reading')}</Text>
                      <Text style={styles.detailValue}>{selectedReimbursement.endTripReading}</Text>
                    </View>
                  )}

                  {selectedReimbursement.images && selectedReimbursement.images.length > 0 && (
                    <View style={styles.imagesContainer}>
                      <Text style={styles.imagesTitle}>{t('Attached Images')}:</Text>
                      {selectedReimbursement.images.map((imageUri, index) => (
                        <Image
                          key={index}
                          source={{ uri: `https://dev-backend-2025.epravaha.com${imageUri}` }}
                          style={styles.image}
                          resizeMode="contain"
                        />
                      ))}
                    </View>
                  )}
                </>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>{t('Close')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {loading ? (
          <Text style={tableStyles.emptyText}>Loading...</Text>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={tableStyles.emptyText}>No data available</Text>}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalHeader: {
    backgroundColor: '#F6A001',
    padding: 15,

    width: '100%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalScrollView: {
    flex: 1,
    width: '100%',
  },
  modalContent: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#555',
    width: '40%',
  },
  detailValue: {
    width: '60%',
    textAlign: 'right',
  },
  imagesContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  imagesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: '#F6A00191',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ReimbursementList;