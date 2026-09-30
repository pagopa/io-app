import { useCallback, useState } from "react";

import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { OneIdentityCieAuthenticationWebView } from "../components/OneIdentityCieAuthenticationWebView";
import { OneIdentityCieAuthorizationWebView } from "../components/OneIdentityCieAuthorizationWebView";
import { OneIdentityCieCardReader } from "../components/OneIdentityCieCardReader";

export type OneIdentityCieAuthRouteParams = {
  pin: string;
};

type AuthState =
  | { authenticationUrl: string; status: "02_reading_card_data" }
  | { authorizationUrl: string; status: "03_user_authentication" }
  | { status: "01_authentication_url_retrieval" };

type OneIdentityCieAuthScreenProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "CIE_AUTH_SCREEN"
>;

export const OneIdentityCieAuthScreen = ({
  route
}: OneIdentityCieAuthScreenProps) => {
  const { pin } = route.params;

  const [authState, setAuthState] = useState<AuthState>({
    status: "01_authentication_url_retrieval"
  });

  const handleAuthenticationUrlReceived = useCallback(
    (authenticationUrl: string) => {
      setAuthState({ status: "02_reading_card_data", authenticationUrl });
    },
    []
  );

  const handleAuthorizationUrlReceived = useCallback(
    (authorizationUrl: string) => {
      setAuthState({ status: "03_user_authentication", authorizationUrl });
    },
    []
  );

  /**
   * Step 1: Display the authentication webview to obtain the authentication
   * URL.
   */
  if (authState.status === "01_authentication_url_retrieval") {
    return (
      <OneIdentityCieAuthenticationWebView
        onAuthenticationUrlReceived={handleAuthenticationUrlReceived}
      />
    );
  }

  /** Step 2: Display the CIE card reader to obtain the authorization URL. */
  if (authState.status === "02_reading_card_data") {
    return (
      <OneIdentityCieCardReader
        authenticationUrl={authState.authenticationUrl}
        onAuthorizationUrlReceived={handleAuthorizationUrlReceived}
        pin={pin}
      />
    );
  }

  /** Step 3: Display the authorization webview to complete the login flow */
  return (
    <OneIdentityCieAuthorizationWebView
      authorizationUrl={authState.authorizationUrl}
    />
  );
};
