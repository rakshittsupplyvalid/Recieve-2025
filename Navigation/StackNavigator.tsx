import React, { useState } from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import LoginApp from '../MainComponent/LoginApp';
import Federation from '../MainComponent/ReportOffline';




import Navbar from '../App/Navbar';


import DispatchDrawernavigator from './DispatchDrawernavigator';
import DispatchRecieve from '../Screenthree/DispatchRecieve';
import ReimbursementList from '../Screenthree/ReimbursementList';

import HealthReport from '../Screenthree/HealthReport';
import ForgetPassword from '../MainComponent/ForgetPassword';
import OfflineForm from '../Screenthree/OfflineForm';
import ReportOffline from '../MainComponent/ReportOffline';
import SubmitTruckData from '../Screenthree/SubmitTruckData';
import LanguageSelector from '../Screenthree/Languages';



const Stack = createStackNavigator();

export default function StackNavigator() {


  return (

    <Stack.Navigator
      id={undefined}

      initialRouteName={'LoginApp'}
      screenOptions={{ headerShown: false }}

    >

      <Stack.Screen name="LoginApp" component={LoginApp} />
      <Stack.Screen name="DispatchDrawernavigator" component={DispatchDrawernavigator} />
      <Stack.Screen name="ReportOffline" component={ReportOffline} />
      <Stack.Screen name="DispatchRecieve" component={DispatchRecieve} />
      <Stack.Screen name="Federation" component={Federation} />
      <Stack.Screen name="Navbar" component={Navbar} />
      <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
      <Stack.Screen name="HealthReport" component={HealthReport} />
      <Stack.Screen name="ReimbursementList" component={ReimbursementList} />
      <Stack.Screen name = "OfflineForm" component={OfflineForm} />
      <Stack.Screen name = "SubmitTruckData" component={SubmitTruckData} />
      <Stack.Screen name = "LanguageSelector" component={LanguageSelector} />
    
    
    </Stack.Navigator>

  );
}



