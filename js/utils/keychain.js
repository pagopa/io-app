/**
 * Utility methods to interact with the Keychain.
 *
 * @flow
 */

import * as Keychain from 'react-native-keychain'

import { APP_NAME } from './constants'

const PIN_KEY = 'PIN'

// Save the PIN in the Keychain
export async function setPin(pin: string): Promise<void> {
  await Keychain.setGenericPassword(PIN_KEY, pin, APP_NAME)
}

// Get the PIN from the Keychain
export async function getPin(): Promise<string> {
  const credentials = await Keychain.getGenericPassword({ service: APP_NAME })
  if (typeof credentials !== 'boolean') {
    return credentials.password
  } else {
    // Throw error if PIN doesn't exist
    throw Error('No PIN found')
  }
}
