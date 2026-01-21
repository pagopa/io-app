import { InternalAuthAndMrtdResponse } from "@pagopa/io-react-native-cie";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { trackItWalletCieCardReading } from "../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  selectIdentification,
  selectMrtdCallbackUrl
} from "../../../machine/eid/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ItwCieCardReadFailureContent } from "../components/ItwCieCardReadFailureContent";
import { ItwCieCardReadProgressContent } from "../components/ItwCieCardReadProgressContent";
import { ItwCieAuthorizationWebview } from "../components/ItwCieWebView";
import { useCieManager } from "../hooks/useCieManager";
import { WebViewError } from "../utils/error";

export type ItwCieInternalAuthAndMrtdScreenParams = {
  /**
   * The CIE card CAN code (6 digits)
   */
  can: string;
  /**
   * The challenge to be signed with PACE.
   */
  challenge: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_IDENTIFICATION_CIE_INTERNAL_AUTH_MRTD_SCREEN"
>;

export const ItwCieInternalAuthAndMrtdScreen = ({ route }: Props) => {
  const { can, challenge } = route.params;
  const issuanceActor = ItwEidIssuanceMachineContext.useActorRef();
  const callbackUrl = ItwEidIssuanceMachineContext.useSelector(
    selectMrtdCallbackUrl
  );
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);

  useFocusEffect(
    useCallback(() => {
      trackItWalletCieCardReading({
        itw_flow: "L3",
        ITW_ID_method: identification?.mode
      });
    }, [identification])
  );

  /**
   * Handles the challenge signed event sending to the
   * machine the obtained data.
   */
  const handleChallengeSigned = useCallback(
    (data: InternalAuthAndMrtdResponse) => {
      issuanceActor.send({
        type: "mrtd-challenged-signed",
        data
      });
    },
    [issuanceActor]
  );

  /**
   * Handles the completion of the authorization process sending to the
   * machine the obtained authorization URL.
   */
  const handleAuthorizationComplete = useCallback(
    (authRedirectUrl: string) => {
      issuanceActor.send({
        type: "mrtd-pop-verification-completed",
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
      issuanceActor.send({ type: "error", scope: "cie-mrtd-pop", error });
    },
    [issuanceActor]
  );

  /**
   * Step 1: Start CIE MRTD with PACE reading process to sign the challenge and return to the
   * machine the data needed to build the validation URL, from which we will obtain the callback URL.
   */
  if (callbackUrl === undefined) {
    return (
      <CieManagerComponent
        can={can}
        challenge={challenge}
        onChallengeSigned={handleChallengeSigned}
      />
    );
  }

  /**
   * Step 2: Once the validation completes and we have the callback url, we use the webview to fetch it and complete
   * the CIE authentication process.
   */
  return (
    <ItwCieAuthorizationWebview
      authorizationUrl={callbackUrl}
      onAuthorizationComplete={handleAuthorizationComplete}
      onWebViewError={handleWebViewError}
    />
  );
};

type CieManagerComponentProps = {
  can: string;
  challenge: string;
  onChallengeSigned: (data: InternalAuthAndMrtdResponse) => void;
};

const CieManagerComponent = ({
  can,
  challenge,
  onChallengeSigned
}: CieManagerComponentProps) => {
  const { startInternalAuthAndMRTDReading, state } = useCieManager({
    onInternalAuthAndMRTDWithPaceSuccess: onChallengeSigned
  });

  const handleRetry = useCallback(() => {
    void startInternalAuthAndMRTDReading(can, challenge);
  }, [can, challenge, startInternalAuthAndMRTDReading]);

  /**
   * Starts the reading process as soon the component is mounted
   */
  useOnFirstRender(() => {
    void startInternalAuthAndMRTDReading(can, challenge);
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
