type OneIdentityCieCardReaderProps = {
  authenticationUrl: string;
  onAuthorizationUrlReceived: (authorizationUrl: string) => void;
  pin: string;
};

export const OneIdentityCieCardReader = (
  _props: OneIdentityCieCardReaderProps
) => null;
