package it.ipzs.cieidsdk.ciekeystore

import java.security.Provider


internal class CieProvider : Provider(PROVIDER_NAME, 1.0, "Provider per cie") {

    companion object {
      const val PROVIDER_NAME = "CieProvider"
      const val KEYSTORE_TYPE = "CIE"
    }

    init {
        put("KeyStore.$KEYSTORE_TYPE", CieKeyStore::class.java.name)
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.Q) {
            put("Signature.NONEwithRSA", CieSignatureImpl.None::class.java.name)
        } else {
            put("Cipher.RSA/ECB/PKCS1Padding", Cipher::class.java.name)
        }
    }
}
