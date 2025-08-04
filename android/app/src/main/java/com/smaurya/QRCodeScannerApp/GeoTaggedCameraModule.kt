package com.smaurya.QRCodeScannerApp

import android.app.Activity
import android.content.Intent
import android.location.Location
import android.location.LocationManager
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import android.widget.Toast
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class GeoTaggedCameraModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var promise: Promise? = null
    private var photoURI: Uri? = null
    private lateinit var currentPhotoPath: String

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "GeoTaggedCamera"
    }

    @ReactMethod
    fun openCamera(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity doesn't exist")
            return
        }

        this.promise = promise

        val photoFile: File = createImageFile(activity)
        photoURI = FileProvider.getUriForFile(
            activity,
            "${activity.packageName}.provider",
            photoFile
        )

        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        intent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI)

        if (intent.resolveActivity(activity.packageManager) != null) {
            activity.startActivityForResult(intent, 101)
        } else {
            promise.reject("ERROR", "No Camera App Found")
        }
    }

    private fun createImageFile(activity: Activity): File {
        val timeStamp: String = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir: File? = activity.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("JPEG_${timeStamp}_", ".jpg", storageDir).apply {
            currentPhotoPath = absolutePath
        }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == 101 && resultCode == Activity.RESULT_OK) {
            val locationManager = activity?.getSystemService(Activity.LOCATION_SERVICE) as LocationManager
            val location: Location? = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)

            val result = WritableNativeMap().apply {
                putString("imagePath", currentPhotoPath)
                putDouble("latitude", location?.latitude ?: 0.0)
                putDouble("longitude", location?.longitude ?: 0.0)
            }

            promise?.resolve(result)
        } else {
            promise?.reject("CANCELLED", "User cancelled")
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}
