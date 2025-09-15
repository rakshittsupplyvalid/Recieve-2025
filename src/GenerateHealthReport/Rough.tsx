// Add this state to track which images need screenshots
const [imagesNeedingScreenshots, setImagesNeedingScreenshots] = useState<number[]>([]);

// Modify the openCamera function
const openCamera = async () => {
    await fetchLocation(); // Get location first

    launchCamera(
        {
            mediaType: 'photo',
            includeBase64: false,
            cameraType: 'back',
            saveToPhotos: true,
            quality: 0.4,
            maxWidth: 700,
            maxHeight: 700,
        },
        async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const capturedImage = response.assets[0];

                // Generate MD5 hash
                const imageHash = md5(capturedImage.uri);
                const isDuplicate = state.form?.Files?.some(file => file.hash === imageHash);

                if (isDuplicate) {
                    console.log('Duplicate image detected');
                } else {
                    const newFile: ImageAsset = {
                        uri: Platform.OS === 'android'
                            ? capturedImage.uri
                            : capturedImage.uri.replace('file://', ''),
                        fileName: capturedImage.fileName || `photo_${Date.now()}.jpg`,
                        type: capturedImage.type || 'image/jpeg',
                        hash: imageHash,
                    };

                    // Update state with the new image
                    updateState({
                        form: {
                            ...state.form,
                            Files: [...(state.form?.Files || []), newFile],
                        },
                    });

                    // Add to queue for screenshot capture (don't block camera close)
                    setImagesNeedingScreenshots(prev => [...prev, (state.form?.Files || []).length]);
                }
            }
        }
    );
};

// Use useEffect to capture screenshots after images are added
useEffect(() => {
    if (imagesNeedingScreenshots.length > 0 && !isCapturingScreenshots) {
        captureScreenshotsForQueue();
    }
}, [imagesNeedingScreenshots, isCapturingScreenshots]);

const captureScreenshotsForQueue = async () => {
    if (isCapturingScreenshots || imagesNeedingScreenshots.length === 0) return;
    
    setIsCapturingScreenshots(true);
    
    try {
        const indexesToProcess = [...imagesNeedingScreenshots];
        const newScreenshots = [...screenshots];
        
        for (const index of indexesToProcess) {
            const ref = viewShotRefs.current[index];
            if (ref && typeof ref.capture === 'function') {
                try {
                    const uri = await ref.capture();
                    if (uri) {
                        const screenshotImage: ImageAsset = {
                            uri,
                            fileName: `geotagged_${Date.now()}_${index}.jpg`,
                            type: 'image/jpeg',
                        };
                        newScreenshots[index] = screenshotImage;
                    }
                } catch (error) {
                    console.error(`Error capturing screenshot for image ${index}:`, error);
                }
            }
        }
        
        setScreenshots(newScreenshots);
        setImagesNeedingScreenshots(prev => 
            prev.filter(i => !indexesToProcess.includes(i))
        );
    } catch (error) {
        console.error('Screenshot capture error:', error);
    } finally {
        setIsCapturingScreenshots(false);
    }
};

// Modify the handleDeleteImage function
const handleDeleteImage = (index) => {
    const updatedImages = [...(state.form?.Files || [])];
    updatedImages.splice(index, 1);
    
    const updatedScreenshots = [...screenshots];
    updatedScreenshots.splice(index, 1);
    
    // Remove from queue if needed
    setImagesNeedingScreenshots(prev => prev.filter(i => i !== index));
    
    updateState({
        ...state,
        form: {
            ...state.form,
            Files: updatedImages
        }
    });
    
    setScreenshots(updatedScreenshots);
};

// Add a loader indicator to your camera button
<TouchableOpacity
    style={styles.Camerabutton}
    onPress={handlePresscamera}
    disabled={(state.form?.Files || []).length >= 9 || isCapturingScreenshots}
>
    {isCapturingScreenshots ? (
        <ActivityIndicator color="white" size="small" />
    ) : (
        <>
            <MaterialIcons name="camera" size={30} color="white" />
            <Text style={styles.buttonText}>{t('PickfromCamera')}</Text>
        </>
    )}
</TouchableOpacity>