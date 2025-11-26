import { InternalAuthAndMrtdResponse } from "@pagopa/io-react-native-cie";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { trackItWalletCieCardReading } from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { selectMrtdAuthorizationUrl } from "../../../machine/eid/selectors";
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
  const authorizationUrl = ItwEidIssuanceMachineContext.useSelector(
    selectMrtdAuthorizationUrl
  );

  useFocusEffect(useCallback(() => trackItWalletCieCardReading("L3"), []));

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
   * machine the data needed to build the validation URL, from which we will obtain the authorization URL.
   */
  if (authorizationUrl === undefined) {
    return (
      <CieManagerComponent
        can={can}
        challenge={challenge}
        onChallengeSigned={handleChallengeSigned}
      />
    );
  }

  /**
   * Step 2: Once we have the authorization url, we display the authorization webview
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

  if (state.state === "failure") {
    return <ItwCieCardReadFailureContent {...state} onRetry={handleRetry} />;
  }

  return <ItwCieCardReadProgressContent {...state} />;
};
