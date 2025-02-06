// TODO: This will be imported from io-react-native-wallet, when the type will be available
// Remote presentation QR code data
export type ItwRemoteRequestPayload = {
  clientId: string;
  requestUri: string;
  state: string;
  requestUriMethod?: string;
};
