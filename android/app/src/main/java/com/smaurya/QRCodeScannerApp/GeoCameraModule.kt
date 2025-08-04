package com.smaurya.QRCodeScannerApp

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Environment
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class GeoCameraModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var photoUri: Uri? = null
    private var cameraPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "GeoCameraModule"

    @ReactMethod
    fun openCamera(promise: Promise) {
        val activity: Activity? = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Activity doesn't exist")
            return
        }

        val timeStamp: String = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val imageFileName = "JPEG_${timeStamp}_"
        val storageDir: File? = activity.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        val imageFile = File.createTempFile(imageFileName, ".jpg", storageDir)
        photoUri = FileProvider.getUriForFile(
            activity,
            "${reactContext.packageName}.provider",
            imageFile
        )

        val cameraIntent = Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE)
        cameraIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, photoUri)

        if (cameraIntent.resolveActivity(activity.packageManager) != null) {
            cameraPromise = promise
            activity.startActivityForResult(cameraIntent, 1001)
        } else {
            promise.reject("NO_CAMERA", "No camera app found")
        }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == 1001) {
            if (resultCode == Activity.RESULT_OK && photoUri != null) {
                cameraPromise?.resolve(photoUri.toString())
            } else {
                cameraPromise?.reject("CANCELLED", "User cancelled camera")
            }
            cameraPromise = null
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}
