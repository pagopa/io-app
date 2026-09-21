package expo.modules.nfcantennainfo

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class AvailableNfcAntennaRecord(
  @Field val locationX: Int = 0,
  @Field val locationY: Int = 0
) : Record

class NfcAntennaInfoRecord(
  @Field val deviceWidth: Int = 0,
  @Field val deviceHeight: Int = 0,
  @Field val isDeviceFoldable: Boolean = false,
  @Field val availableNfcAntennas: List<AvailableNfcAntennaRecord> = emptyList()
) : Record
