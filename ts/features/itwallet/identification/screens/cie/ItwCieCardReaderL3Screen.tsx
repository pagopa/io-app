import { createRef, useEffect, useState } from "react";
import { Platform } from "react-native";
import WebView, { WebViewNavigation } from "react-native-webview";
import { useFocusEffect } from "@react-navigation/native";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { selectItwEnv } from "../../../common/store/selectors/environment";
import { trackItWalletCieCardReading } from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import {
  selectAuthUrlOption,
  selectCiePin,
  selectIsLoading
} from "../../../machine/eid/selectors";
import { getEnv } from "../../../common/utils/environment";

/**
 * To make sure the server recognizes the client as valid iPhone device (iOS only) we use a custom header
 * on Android it is not required.
 */
const defaultUserAgent = Platform.select({
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  default: undefined
});

export const ItwCieCardReaderL3Screen = () => {
  const navigation = useIONavigation();
  const env = useIOSelector(selectItwEnv);
  const { ISSUANCE_REDIRECT_URI } = getEnv(env);

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isMachineLoading =
    ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const ciePin = ItwEidIssuanceMachineContext.useSelector(selectCiePin);
  const cieAuthUrl =
    ItwEidIssuanceMachineContext.useSelector(selectAuthUrlOption);

  useFocusEffect(trackItWalletCieCardReading);

  return <></>;
};

type CiewWebViewProps = {
  uri: string;
  onAuthUrlChange: (url: string) => void;
};

/**
 * WebView component which loads a given URI and looks for authentication URLs.
 * It handles the navigation events to detect when the authentication URL is reached.
 * Once the URL is detected, it updates the state and calls the provided callback.
 * @param param0 - Props containing the URI and a callback for URL changes.
 * @returns A WebView component.
 */
const AuthenticationUrlWebView = ({
  uri,
  onAuthUrlChange
}: CiewWebViewProps) => {
  const webView = createRef<WebView>();
  const [authUrl, setAuthUrl] = useState<string>();

  useEffect(() => {
    if (authUrl) {
      onAuthUrlChange(authUrl);
    }
  }, [authUrl, onAuthUrlChange]);

  const handleShouldStartLoadWithRequest = ({ url }: WebViewNavigation) => {
    if (authUrl) {
      return false;
    }

    // on iOS when authnRequestString is present in the url, it means we have all stuffs to go on.
    if (
      url !== undefined &&
      Platform.OS === "ios" &&
      url.indexOf("authnRequestString") !== -1
    ) {
      // avoid redirect and follow the 'happy path'
      if (webView.current !== null) {
        setAuthUrl(url);
      }
      return false;
    }

    // Once the returned url contains the "OpenApp" string, then the authorization has been given
    if (url && url.indexOf("OpenApp") !== -1) {
      setAuthUrl(url);
      return false;
    }

    return true;
  };

  return (
    <WebView
      ref={webView}
      userAgent={defaultUserAgent}
      javaScriptEnabled={true}
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      source={{ uri }}
    />
  );
};
