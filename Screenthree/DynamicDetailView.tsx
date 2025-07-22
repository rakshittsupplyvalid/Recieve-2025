import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';




interface DynamicDetailViewProps {

  title?: string;
  data: Record<string, any>;
  files?: string[];

  
}





const DynamicDetailView: React.FC<DynamicDetailViewProps> = ({ title, data = [] }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title Section */}
      {title && <Text style={styles.header}>{title}</Text>}

      {/* Render Key-Value Pairs */}
      {Object.entries(data).map(([key, value], index) => (
        <View key={index} style={styles.itemContainer}>
          <Text style={styles.keyText}>{formatKey(key)}:</Text>
          <Text style={styles.valueText}>{value ?? 'N/A'}</Text>
        </View>
      ))}

      {/* Render Files */}
      {/* {files.length > 0 && (
        <View style={styles.filesContainer}>
          <Text style={styles.filesHeader}>Attached Files:</Text>
          {files.map((fileUri, index) => (
   
   
            <FileView key={index} fileUris={[fileUri]} />
 
          ))}
        </View>
      )} */}
    </ScrollView>
  );
};

const formatKey = (key: string) =>
  key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toUpperCase();

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ededed',
    borderRadius: 10,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    color: '#6b7b8f',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  keyText: {
    fontWeight: '400',
    color: '#2e2e2e',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  valueText: {
    color: '#3a3a3a',
    flexShrink: 1,
    fontSize: 16,
    textAlign: 'right',
    fontWeight: '400',
    textTransform: 'uppercase',
  },
  filesContainer: {
    marginTop: 20,
  },
  filesHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7b8f',
    marginBottom: 10,
  },
});

export default DynamicDetailView;
