import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LotDetails from '../src/LotDetails/LotDetails';


const Drawer = createDrawerNavigator();

export default function VendorAdminDrawernavigator() {


    return (
        <Drawer.Navigator
            id={undefined}


        >

            <Drawer.Screen
                name="LotDetails"
                component={LotDetails}
                options={{
                    title: 'Lot Details', // or use translation: t('lotDetails')
                    headerShown: true,
                    drawerIcon: ({ color, size }) => (
                        <Icon name="info" size={size} color={color} />
                    ),
                }}
            />


        </Drawer.Navigator>
    );
}



const styles = StyleSheet.create({
    offlineContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8d7da',
    },
    offlineText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#721c24',
    },
    drawerFooter: {
        marginTop: 30,
        padding: 10,
        marginBottom: 40,
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    footerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
});