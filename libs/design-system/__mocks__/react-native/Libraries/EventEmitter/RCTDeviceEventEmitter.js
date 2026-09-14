/* globals jest */
/**
 * Mock for RCTDeviceEventEmitter in React Native 0.75+
 */

export default {
  addListener: jest.fn(),
  removeListeners: jest.fn(),
  emit: jest.fn()
}; 