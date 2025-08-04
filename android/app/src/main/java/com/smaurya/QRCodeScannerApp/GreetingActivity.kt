package com.smaurya.QRCodeScannerApp

import android.app.Activity
import android.os.Bundle
import android.widget.TextView
import android.widget.LinearLayout
import android.widget.Button
import android.widget.Toast

class GreetingActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val name = intent.getStringExtra("name") ?: "Guest"

        val layout = LinearLayout(this)
        layout.orientation = LinearLayout.VERTICAL
        layout.setPadding(50, 100, 50, 100)

        val textView = TextView(this)
        textView.text = "Hello $name! 👋"
        textView.textSize = 24f

        val button = Button(this)
        button.text = "Close"
        button.setOnClickListener {
            Toast.makeText(this, "Closing UI", Toast.LENGTH_SHORT).show()
            finish()
        }

        layout.addView(textView)
        layout.addView(button)

        setContentView(layout)
    }
}
