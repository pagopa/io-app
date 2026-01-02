import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/Option";
import I18n from "i18next";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { useIOSelector } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { trackItWalletCieCardReading } from "../../analytics";
import { selectItwEnv } from "../../../common/store/selectors/environment";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectAuthUrlOption,
  selectCiePin
} from "../../../machine/eid/selectors";
import { ItwCieCardReadFailureContent } from "../components/ItwCieCardReadFailureContent";
import { ItwCieCardReadProgressContent } from "../components/ItwCieCardReadProgressContent";
import {
  ItwCieAuthenticationWebview,
  ItwCieAuthorizationWebview
} from "../components/ItwCieWebView";
import { useCieManager } from "../hooks/useCieManager";
import { WebViewError } from "../utils/error";

export const ItwCieAuthenticationScreen = () => {
  const issuanceActor = ItwEidIssuanceMachineContext.useActorRef();
  const authUrlOption =
    ItwEidIssuanceMachineContext.useSelector(selectAuthUrlOption);
  const pin = ItwEidIssuanceMachineContext.useSelector(selectCiePin);
  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );

  useFocusEffect(
    useCallback(() => trackItWalletCieCardReading(isL3 ? "L3" : "L2"), [isL3])
  );

  // Uri used for the CIE authentication flow
  const [serviceProviderUrl, setServiceProviderUrl] = useState<string>();
  // Uri for the final authorization redirect
  const [authorizationUrl, setAuthorizationUrl] = useState<string>();

  /**
   * Handles the completion of the authorization process sending to the
   * machine the obtained authorization URL.
   */
  const handleAuthorizationComplete = useCallback(
    (authRedirectUrl: string) => {
      issuanceActor.send({
        type: "user-identification-completed",
        authRedirectUrl
      });
    },
    [issuanceActor]
  );

  /**
   * If we encounter an error in the webview we need to send the error event to the machine
   * and to stop the issuance flow
   */
  const handleWebViewError = useCallback(
    (error: WebViewError) => {
      issuanceActor.send({ type: "error", scope: "cie-auth", error });
    },
    [issuanceActor]
  );

  if (pin === undefined || O.isNone(authUrlOption)) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  /**
   * Step 1: Display the authentication webview to fetch it the service provider url
   * to start the CIE authentication process
   */
  if (serviceProviderUrl === undefined) {
    return (
      <ItwCieAuthenticationWebview
        authenticationUrl={authUrlOption.value}
        onServiceProviderUrlReceived={setServiceProviderUrl}
        onWebViewError={handleWebViewError}
      />
    );
  }

  /**
   * Step 2: Once we received the service provider url, the CIE reading process starts
   * We display the progress or failure content based on the CIE manager state.
   * We do not have the authorization url yet.
   */
  if (authorizationUrl === undefined) {
    return (
      <CieManagerComponent
        pin={pin}
        serviceProviderUrl={serviceProviderUrl}
        onAuthorizationUrlReceived={setAuthorizationUrl}
      />
    );
  }

  /**
   * Step 3: Once we have the authorization url, we display the authorization webview
   * where the user will be able to complete the CIE authentication process.
   */
  return (
    <ItwCieAuthorizationWebview
      authorizationUrl={authorizationUrl}
      onAuthorizationComplete={handleAuthorizationComplete}
      onWebViewError={handleWebViewError}
    />
  );
};

type CieManagerComponentProps = {
  pin: string;
  serviceProviderUrl: string;
  onAuthorizationUrlReceived: (url: string) => void;
};

const CieManagerComponent = ({
  pin,
  serviceProviderUrl,
  onAuthorizationUrlReceived
}: CieManagerComponentProps) => {
  const env = useIOSelector(selectItwEnv);

  const { startReading, state } = useCieManager({
    useUat: env === "pre",
    onSuccess: onAuthorizationUrlReceived
  });

  const handleRetry = useCallback(() => {
    void startReading(pin, serviceProviderUrl);
  }, [pin, serviceProviderUrl, startReading]);

  /**
   * Starts the reading process as soon the component is mounted
   */
  useOnFirstRender(() => {
    void startReading(pin, serviceProviderUrl);
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {state.state === "failure" ? (
        <ItwCieCardReadFailureContent {...state} onRetry={handleRetry} />
      ) : (
        <ItwCieCardReadProgressContent {...state} />
      )}
    </SafeAreaView>
  );
};
