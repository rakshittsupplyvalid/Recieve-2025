package com.smaurya.QRCodeScannerApp

import android.widget.Toast
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class MyNativeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MyNativeModule"

    @ReactMethod
    fun greet(name: String, promise: Promise) {
        val message = "Hello $name from Kotlin!"

        // Native Android Toast for feedback
        Toast.makeText(reactApplicationContext, message, Toast.LENGTH_LONG).show()

        // Resolve promise to return value to JavaScript
        promise.resolve(message)
    }


    @ReactMethod
fun showGreetingUI(name: String, promise: Promise) {
    val currentActivity = currentActivity
    if (currentActivity != null) {
        val intent = android.content.Intent(currentActivity, GreetingActivity::class.java)
        intent.putExtra("name", name)
        currentActivity.startActivity(intent)

        promise.resolve("GreetingActivity launched")
    } else {
        promise.reject("ACTIVITY_NOT_FOUND", "Current activity is null")
    }
}


}
