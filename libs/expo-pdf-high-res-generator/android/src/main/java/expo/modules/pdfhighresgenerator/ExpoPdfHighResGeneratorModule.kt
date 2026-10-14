package expo.modules.pdfhighresgenerator

import android.graphics.Bitmap
import android.graphics.pdf.PdfRenderer
import androidx.core.net.toUri
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

private class PdfGenerationException(message: String, cause: Throwable? = null) :
  CodedException(message, cause)

class ExpoPdfHighResGeneratorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoPdfHighResGenerator")

    AsyncFunction("generate") { filePath: String, scale: Double ->
      generate(filePath, scale)
    }
  }

  // Renders every page of the PDF at `filePath` to a JPEG, returning the `file://` URIs of the produced images.
  private fun generate(filePath: String, scale: Double): List<String> {
    var fileDescriptor: android.os.ParcelFileDescriptor? = null
    var tempPdfFile: File? = null
    var bitmap: Bitmap? = null
    try {
      val context = appContext.reactContext
        ?: throw PdfGenerationException("React context is not available")
      val uri = filePath.toUri()
      // Needed to resolve permission issues and "content://" vs "file://"
      tempPdfFile = File(context.cacheDir, "temp_source_${UUID.randomUUID()}.pdf")
      val inputStream = context.contentResolver.openInputStream(uri)
        ?: throw PdfGenerationException("Unable to open stream for: $filePath")

      // Copy stream -> file
      FileOutputStream(tempPdfFile).use { outputStream ->
        inputStream.use { input ->
          input.copyTo(outputStream)
        }
      }

      // Use it now that we have a proper file
      fileDescriptor = android.os.ParcelFileDescriptor.open(
        tempPdfFile,
        android.os.ParcelFileDescriptor.MODE_READ_ONLY
      )
      val renderer = PdfRenderer(fileDescriptor)
      val outputPaths = mutableListOf<String>()
      val cacheDir = context.cacheDir

      // Maximum dimensions to prevent memory issues
      val maxWidth = 4096
      val maxHeight = 4096

      for (i in 0 until renderer.pageCount) {
        val page = renderer.openPage(i)

        // Calculate target size with initial scale
        var width = (page.width * scale).toInt()
        var height = (page.height * scale).toInt()

        // Apply limits: scale down if exceeds max dimensions
        if (width > maxWidth || height > maxHeight) {
          val widthScale = maxWidth.toDouble() / width
          val heightScale = maxHeight.toDouble() / height
          val limitScale = minOf(widthScale, heightScale)
          width = (width * limitScale).toInt()
          height = (height * limitScale).toInt()
        }

        bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)

        // Set white background for better visibility
        bitmap.eraseColor(android.graphics.Color.WHITE)

        page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)

        val fileName = "pdf_render_${UUID.randomUUID()}_$i.jpg"
        val outputFile = File(cacheDir, fileName)
        val outputStream = FileOutputStream(outputFile)

        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, outputStream)
        outputStream.close()

        outputPaths.add("file://${outputFile.absolutePath}")

        page.close()
        bitmap.recycle()
      }

      renderer.close()
      return outputPaths
    } catch (e: OutOfMemoryError) {
      throw PdfGenerationException("Out of memory while rendering PDF", e)
    } catch (e: PdfGenerationException) {
      throw e
    } catch (e: Exception) {
      throw PdfGenerationException(e.message ?: "Unknown error while rendering PDF", e)
    } finally {
      bitmap?.recycle()
      try {
        fileDescriptor?.close()
        tempPdfFile?.delete()
      } catch (e: Exception) {
        // Ignore errors on close
      }
    }
  }
}
