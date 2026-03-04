package it.pagopa.io.app.modules

import android.graphics.Bitmap
import android.graphics.Color
import android.util.Base64
import com.facebook.react.bridge.*
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import java.io.ByteArrayOutputStream

class QRCodeGeneratorModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "QRCodeGenerator"

  @ReactMethod
  fun generate(data: String, size: Double, promise: Promise) {
    try {
      val px = size.toInt()
      val hints = mapOf(
        EncodeHintType.CHARACTER_SET to "UTF-8",
        EncodeHintType.MARGIN to 0,
        EncodeHintType.ERROR_CORRECTION to ErrorCorrectionLevel.H
      )
      val bitMatrix = QRCodeWriter().encode(data, BarcodeFormat.QR_CODE, px, px, hints)
      val bitmap = Bitmap.createBitmap(px, px, Bitmap.Config.ARGB_8888)
      for (x in 0 until px) {
        for (y in 0 until px) {
          bitmap.setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
        }
      }
      val stream = ByteArrayOutputStream()
      bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
      promise.resolve("data:image/png;base64,${Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)}")
    } catch (e: Exception) {
      promise.reject("QR_ERROR", e.message ?: "Unknown error", e)
    }
  }
}
