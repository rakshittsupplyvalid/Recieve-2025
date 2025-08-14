import { StyleSheet } from 'react-native';

export const tableStyles = StyleSheet.create({
    container: {
        
        padding: 20,
        backgroundColor: '#ffffff',
        
    },
    searchInput: {
        marginBottom: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: '#455048',
        borderRadius: 8,
        fontSize: 16,
    
    },
    header: {
        flexDirection: 'row',
        backgroundColor: '#F6A00191',
        paddingVertical: 12,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
        paddingHorizontal : 14
    },
    headerCell: {
        flex: 1,
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 16,
        color: '#ffffff',
        letterSpacing : 1
     
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 16,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 2,
        borderBottomColor: '#e9ecef',
        paddingHorizontal : 14,
        borderLeftWidth : 1,
        borderLeftColor :'#e9ecef',
        borderRightWidth : 1,
        borderRightColor :'#e9ecef',
        
    },
    cell: {
        flex: 1,
       
        fontSize: 15,
        fontWeight: '400',
        color: '#2e2e2e',
        
    },
    button: {
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#6c757d',
        marginTop: 20,
    },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: 300, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  closeButton: { marginTop: 15, backgroundColor: 'red', padding: 10, borderRadius: 5 },
  text: {
    fontSize: 16,
    color: 'black', // White text for better contrast
    marginBottom: 5,
    maxWidth: 350, // Responsive width
   
    padding: 8, // Padding to make text readable
    borderRadius: 5, // Rounded corners
    textAlign: 'center', // Center align text
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 5,
  },
  
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
 
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 10,

  },
  
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagesContainer: {
  marginTop: 15,
  padding: 10,
  backgroundColor: '#f5f5f5',
  borderRadius: 5,
},
imagesTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 10,
},

});
