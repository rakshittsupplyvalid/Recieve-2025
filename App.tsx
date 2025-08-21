import React, { useRef, useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './Navigation/StackNavigator';
import { NavigationContainerRef } from '@react-navigation/native';
import * as SplashScreen from "expo-splash-screen";
import { View, ActivityIndicator } from 'react-native';

type RootParamList = {};

export const NavigationContext = React.createContext<NavigationContainerRef<RootParamList> | null>(null);

// Keep splash screen visible until manually hidden
SplashScreen.preventAutoHideAsync();

const App = () => {
  const navigationRef = useRef<NavigationContainerRef<RootParamList> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (navigationRef.current) {
      setIsReady(true);
    }
  }, [navigationRef.current]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      // Hide native splash screen
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }} onLayout={onLayoutRootView}>
      <NavigationContainer ref={navigationRef}>
        {isReady ? (
          <NavigationContext.Provider value={navigationRef.current}>
            <StackNavigator />
          </NavigationContext.Provider>
        ) : (
          // 👇 Custom fallback screen (white + loader)
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}
      </NavigationContainer>
    </View>
  );
};

export default App;
