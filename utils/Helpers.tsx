import { mmkvStorage } from "../service/storage";
import { Href, useRouter } from "expo-router";  
import { useLocalSearchParams } from "expo-router";
// import * as Haptics from 'expo-haptics';

export const resetAndNavigate = (newPath: Href) => {  

    const router = useRouter();  
    if (router.canGoBack()) {
        router.dismissAll();
    }
    router.replace(newPath);
};

export const backScreen = () => {
    const router = useRouter();  // Ensure useRouter() is used
    router.back();
};



export const useQueryParams = () => {
    const params = useLocalSearchParams();
    return params;
};


