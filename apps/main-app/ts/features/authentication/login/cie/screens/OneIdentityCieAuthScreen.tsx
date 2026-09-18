import { useState } from "react";

import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { OneIdentityCieAuthenticationWebView } from "../components/OneIdentityCieAuthenticationWebView";
import { OneIdentityCieAuthorizationWebView } from "../components/OneIdentityCieAuthorizationWebView";
import { OneIdentityCieCardReader } from "../components/OneIdentityCieCardReader";

export type OneIdentityCieAuthRouteParams = {
  pin: string;
};

type OneIdentityCieAuthScreenProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "CIE_AUTH_SCREEN"
>;

export const OneIdentityCieAuthScreen = ({
  route
}: OneIdentityCieAuthScreenProps) => {
  const { pin } = route.params;

  const [authenticationUrl, setAuthenticationUrl] = useState<string>();
  const [authorizationUrl, setAuthorizationUrl] = useState<string>();

  /**
   * Step 1: Display the authentication webview to obtain the authentication URL.
   */
  if (authenticationUrl === undefined) {
    return (
      <OneIdentityCieAuthenticationWebView
        onAuthenticationUrlReceived={setAuthenticationUrl}
      />
    );
  }

  /**
   * Step 2: Display the CIE card reader to obtain the authorization URL.
   */
  if (authorizationUrl === undefined) {
    return (
      <OneIdentityCieCardReader
        authenticationUrl={authenticationUrl}
        onAuthorizationUrlReceived={setAuthorizationUrl}
        pin={pin}
      />
    );
  }

  /**
   * Step 3: Display the authorization webview to complete the login flow
   */
  return (
    <OneIdentityCieAuthorizationWebView authorizationUrl={authorizationUrl} />
  );
};
