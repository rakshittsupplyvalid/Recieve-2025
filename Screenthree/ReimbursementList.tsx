import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, RefreshControl, TouchableOpacity, SafeAreaView, Modal, Image, Pressable } from 'react-native';
import api from '../service/api/apiInterceptors';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { tableStyles } from '../theme/TableStyles';
import Navbar from '../App/Navbar';
import { StackNavigationProp } from '@react-navigation/stack';
import { formatDate } from '../utils/dateUtils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { HealthreportStyle } from '../theme/HealthreportStyle';
import {useTranslation} from 'react-i18next';
import { RootStackParamList } from '../types/Type';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';





interface TableData {
  [x: string]: any;
  id: string;
  username: string;
  date: string;
  billtype: string;
  amount: string | number;
  approvalstatus: string;
  purpose: string;
}

interface Reimbursementprops {
  navigation: StackNavigationProp<any>;
}



const ReimbursementList: React.FC = () => {
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
    const { t ,  i18n } = useTranslation();
          const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
          
    

  type RouteParams = {
    ApprovalStatus: string;
    BillPaymentStatus: string;
  };

  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { ApprovalStatus, BillPaymentStatus } = route.params || {};
  const [refreshing, setRefreshing] = useState(false);

  



  const fetchData = async () => {
    try {
      let url = "/api/reimbursment?";

      if (BillPaymentStatus) {
        url += `BillPaymentStatus=${BillPaymentStatus}&`;
      }
      if (ApprovalStatus) {
        url += `ApprovalStatus=${ApprovalStatus}`;
      }

      const response = await api.get(url);

      let data = response.data.map((x: any) => ({
        ...x,
        date: formatDate(x.date),
        amount: x.amount ? x.amount : 'N/A',
        purpose: x.purpose ? x.purpose : 'No purpose available',
      }));


      setTableData(data);
      console.log("Fetched data:", data);

    } catch (error) {
      console.error("Error fetching reimbursement data:", error);
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
      setSelectedReimbursement(response.data);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching reimbursement details:", error);
    }
  };


  const filteredData = tableData
  .filter((item) => {
    const searchTerm = searchQuery.toUpperCase().trim();

    const itemDate = item.date.trim();
    const normalizedItemDate = itemDate.split('/').reverse().join(''); // 20250115
    const normalizedSearchQuery = searchQuery.split('/').reverse().join(''); // 20250115

    return (
      item.username.toUpperCase().includes(searchTerm) ||
      normalizedItemDate.includes(normalizedSearchQuery) ||
      item.billtype.toUpperCase().includes(searchTerm) ||
      item.approvalstatus.toUpperCase().includes(searchTerm) ||
      (item.amount && item.amount.toString().includes(searchTerm))
    );
  })
  .sort((a, b) => {
    const dateA = a.date.split('/').reverse().join('-'); // Convert to YYYY-MM-DD
    const dateB = b.date.split('/').reverse().join('-');

    return new Date(dateA).getTime() - new Date(dateB).getTime(); // Ascending order
  });

 
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const renderItem = ({ item, index }: { item: TableData; index: number }) => (
    <View
      style={[
        tableStyles.row,
        { backgroundColor: index % 2 === 0 ? '#f2f0ed' : '#fff' },
      ]}

    >


      <Text style={tableStyles.cell}>{item.date}</Text>

      <Text style={tableStyles.cell}>{item.billtype.toUpperCase()}</Text>
      <Text style={tableStyles.cell}>{item.amount}</Text>
      <TouchableOpacity onPress={() => fetchReimbursementDetails(item.id)} >

        <MaterialIcons name="visibility" size={25} color="black" />
      </TouchableOpacity>




    </View>
  );



  return (


    <SafeAreaView>
      <Navbar />




      <View style={tableStyles.container}>

        {/* <Pressable
          onPress={() => navigation.navigate('Dashboard')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F79B00',
            paddingVertical: 10,
            paddingHorizontal: 10,
            width: 170,
            alignSelf: 'flex-end',
            borderRadius: 10,

            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 10 }}>
        Go to Dhashboard
          </Text>
          <MaterialIcons name="arrow-forward" size={24} color="white" />
        </Pressable> */}

        <TextInput
          style={tableStyles.searchInput}
          placeholder={`Search by ${filteredData.length} Item`}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <View style={tableStyles.header}>
          <Text style={tableStyles.headerCell}>  {t('Date')}</Text>
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
          <View style={HealthreportStyle.modalContainer}>

            <View style={HealthreportStyle.heading}>
              <Text style={HealthreportStyle.text} >{t("ReimbursmentList")}</Text>
            </View>
            <View style={HealthreportStyle.modalContent}>

              {selectedReimbursement && (
                <>
                  <View style={HealthreportStyle.rowone}>
                    <Text style={HealthreportStyle.labelone}>{t('Date')}</Text>
                    <Text style={HealthreportStyle.valueone}>{selectedReimbursement.date}</Text>
                  </View>


                  <View style={HealthreportStyle.rowone}>
                    <Text style={HealthreportStyle.labelone}>{t('Billtype')}</Text>
                    <Text style={HealthreportStyle.valueone}>{selectedReimbursement.billtype.toUpperCase()}</Text>
                  </View>


                 


                  <View style={HealthreportStyle.rowone}>
                    <Text style={HealthreportStyle.labelone}>{t('Amount')}</Text>
                    <Text style={HealthreportStyle.valueone}>₹{selectedReimbursement.amount}</Text>
                  </View>



                  <View style={HealthreportStyle.rowone}>
                    <Text style={HealthreportStyle.labelone}>{t('purpose')}</Text>
                    <Text style={HealthreportStyle.valueone}>{selectedReimbursement.purpose}</Text>
                  </View>








                  {selectedReimbursement.images && selectedReimbursement.images.length > 0 && (
                    <Image
                      source={{ uri: `https://dev-backend-2024.epravaha.com${selectedReimbursement.images[0]}` }}
                      style={tableStyles.image}
                    />
                  )}


                </>
              )}
              <TouchableOpacity
                style={tableStyles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: 'white' }}>{t('Close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={tableStyles.emptyText}>No data available</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      </View>

    </SafeAreaView>
  );
};

export default ReimbursementList;
