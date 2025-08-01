import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StyleSheet,
    FlatList,
    Dimensions
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ImageViewing from "react-native-image-viewing";
import { useTranslation } from 'react-i18next';
import apiClient from '../../service/api/apiInterceptors';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../../types/Type';




interface Report {
    id: string;
    assayerName: string;
    date: string;
    truckNumber: string;
    approvalStatus?: string;
    datastring?: string;
    files?: string[];
}

interface HealthReportDetailsRouteParams {
    reportId: string;
}

type RootStack = {
    HealthReportDetails: HealthReportDetailsRouteParams;
};

import type { RouteProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HealthReportDetails = () => {
    const route = useRoute<RouteProp<RootStack, 'HealthReportDetails'>>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { reportId } = route.params;
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [showImages, setShowImages] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                const response = await apiClient.get(`/api/healthreport/${reportId}`);
                setReport(response.data);
                console.log("Report Details:", response.data);
            } catch (error) {
                console.error('Error fetching report details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportDetails();
    }, [reportId]);

   

    const renderPercentageRow = (label: string, condition: boolean, percent: number) => (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t(label)}</Text>
            <View style={styles.percentageContainer}>
                <Text style={[
                    styles.percentageValue,
                    condition ? styles.positiveValue : styles.negativeValue
                ]}>
                    {condition ? '✓ Yes' : '✗ No'}
                </Text>
                <View style={styles.percentBarContainer}>
                    <View style={[
                        styles.percentBar,
                        {
                            width: `${percent || 0}%`,
                            backgroundColor: condition ? '#4CAF50' : '#F44336'
                        }
                    ]} />
                </View>
                <Text style={styles.percentText}>{percent || 0}%</Text>
            </View>
        </View>
    );

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return '#4CAF50';
            case 'rejected':
                return '#F44336';
            case 'pending':
                return '#FFC107';
            default:
                return '#9E9E9E';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
                <Text style={styles.loadingText}>{t('LoadingReport')}...</Text>
            </View>
        );
    }

    if (!report) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{t('ReportNotFound')}</Text>
            </View>
        );
    }

  

    return (
        <View style={styles.container}>
            <LinearGradient
            colors={['#F79B00', '#F79B00']}
                style={styles.headerGradient}
              
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('HealthReportlist')}  // Changed from goBack()
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>{t('HealthReportDetails')}</Text>

                <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, { color: getStatusColor(report.approvalStatus) }]}>
                        {report.approvalStatus}
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.contentContainer}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome name="truck" size={20} color="#F79B00'" />
                        <Text style={styles.cardTitle}>{t('BasicInformation')}</Text>
                    </View>

                 
                </View>

                

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome name="comment" size={20} color="#F79B00'" />
                        <Text style={styles.cardTitle}>{t('Comments')}</Text>
                    </View>
                </View>

                {report.files && report.files.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <FontAwesome name="camera" size={20} color="#F79B00'" />
                            <Text style={styles.cardTitle}>{t('Attachments')}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.imageToggleButton}
                            onPress={() => setShowImages(!showImages)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.imageToggleText}>
                                {showImages ? t('HideImages') : t('ShowImages')} ({report.files.length})
                            </Text>
                            <MaterialIcons
                                name={showImages ? 'visibility-off' : 'visibility'}
                                size={24}
                                color="#6C63FF"
                            />
                        </TouchableOpacity>

                        {showImages && (
                            <>
                                <FlatList
                                    data={report.files}
                                    keyExtractor={(item, index) => index.toString()}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.imageList}
                                    renderItem={({ item, index }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setCurrentImageIndex(index);
                                                setShowImages(true);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Image
                                                source={{ uri: apiClient.defaults.baseURL + item }}
                                                style={styles.imageThumbnail}
                                                resizeMode="cover"
                                            />
                                        </TouchableOpacity>
                                    )}
                                />

                                <ImageViewing
                                    images={report.files.map(file => ({ uri: apiClient.defaults.baseURL + file }))}
                                    imageIndex={currentImageIndex}
                                    visible={showImages}
                                    onRequestClose={() => setShowImages(false)}
                                    FooterComponent={({ imageIndex }) => (
                                        <View style={styles.footer}>
                                            <Text style={styles.footerText}>
                                                {imageIndex + 1} / {report.files?.length}
                                            </Text>
                                        </View>
                                    )}
                                />
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FB',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6C63FF',
        fontFamily: 'Inter-Medium',
    },
    errorText: {
        fontSize: 18,
        color: '#F44336',
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'Inter-SemiBold',
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 8,
    },
    headerText: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    statusBadge: {
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 5,
    },
    statusText: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
    },
    contentContainer: {
        flex: 1,
        marginTop: -10,
        zIndex: 5,
    },
    content: {
        padding: 16,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        color: '#333',
        marginLeft: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Inter-Medium',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'Inter-SemiBold',
        flex: 1,
        textAlign: 'right',
        marginLeft: 10,
    },
    percentageContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    percentageValue: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        width: 70,
    },
    positiveValue: {
        color: '#4CAF50',
    },
    negativeValue: {
        color: '#F44336',
    },
    percentBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#EEE',
        borderRadius: 3,
        marginHorizontal: 8,
        overflow: 'hidden',
    },
    percentBar: {
        height: '100%',
        borderRadius: 3,
    },
    percentText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Inter-Medium',
        width: 40,
        textAlign: 'right',
    },
    commentText: {
        fontSize: 14,
        color: '#555',
        fontFamily: 'Inter-Regular',
        lineHeight: 20,
        paddingTop: 5,
    },
    imageToggleButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        marginTop: 10,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#6C63FF',
    },
    imageToggleText: {
        color: '#6C63FF',
        fontFamily: 'Inter-SemiBold',
        marginRight: 8,
    },
    imageList: {
        paddingVertical: 10,
    },
    imageThumbnail: {
        width: 100,
        height: 100,
        marginRight: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    footerText: {
        fontSize: 16,
        color: '#FFF',
        fontFamily: 'Inter-SemiBold',
    },
});

export default HealthReportDetails;