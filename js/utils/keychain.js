// @flow

import * as Keychain from 'react-native-keychain'

export async function setPin(pin: string): Promise<void> {
  await Keychain.setGenericPassword('IO_PINCODE', pin)
}
