import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { MMKV } from 'react-native-mmkv';

import en from './en';
import hi from './hi';


// 🔐 Create MMKV instance
export const storage = new MMKV();
const savedLang = storage.getString('user-language') || 'en';

const resources = {
  en: { translation: en },
  hi: { translation: hi },

};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
