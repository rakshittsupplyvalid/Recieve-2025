import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, TextInput } from 'react-native';
import api from '../service/api/apiInterceptors';
import { formatDate } from '../utils/dateUtils';
import ReimbTableViewStyles from '../theme/ReimbTableViewStyles';




const ReimbTableView: React.FC<{ id: any }> = ({ id }) => {
  const [tableData, setTableData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const response = await api.get(`/api/reimbursment/${id}`);

      setTableData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch data from API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={ReimbTableViewStyles.loader} />;
  }




  return (
    <SafeAreaView style={{ flex: 4  , paddingHorizontal : 10 }}>
    
          
      {/* <DynamicDetailView
        title="Reimbursement Details"
        data={{
          date: formatDate(tableData?.date) ,
          user: tableData?.username,
          "bill type": tableData?.billtype,
          "Purpose" : tableData?.purpose,
          "approval status": tableData?.approvalstatus,
          "Total Amount": tableData?.amount,
          // "paid amount": tableData?.paidamount,
          // "pending amount": tableData?.pendingamount,
        }}
        files={tableData?.images ?? []}
      /> */}
    </SafeAreaView>
  );
};

export default ReimbTableView;
