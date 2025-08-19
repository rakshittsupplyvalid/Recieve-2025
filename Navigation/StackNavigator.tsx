import RNSmsRetriever from 'react-native-sms-retriever';

// Hint picker se number select karne ka dialog
async function requestPhoneNumber() {
  try {
    const phoneNumber = await RNSmsRetriever.requestPhoneNumber();
    console.log("Phone Number: ", phoneNumber);
  } catch (error) {
    console.log("Error: ", error);
  }
}
export default requestPhoneNumber;