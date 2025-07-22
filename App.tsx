import React, { useRef, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './Navigation/StackNavigator';  
import { NavigationContainerRef } from '@react-navigation/native';

type RootParamList = {};

export const NavigationContext = React.createContext<NavigationContainerRef<RootParamList> | null>(null); // Named export

const App = () => {
  const navigationRef = useRef<NavigationContainerRef<RootParamList> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (navigationRef.current) {
      setIsReady(true);
    }
  }, [navigationRef.current]);

  return (
    
    <NavigationContainer ref={navigationRef}>
      {isReady && (
        <NavigationContext.Provider value={navigationRef.current}>
          <StackNavigator />
        </NavigationContext.Provider>
      )}
    </NavigationContainer>
  );
};

export default App;
