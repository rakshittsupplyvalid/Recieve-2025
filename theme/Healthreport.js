// styles.js
import { StyleSheet } from 'react-native';



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Light background for the entire screen
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },

  
    customHeader: {
    backgroundColor: '#F79B00',
    paddingVertical: 15,
    paddingHorizontal: 20,

    flexDirection: 'row', // row-wise layo
    alignItems: 'center'
  },


  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullImage: {
    width: '90%',
    height: '100%',
    resizeMode: 'contain',
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  HeadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  centerContainer: {
    flex: 1, // Take up the entire screen
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
   
    
  },
  
  onecontainers: {
    backgroundColor: '#fff',
 
    padding: 10,
    
  },


  offlinecontainers : {
    backgroundColor : 'white',
    flex: 1,  // Full screen occupy karega
    justifyContent: 'center',  // Vertical center
  

  },
  secondcontainers: {
    backgroundColor: '#fff',
 
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  thirdcontainers: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  content: {
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 50,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#FF9500', // Orange border color
    borderRadius: 50, // Fully rounded corners
    paddingHorizontal: 10,
    backgroundColor: '#ffffff', // White background
    marginBottom: 15,
    fontSize: 16,
    shadowColor: 'white', // Shadow color
    shadowOffset: { width: 0, height: 3 }, // Shadow direction (x, y) - bottom shadow
    shadowOpacity: 0.2, // Shadow opacity (0 to 1)
    shadowRadius: 3, // Shadow blur radius
    elevation: 3, // For Android shadow
  },
  inputContainer: {
    marginBottom: 15,
  },
  buttoncontent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,

  },
  button: {
    backgroundColor: '#FF9500', // Blue color for buttons
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 50,
    backgroundColor: '#ffffff',
  },
  
  thankYouMessage: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28a745', // Green color for success message
    textAlign: 'center',
    marginTop: 20,
  },

  imageGrid: {
    flexDirection: 'row', // Arrange children in a row
    flexWrap: 'wrap', // Allow wrapping to the next row
    justifyContent: 'space-between', // Space between columns
    marginTop: 20,
  },
  imageContainer: {
    width: '48%', // Each image takes 48% of the container width (leaving space for margins)
    aspectRatio: 1, // Maintain a square aspect ratio
    marginBottom: 10, // Space between rows
    borderRadius: 10, // Rounded corners for the image container
    overflow: 'hidden', // Ensure the image stays within the container
   
  },
  image: {
    width: '100%', // Fill the container width
    height: '100%', // Fill the container height
  },
  deleteIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: 2,
  },
});
export default styles;
