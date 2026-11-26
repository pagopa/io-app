package expo.modules.cieid

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.Signature
import android.net.Uri
import android.os.Build
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.security.MessageDigest

class ExpoCieIdModule : Module() {
  private var pendingResult: Promise? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoCieId")

    Function("isAppInstalled") { packageName: String, signature: String? ->
      try {
        val packageManager = appContext.reactContext?.packageManager
        if (packageManager == null) {
          false
        } else {
          packageManager.getPackageInfo(packageName, 0)
          signature == null || isSignatureValid(packageManager, packageName, signature)
        }
      } catch (_: Exception) {
        false
      }
    }

    AsyncFunction("launchCieIdForResult") {
        packageName: String, className: String, signature: String?, url: String, promise: Promise ->
      val activity = appContext.currentActivity
      if (pendingResult != null) {
        promise.resolve(errorResult(ModuleError.CIEID_OPERATION_NOT_SUCCESSFUL))
      } else if (activity == null) {
        promise.resolve(errorResult(ModuleError.REACT_ACTIVITY_IS_NULL))
      } else {
        try {
          if (signature != null && !isSignatureValid(activity.packageManager, packageName, signature)) {
            promise.resolve(errorResult(ModuleError.CIEID_SIGNATURE_MISMATCH))
          } else {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
              setClassName(packageName, className)
            }
            pendingResult = promise
            activity.startActivityForResult(intent, CIEID_REQUEST_CODE)
          }
        } catch (exception: ActivityNotFoundException) {
          pendingResult = null
          promise.resolve(errorResult(ModuleError.CIEID_ACTIVITY_IS_NULL, mapOf(
            "Exception" to exception.javaClass.name,
            "Message" to (exception.message ?: "")
          )))
        } catch (_: Exception) {
          pendingResult = null
          promise.resolve(errorResult(ModuleError.UNKNOWN_EXCEPTION))
        }
      }
    }.runOnQueue(Queues.MAIN)

    OnActivityResult { _, result ->
      if (result.requestCode == CIEID_REQUEST_CODE) {
        val promise = pendingResult
        pendingResult = null
        promise?.resolve(authenticationResult(result.resultCode, result.data))
      }
    }

    OnDestroy {
      val promise = pendingResult
      pendingResult = null
      promise?.resolve(errorResult(ModuleError.CIEID_OPERATION_CANCEL))
    }
  }

  private fun authenticationResult(resultCode: Int, data: Intent?): Map<String, Any> =
    when (resultCode) {
      Activity.RESULT_OK -> {
        val url = data?.getStringExtra(ReturnType.URL.toString())
        if (!url.isNullOrEmpty()) {
          mapOf("id" to ReturnType.URL.toString(), "url" to url)
        } else {
          val errorCode = data?.getIntExtra(
            ReturnType.ERROR.toString(),
            RedirectionError.GENERIC_ERROR.code
          )
          val errorMessage = data?.getStringExtra(ReturnType.ERROR_MESSAGE.toString())
          val error = when (errorCode) {
            RedirectionError.GENERIC_ERROR.code -> ModuleError.GENERIC_ERROR
            RedirectionError.CIE_NOT_REGISTERED.code -> ModuleError.CIE_NOT_REGISTERED
            RedirectionError.AUTHENTICATION_ERROR.code -> ModuleError.AUTHENTICATION_ERROR
            RedirectionError.NO_SECURE_DEVICE.code -> ModuleError.NO_SECURE_DEVICE
            else -> ModuleError.CIEID_EMPTY_URL_AND_ERROR_EXTRAS
          }
          errorResult(error, message = errorMessage)
        }
      }
      Activity.RESULT_CANCELED -> {
        val errorMessage = data?.getStringExtra(ReturnType.ERROR_MESSAGE.toString())
        errorResult(ModuleError.CIEID_OPERATION_CANCEL, message = errorMessage)
      }
      else -> errorResult(ModuleError.CIEID_OPERATION_NOT_SUCCESSFUL)
    }

  private fun errorResult(
    error: ModuleError,
    userInfo: Map<String, String> = emptyMap(),
    message: String? = null
  ): Map<String, Any> = buildMap {
    put("id", ReturnType.ERROR.toString())
    put("code", error.name)
    put("userInfo", userInfo)
    if (message != null) put("message", message)
  }

  private fun isSignatureValid(packageManager: PackageManager, packageName: String, signature: String): Boolean {
    val packageInfo = packageManager.getPackageInfoCompat(packageName)
    return packageInfo.getSignaturesCompat()?.any { it.toSha256() == signature } ?: false
  }

  private fun PackageManager.getPackageInfoCompat(packageName: String): PackageInfo =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES)
    } else {
      @Suppress("DEPRECATION")
      getPackageInfo(packageName, PackageManager.GET_SIGNATURES)
    }

  private fun PackageInfo.getSignaturesCompat(): Array<Signature>? =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      signingInfo?.apkContentsSigners
    } else {
      @Suppress("DEPRECATION")
      signatures
    }

  private fun Signature.toSha256(): String =
    MessageDigest.getInstance("SHA-256").digest(toByteArray())
      .joinToString(":") { byte -> "%02X".format(byte) }

  private enum class ModuleError {
    GENERIC_ERROR,
    REACT_ACTIVITY_IS_NULL,
    CIEID_ACTIVITY_IS_NULL,
    CIEID_SIGNATURE_MISMATCH,
    CIE_NOT_REGISTERED,
    AUTHENTICATION_ERROR,
    NO_SECURE_DEVICE,
    CIEID_EMPTY_URL_AND_ERROR_EXTRAS,
    CIEID_OPERATION_CANCEL,
    CIEID_OPERATION_NOT_SUCCESSFUL,
    UNKNOWN_EXCEPTION
  }

  private enum class RedirectionError(val code: Int) {
    GENERIC_ERROR(0),
    CIE_NOT_REGISTERED(1),
    AUTHENTICATION_ERROR(2),
    NO_SECURE_DEVICE(3)
  }

  private enum class ReturnType(private val key: String) {
    ERROR("ERROR"),
    URL("URL"),
    ERROR_MESSAGE("error_message");

    override fun toString() = key
  }

  private companion object {
    const val CIEID_REQUEST_CODE = 0xC1E
  }
}