import { StyleSheet } from 'react-native';


 export const HealthreportStyle = StyleSheet.create({


    container: { flex: 1, backgroundColor: '#fff' },
    searchInput: { margin: 10, padding: 17, borderWidth: 1, borderRadius: 25, borderColor: '#ccc', backgroundColor: 'fff' },
    dateFilterContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
    dateButton: { backgroundColor: '#F79B00', padding: 10, borderRadius: 5 },
    one: { paddingHorizontal: 30 },
    card: { paddingHorizontal: 35, paddingVertical: 20, backgroundColor: 'white', borderRadius: 8, elevation: 3, marginVertical: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    rowone: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  
      width: 300,
      flexWrap: 'wrap',  // Ensure text wraps inside
      overflow: 'hidden',  // Hide overflowing content
      paddingHorizontal: 10  // Add some padding
    },
  
    label: { fontWeight: 'bold', color: '#333' },
    value: { color: '#555' },
    labelone: { fontWeight: 'bold', color: '#333', fontSize: 20 },
    valueone: { color: '#555', fontSize: 18 },
    button: { backgroundColor: '#F79B00', padding: 8, borderRadius: 5, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    parentbutton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark Transparent Overlay
      justifyContent: 'center',
      alignItems: 'center',
  
  
    },
  
    heading: {
      justifyContent: 'center',
      height: '8%',
      width: '90%',
      backgroundColor: '#FF9500',
      borderTopLeftRadius: 10, // Adjust the radius as needed
      borderTopRightRadius: 10,
    },
  
    text: {
  
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white'
  
    },
    modalContent: {
  
      borderTopColor: '#ffcc00',
      width: '90%',
      backgroundColor: '#fff',
      borderBottomLeftRadius: 10, // Adjust the radius as needed
      borderBottomRightRadius: 10,
      padding: 20,
      alignItems: 'center',
      elevation: 10, // Shadow for Android
      shadowColor: '#000', // Shadow for iOS
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    modalText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
      marginBottom: 8,
      textAlign: 'center',
    },
    showImageButton: {
      marginTop: 10,
      backgroundColor: '#F79B00',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: '40%',
      alignItems: 'center',
    },
    closeButton: {
      marginTop: 15,
      backgroundColor: '#d9534f',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: '40%',
      alignItems: 'center',
    },
  
  
    image: {
      width: 250,
      height: 150,
      marginVertical: 10,
      borderRadius: 10,
      resizeMode: 'cover',
      marginLeft: 20
    },
    topRightCorner: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 25,
      height: 25,
      backgroundColor: '#F79B00', // Red-Orange Color
      borderTopRightRadius: 10,
    },
  
    // Left Bottom Corner
    bottomLeftCorner: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: 25,
      height: 25,
      backgroundColor: '#F79B00', // Blue Color
      borderBottomLeftRadius: 10,
    },
  
  
  });