import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const useScreenRefresh = (fetchFunction: () => void) => {
  useFocusEffect(
    useCallback(() => {
      fetchFunction();
    }, [fetchFunction])
  );
};

export default useScreenRefresh;
