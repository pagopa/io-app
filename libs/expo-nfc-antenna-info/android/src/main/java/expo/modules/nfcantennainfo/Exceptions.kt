package expo.modules.nfcantennainfo

import expo.modules.kotlin.exception.CodedException

class NfcUnsupportedDeviceException :
  CodedException("This Android version is not supported")

class NfcAdapterUnavailableException :
  CodedException("NFC adapter not available")

class NfcAntennaInfoUnavailableException :
  CodedException("NFC antenna info not available")
