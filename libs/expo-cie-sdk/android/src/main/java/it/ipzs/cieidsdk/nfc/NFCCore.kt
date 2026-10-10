package it.ipzs.cieidsdk.nfc

import android.content.Context
import android.content.Intent
import android.nfc.NfcAdapter
import android.nfc.NfcManager
import android.provider.Settings

internal object NFCCore {

    private var nfcAdapter: NfcAdapter? = null

    fun init(context: Context) {
        val nfcManager = context.applicationContext.getSystemService(Context.NFC_SERVICE) as NfcManager
        nfcAdapter = nfcManager.defaultAdapter
    }

    /**
    Check if device has NFC supports
     */
    fun hasDeviceNFC(): Boolean = nfcAdapter != null

    /**
     *  Check if NFC is enabled on Device
     */
    fun isNFCEnabled() : Boolean = hasDeviceNFC() && nfcAdapter!!.isEnabled

    /**
    Open NFC Settings PAge
     */
    fun enableNFC(context : Context) {
        context.startActivity(Intent(Settings.ACTION_NFC_SETTINGS))
    }

}