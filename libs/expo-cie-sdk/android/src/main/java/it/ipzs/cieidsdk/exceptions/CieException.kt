package it.ipzs.cieidsdk.exceptions


internal open class CieException : Exception()

internal class BlockedPinException : CieException()

internal class NoCieException : CieException()

internal class PinNotValidException(val tentativi: Int) : CieException()

internal class PinInputNotValidException : CieException()