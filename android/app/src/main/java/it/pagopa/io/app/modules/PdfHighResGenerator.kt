package it.pagopa.io.app.modules

import android.graphics.Bitmap
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import androidx.core.net.toUri

class PdfHighResGeneratorModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "PdfHighResGenerator"
  }

  @ReactMethod
  fun generate(filePath: String, scale: Double, promise: Promise) {
    var fileDescriptor: ParcelFileDescriptor? = null
    var tempPdfFile: File? = null
    var bitmap: Bitmap? = null
    try {
      val context = reactApplicationContext
      val uri = filePath.toUri()
      // Needed to resolve permission issues and "content://" vs "file://"
      tempPdfFile = File(context.cacheDir, "temp_source_${UUID.randomUUID()}.pdf")
      val inputStream = context.contentResolver.openInputStream(uri)

      if (inputStream == null) {
        promise.reject("FILE_NOT_FOUND", "Unable to open stream for: $filePath")
        return
      }

      // Copy stream -> file
      FileOutputStream(tempPdfFile).use { outputStream ->
        inputStream.use { input ->
          input.copyTo(outputStream)
        }
      }

      // Use it now that we have a proper file
      fileDescriptor = ParcelFileDescriptor.open(tempPdfFile, ParcelFileDescriptor.MODE_READ_ONLY)
      val renderer = PdfRenderer(fileDescriptor)
      val outputPaths = WritableNativeArray()
      val cacheDir = context.cacheDir

      for (i in 0 until renderer.pageCount) {
        val page = renderer.openPage(i)

        val width = (page.width * scale).toInt()
        val height = (page.height * scale).toInt()

        bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)

        // Set white background for better visibility
        bitmap.eraseColor(android.graphics.Color.WHITE)

        page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)

        val fileName = "pdf_render_${UUID.randomUUID()}_$i.jpg"
        val outputFile = File(cacheDir, fileName)
        val outputStream = FileOutputStream(outputFile)

        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, outputStream)
        outputStream.close()

        outputPaths.pushString("file://${outputFile.absolutePath}")

        page.close()
        bitmap.recycle()
      }

      renderer.close()
      promise.resolve(outputPaths)

    } catch (e: OutOfMemoryError) {
      promise.reject("PDF_RENDER_OOM", "Out of memory while rendering PDF", e)
    } catch (e: Exception) {
      promise.reject("PDF_RENDER_ERROR", e.message, e)
    } finally {
      // Cleanup
      bitmap?.recycle()
      try {
        fileDescriptor?.close()
        // Optional deletion of temp file if created to free up space
        tempPdfFile?.delete()
      } catch (e: Exception) {
        // Ignore errors on close
      }
    }
  }
}
