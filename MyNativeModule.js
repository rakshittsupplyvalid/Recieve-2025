import { NativeModules } from 'react-native';

const { MyNativeModule } = NativeModules;

NativeModules.MyNativeModule.showGreetingUI("Khushi")
  .then(res => console.log(res))
  .catch(err => console.error(err));

export default MyNativeModule;
