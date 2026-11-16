package expo.modules.crypto

import android.os.Build
import android.util.Base64
import android.util.Log
import androidx.annotation.RequiresApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import org.bouncycastle.asn1.ASN1Primitive
import org.bouncycastle.asn1.DERIA5String
import org.bouncycastle.asn1.DEROctetString
import org.bouncycastle.asn1.x509.CRLDistPoint
import org.bouncycastle.asn1.x509.DistributionPoint
import org.bouncycastle.asn1.x509.DistributionPointName
import org.bouncycastle.asn1.x509.Extension
import org.bouncycastle.asn1.x509.GeneralName
import org.bouncycastle.asn1.x509.GeneralNames
import java.io.ByteArrayInputStream
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.security.cert.CRLException
import java.security.cert.CertPathValidator
import java.security.cert.CertPathValidatorException
import java.security.cert.CertificateException
import java.security.cert.CertificateExpiredException
import java.security.cert.CertificateFactory
import java.security.cert.CertificateNotYetValidException
import java.security.cert.PKIXBuilderParameters
import java.security.cert.TrustAnchor
import java.security.cert.X509CRL
import java.security.cert.X509CertSelector
import java.security.cert.X509Certificate
import java.util.Date

/**
 * Configuration options for X.509 certificate verification.
 *
 * @property connectTimeout Network connection timeout in milliseconds.
 * @property readTimeout Network read timeout in milliseconds.
 * @property requireCrl If true, certificate validation will fail if CRLs cannot be checked
 * (e.g., no CDP in chain, or CRL fetch/validation fails).
 */
data class X509VerificationOptions(
  val connectTimeout: Int = 15000, // Default 15 seconds
  val readTimeout: Int = 15000,    // Default 15 seconds
  val requireCrl: Boolean = false  // Default to false (current behavior)
)

/**
 * Utility class for X.509 certificate validation, including chain verification and CRL checks.
 * Revocation policy, applied per certificate: a certificate is checked against its CRL only when
 * it publishes a CRL Distribution Point. A certificate without a CDP cannot be covered by any CRL
 * and is therefore not a failure. A revoked certificate always fails; an undetermined revocation
 * status fails only when requireCrl is set.
 * Compatible with Android API Level 23+.
 */
object X509VerificationUtils {

  private const val TAG = "X509Verification"
  private const val CERT_TYPE = "X.509"

  /**
   * Represents the status of the certificate chain verification process.
   */
  enum class ValidationStatus {
    VALID,                      // Chain is valid and trusted (revocation checked for every certificate publishing a CDP).
    INVALID_CHAIN_PATH,         // Basic chain path validation failed (e.g., signature, structure, or revocation issue on API < 24).
    INVALID_TRUST_ANCHOR,       // The provided trust anchor is invalid or doesn't match the chain.
    CERTIFICATE_EXPIRED,        // A certificate in the chain has expired.
    CERTIFICATE_NOT_YET_VALID,  // A certificate in the chain is not yet valid.
    CERTIFICATE_REVOKED,        // A certificate in the chain has been revoked according to its CRL.
    CRL_FETCH_FAILED,           // Failed to download/access a required CRL published by a certificate in the chain.
    CRL_PARSE_FAILED,           // Failed to parse a downloaded CRL.
    CRL_EXPIRED,                // A required CRL has expired.
    CRL_SIGNATURE_INVALID,      // The signature on a CRL is invalid.
    CRL_REQUIRED_BUT_MISSING_CDP, // CRLs are mandatory, but no CDP was found.
    VALIDATION_ERROR            // An unexpected error occurred during validation.
  }

  /**
   * Holds the result of the certificate validation process.
   *
   * @property isValid True if the certificate chain is valid and trusted, false otherwise.
   * @property status The detailed status code indicating the outcome or reason for failure.
   * @property errorMessage A descriptive message, especially in case of failure.
   * @property failingCertificate The certificate that caused the validation failure, if applicable.
   */
  data class ValidationResult(
    val isValid: Boolean,
    val status: ValidationStatus,
    val errorMessage: String? = null,
    val failingCertificate: X509Certificate? = null
  )

  /**
   * Verifies a certificate chain against a trust anchor.
   * Revocation checks using CRLs are performed *only if* CRL Distribution Points (CDPs)
   * are specified in the certificates within the chain.
   *
   * @param certChainBase64 List of Base64 encoded certificates, starting with the end-entity cert and ending with the CA cert.
   * @param trustAnchorCertBase64 Base64 encoded trust anchor (CA) certificate.
   * @param options Configuration for network timeouts.
   * @return A [ValidationResult] indicating the outcome.
   */
  suspend fun verifyCertificateChain(
    certChainBase64: List<String>,
    trustAnchorCertBase64: String,
    options: X509VerificationOptions
  ): ValidationResult {
    if (certChainBase64.isEmpty()) {
      return ValidationResult(false, ValidationStatus.INVALID_CHAIN_PATH, "Certificate chain is empty.")
    }

    val certificateFactory: CertificateFactory
    val trustAnchorCert: X509Certificate
    val trustAnchor: TrustAnchor
    val certificateChain: List<X509Certificate>

    // --- 1. Decode Certificates and Trust Anchor ---
    try {
      certificateFactory = CertificateFactory.getInstance(CERT_TYPE)
      val trustAnchorBytes = Base64.decode(trustAnchorCertBase64, Base64.DEFAULT)
      trustAnchorCert = certificateFactory.generateCertificate(ByteArrayInputStream(trustAnchorBytes)) as X509Certificate
      trustAnchor = TrustAnchor(trustAnchorCert, null)

      val fullDecodedChain = certChainBase64.map { certBase64 ->
        val certBytes = Base64.decode(certBase64, Base64.DEFAULT)
        certificateFactory.generateCertificate(ByteArrayInputStream(certBytes)) as X509Certificate
      }

      if (fullDecodedChain.isEmpty()) {
        return ValidationResult(false, ValidationStatus.INVALID_CHAIN_PATH, "Input certificate chain is empty.")
      }

      var effectiveChainEndIndex = -1
      // Find the first certificate in the chain that is either the trust anchor
      // or is issued by the trust anchor.
      for (i in fullDecodedChain.indices) {
        val currentCert = fullDecodedChain[i]
        if (currentCert.encoded.contentEquals(trustAnchorCert.encoded) ||
          currentCert.issuerX500Principal == trustAnchorCert.subjectX500Principal) {
          effectiveChainEndIndex = i
          break // Found the effective end of the chain with respect to the trust anchor
        }
      }

      if (effectiveChainEndIndex == -1) {
        // No certificate in the provided chain is the trust anchor itself or is issued by it.
        return ValidationResult(false, ValidationStatus.INVALID_TRUST_ANCHOR, "Provided certificate chain does not connect to the trust anchor.")
      }

      // Use the chain up to the identified connecting certificate for PKIX validation
      certificateChain = fullDecodedChain.subList(0, effectiveChainEndIndex + 1)

    } catch (e: Exception) {
      val (status, message) = when(e) {
        is CertificateException -> ValidationStatus.VALIDATION_ERROR to "Failed to parse certificates: ${e.message}"
        is IllegalArgumentException -> ValidationStatus.VALIDATION_ERROR to "Invalid Base64 encoding: ${e.message}"
        else -> ValidationStatus.VALIDATION_ERROR to "Unexpected error preparing certificates: ${e.message}"
      }
      return ValidationResult(false, status, message)
    }

    // --- 2. Check Validity Periods ---
    val now = Date()
    for (cert in certificateChain) {
      try {
        cert.checkValidity(now)
      } catch (e: CertificateExpiredException) {
        return ValidationResult(false, ValidationStatus.CERTIFICATE_EXPIRED, "Certificate expired: ${cert.subjectX500Principal}", cert)
      } catch (e: CertificateNotYetValidException) {
        return ValidationResult(false, ValidationStatus.CERTIFICATE_NOT_YET_VALID, "Certificate not yet valid: ${cert.subjectX500Principal}", cert)
      }
    }

    // --- 3. Perform PKIX Path Validation (revocation is handled separately) ---
    try {
      val certPath = certificateFactory.generateCertPath(certificateChain)
      // Use the trust anchor set directly
      val pkixParams = PKIXBuilderParameters(setOf(trustAnchor), X509CertSelector())

      // Revocation is deliberately not delegated to PKIX: its built-in checker demands a CRL
      // for every certificate on the path and fails with UNDETERMINED_REVOCATION_STATUS for
      // chains whose end-entity certificate publishes no CRL Distribution Point.
      // See checkRevocationPerCertificate for the policy actually applied.
      pkixParams.isRevocationEnabled = false

      val validator = CertPathValidator.getInstance("PKIX")
      validator.validate(certPath, pkixParams)
    } catch (cpve: CertPathValidatorException) {
      return handleCertPathValidatorException(cpve, certificateChain)
    } catch (e: Exception) {
      return ValidationResult(false, ValidationStatus.VALIDATION_ERROR, "Validation execution error: ${e.message}")
    }

    // --- 4. Perform the Revocation Check, per certificate ---
    return checkRevocationPerCertificate(certificateFactory, certificateChain, trustAnchorCert, options)
      ?: ValidationResult(true, ValidationStatus.VALID)
  }

  /**
   * Analyzes a CertPathValidatorException to determine a more specific failure reason,
   * handling API level differences for BasicReason.
   */
  private fun handleCertPathValidatorException(
    e: CertPathValidatorException,
    chain: List<X509Certificate>
  ): ValidationResult {
    val certIndex = e.index
    val failingCert = if (certIndex >= 0 && certIndex < chain.size) chain[certIndex] else null
    val causeMessage = e.cause?.message ?: e.message ?: "No specific cause message"
    val baseErrorMessage = "Validation failed at index $certIndex (Cert: ${failingCert?.subjectX500Principal ?: "N/A"}): $causeMessage"

    // Use BasicReason only on API 24+
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      handleCertPathValidatorExceptionApi24(e, failingCert, baseErrorMessage)
    } else {
      // --- Fallback for API Level 23 ---
      ValidationResult(
        isValid = false,
        status = ValidationStatus.INVALID_CHAIN_PATH, // General failure for older APIs
        errorMessage = baseErrorMessage,
        failingCertificate = failingCert
      )
    }
  }

  /**
   * Handles CertPathValidatorException on API Level 24+ using BasicReason.
   * This function is marked with @RequiresApi(24) and should only be called
   * when Build.VERSION.SDK_INT >= Build.VERSION_CODES.N.
   */
  @RequiresApi(Build.VERSION_CODES.N)
  private fun handleCertPathValidatorExceptionApi24(
    e: CertPathValidatorException,
    failingCert: X509Certificate?,
    baseErrorMessage: String
  ): ValidationResult {
    val reason = e.reason

    val status = when (reason) {
      CertPathValidatorException.BasicReason.REVOKED -> ValidationStatus.CERTIFICATE_REVOKED
      CertPathValidatorException.BasicReason.UNDETERMINED_REVOCATION_STATUS -> ValidationStatus.CRL_FETCH_FAILED // Indicates revocation check couldn't complete
      CertPathValidatorException.BasicReason.EXPIRED -> ValidationStatus.CERTIFICATE_EXPIRED // Should have been caught earlier, but handle defensively
      CertPathValidatorException.BasicReason.NOT_YET_VALID -> ValidationStatus.CERTIFICATE_NOT_YET_VALID // Should have been caught earlier
      CertPathValidatorException.BasicReason.INVALID_SIGNATURE -> ValidationStatus.INVALID_CHAIN_PATH
      CertPathValidatorException.BasicReason.ALGORITHM_CONSTRAINED -> ValidationStatus.INVALID_CHAIN_PATH // Algorithm policy issue
      CertPathValidatorException.BasicReason.UNSPECIFIED -> ValidationStatus.INVALID_CHAIN_PATH // General path issue
      else -> ValidationStatus.INVALID_CHAIN_PATH // Default for any other/new reasons
    }

    val detailedErrorMessage = "$baseErrorMessage (Reason: $reason)"
    return ValidationResult(false, status, detailedErrorMessage, failingCert)
  }


  /**
   * Outcome of the revocation check for a single certificate.
   */
  private sealed class RevocationOutcome {
    /** A usable CRL was obtained and the certificate is not listed in it. */
    object NotRevoked : RevocationOutcome()

    /** A usable CRL was obtained and the certificate is listed in it. */
    object Revoked : RevocationOutcome()

    /** No usable CRL could be obtained, so the revocation status remains unknown. */
    data class Undetermined(val status: ValidationStatus, val message: String) : RevocationOutcome()
  }

  /**
   * Applies the per-certificate revocation policy to the chain.
   *
   * A certificate is checked only when it publishes at least one CRL Distribution Point.
   * A certificate without a CDP is not checkable and is not a failure, since no CRL covering
   * it can exist.
   *
   * A certificate proven to be revoked always fails validation. A certificate whose revocation
   * status cannot be determined fails only when [X509VerificationOptions.requireCrl] is set.
   *
   * @return null when the chain satisfies the policy, otherwise the failing [ValidationResult].
   */
  private suspend fun checkRevocationPerCertificate(
    factory: CertificateFactory,
    chain: List<X509Certificate>,
    trustAnchorCert: X509Certificate,
    options: X509VerificationOptions
  ): ValidationResult? {
    var anyCdpFound = false

    for ((index, cert) in chain.withIndex()) {
      val crlUrls = extractCrlDistributionPoints(cert)
      if (crlUrls.isEmpty()) continue // Not checkable: no CRL can cover this certificate.
      anyCdpFound = true

      // The issuer is the next certificate in the chain, or the trust anchor for the last one.
      val issuerCert = chain.getOrNull(index + 1) ?: trustAnchorCert

      when (val outcome = checkCertificateAgainstCrls(factory, cert, issuerCert, crlUrls, options)) {
        is RevocationOutcome.NotRevoked -> Unit
        is RevocationOutcome.Revoked -> return ValidationResult(
          false,
          ValidationStatus.CERTIFICATE_REVOKED,
          "Certificate is revoked according to its CRL: ${cert.subjectX500Principal}",
          cert
        )
        is RevocationOutcome.Undetermined -> if (options.requireCrl) {
          return ValidationResult(
            false,
            outcome.status,
            "Mandatory CRL check failed for ${cert.subjectX500Principal}: ${outcome.message}",
            cert
          )
        }
      }
    }

    if (!anyCdpFound && options.requireCrl) {
      return ValidationResult(
        false,
        ValidationStatus.CRL_REQUIRED_BUT_MISSING_CDP,
        "CRL check is mandatory, but no CRL Distribution Point was found in the certificate chain."
      )
    }

    return null
  }

  /**
   * Downloads the CRLs published by a single certificate and looks that certificate up in the
   * first CRL that passes validation.
   *
   * A CRL is usable only when it is issued by the certificate's own issuer, carries a valid
   * signature from that issuer, and is current.
   */
  private suspend fun checkCertificateAgainstCrls(
    factory: CertificateFactory,
    cert: X509Certificate,
    issuerCert: X509Certificate,
    crlUrls: List<String>,
    options: X509VerificationOptions
  ): RevocationOutcome {
    var lastStatus = ValidationStatus.CRL_FETCH_FAILED
    var lastMessage = "No CRL Distribution Point could be reached."

    for (url in crlUrls) {
      try {
        val crlBytes = downloadCrlWithTimeout(url, options)
        val crl = factory.generateCRL(ByteArrayInputStream(crlBytes)) as X509CRL

        // 1. The CRL must be issued by the certificate's own issuer.
        if (crl.issuerX500Principal != cert.issuerX500Principal) {
          lastStatus = ValidationStatus.CRL_SIGNATURE_INVALID
          lastMessage =
            "CRL from $url is issued by ${crl.issuerX500Principal}, expected ${cert.issuerX500Principal}."
          continue
        }

        // 2. The CRL must be current.
        val now = Date()
        val nextUpdate = crl.nextUpdate
        if (nextUpdate == null || now.after(nextUpdate) || now.before(crl.thisUpdate)) {
          lastStatus = ValidationStatus.CRL_EXPIRED
          lastMessage =
            "CRL from $url is not current (This Update: ${crl.thisUpdate}, Next Update: $nextUpdate)."
          continue
        }

        // 3. The CRL must carry a valid signature from the issuer.
        try {
          crl.verify(issuerCert.publicKey)
        } catch (sigEx: Exception) {
          lastStatus = ValidationStatus.CRL_SIGNATURE_INVALID
          lastMessage = "CRL signature verification failed for $url: ${sigEx.message}"
          continue
        }

        return if (crl.isRevoked(cert)) RevocationOutcome.Revoked else RevocationOutcome.NotRevoked

      } catch (e: TimeoutCancellationException) {
        lastStatus = ValidationStatus.CRL_FETCH_FAILED
        lastMessage = "Timeout downloading CRL from $url"
      } catch (e: CRLException) {
        lastStatus = ValidationStatus.CRL_PARSE_FAILED
        lastMessage = "Error parsing CRL from $url: ${e.message}"
      } catch (e: IOException) {
        lastStatus = ValidationStatus.CRL_FETCH_FAILED
        lastMessage = "Network error for CRL $url: ${e.message}"
      } catch (e: Exception) {
        lastStatus = ValidationStatus.CRL_FETCH_FAILED
        lastMessage = "Unexpected error for CRL $url: ${e.message}"
      }
    }

    Log.w(TAG, "Revocation status undetermined for ${cert.subjectX500Principal}: $lastMessage")
    return RevocationOutcome.Undetermined(lastStatus, lastMessage)
  }

  /** Downloads CRL bytes from a URL with specified timeouts. */
  private suspend fun downloadCrlWithTimeout(url: String, options: X509VerificationOptions): ByteArray {
    return withContext(Dispatchers.IO) {
      withTimeout(options.connectTimeout + options.readTimeout.toLong()) {
        var connection: HttpURLConnection? = null
        try {
          connection = (URL(url).openConnection() as HttpURLConnection).apply {
            connectTimeout = options.connectTimeout
            readTimeout = options.readTimeout
            requestMethod = "GET"
            setRequestProperty("Accept", "application/pkix-crl, */*")
            instanceFollowRedirects = true
          }
          connection.connect()
          val responseCode = connection.responseCode

          if (responseCode == HttpURLConnection.HTTP_OK) {
            connection.inputStream.use { return@withTimeout it.readBytes() }
          } else {
            // Read error stream for details, ensure it's closed
            val errorDetails = connection.errorStream?.use { it.readBytes() }?.toString(Charsets.UTF_8) ?: "No error details"
            throw IOException("CRL download failed: HTTP $responseCode for URL $url. $errorDetails")
          }
        } finally {
          connection?.disconnect()
        }
      }
    }
  }

  /**
   * Extracts CRL Distribution Point URLs (HTTP/HTTPS only) from the certificate extension.
   * Uses BouncyCastle for robust ASN.1 parsing.
   */
  private fun extractCrlDistributionPoints(cert: X509Certificate): List<String> {
    val urls = mutableListOf<String>()
    try {
      val oid = Extension.cRLDistributionPoints.id // OID for CRL Distribution Points
      val extensionValue = cert.getExtensionValue(oid) ?: return emptyList() // Return empty if extension not present

      // The extension value is SEQUENCE (CRLDistPoints) wrapped in an OCTET STRING.
      // 1. Parse the outer OCTET STRING
      val derOctetString = ASN1Primitive.fromByteArray(extensionValue) as? DEROctetString
        ?: return emptyList()

      // 2. Get the inner bytes (the actual CRLDistPoint sequence)
      val crlDpBytes = derOctetString.octets

      // 3. Parse the inner bytes specifically as CRLDistPoint
      val asn1DistPoint = CRLDistPoint.getInstance(ASN1Primitive.fromByteArray(crlDpBytes))
        ?: return emptyList()

      // 4. Iterate through the distribution points
      for (dp: DistributionPoint in asn1DistPoint.distributionPoints) {
        val dpName = dp.distributionPoint ?: continue

        if (dpName.type == DistributionPointName.FULL_NAME) {
          val generalNames = GeneralNames.getInstance(dpName.name)
          for (name: GeneralName in generalNames.names) {
            if (name.tagNo == GeneralName.uniformResourceIdentifier) {
              // Extract the URI string
              val uri = DERIA5String.getInstance(name.name).string
              if (uri.startsWith("http://", ignoreCase = true) || uri.startsWith("https://", ignoreCase = true)) {
                urls.add(uri)
              }
            }
          }
        }
      }
    } catch (e: Exception) {
      // Catch potential exceptions during parsing (e.g., ClassCastException, IOException)
      Log.e(TAG, "Error parsing CRL DP for cert: ${cert.subjectX500Principal}", e)
    }
    return urls.distinct() // Return unique URLs found
  }
}
