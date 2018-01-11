import DeviceInfo from 'react-native-device-info'

const ROUTES = {
  HOME: 'HOME',
  PROFILE: 'PROFILE',
  DIGITAL_ADDRESS: 'DIGITAL_ADDRESS',
  TOPICS_SELECTION: 'TOPICS_SELECTION',
  SENDER_SELECTION: 'SENDER_SELECTION',
  NOT_SPID: 'NOT_SPID'
}

module.exports = {
  ROUTES,
  VERSION: DeviceInfo.getReadableVersion()
}
