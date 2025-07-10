import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { useEffect } from "react";
import { SafeAreaView } from "react-native";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../../i18n";
import {
  trackItWalletCieCardReading,
  trackItWalletCieCardReadingSuccess
} from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  selectAuthUrlOption,
  selectCiePin
} from "../../../machine/eid/selectors";
import {
  ItwCieAuthenticationWebview,
  ItwCieAuthorizationWebview
} from "../../components/ItwCieWebview";
import {
  ItwCieMachineContext,
  ItwCieMachineProvider
} from "../../machine/cie/provider";
import {
  selectCurrentState,
  selectRedirectUrl
} from "../../machine/cie/selectors";
import { ItwCieCardReadProgressContent } from "../../components/ItwCieCardReadProgressContent";
import { ItwCieCardReadFailureContent } from "../../components/ItwCieCardReadFailureContent";

export const ItwCieCardReaderL3Screen = () => {
  const pin = ItwEidIssuanceMachineContext.useSelector(selectCiePin);
  const authUrl = ItwEidIssuanceMachineContext.useSelector(selectAuthUrlOption);

  useFocusEffect(trackItWalletCieCardReading);

  if (O.isNone(authUrl)) {
    return (
      <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
    );
  }

  return (
    <ItwCieMachineProvider pin={pin} authenticationUrl={authUrl.value}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenContent />
      </SafeAreaView>
    </ItwCieMachineProvider>
  );
};

/**
 * Renders the appropriate screen content based on the current CIE machine state.
 *
 * This component serves as a state-based renderer that:
 * - Listens for authentication redirect URL changes
 * - Sends completion events to the issuance machine when authentication is successful
 * - Handles different CIE identification states (waiting, reading, authorizing, completed, failure)
 */
const ScreenContent = () => {
  const issuanceActor = ItwEidIssuanceMachineContext.useActorRef();
  const currentCieState = ItwCieMachineContext.useSelector(selectCurrentState);
  const authRedirectUrl = ItwCieMachineContext.useSelector(selectRedirectUrl);

  /**
   * Listens for the authRedirectUrl to emit the  "user-identification-completed" event
   */
  useEffect(() => {
    if (authRedirectUrl !== undefined) {
      trackItWalletCieCardReadingSuccess();
      issuanceActor.send({
        type: "user-identification-completed",
        authRedirectUrl
      });
    }
  }, [issuanceActor, authRedirectUrl]);

  switch (currentCieState) {
    case "WaitingForUrl":
      return <ItwCieAuthenticationWebview />;
    case "ReadingCard":
      return <ItwCieCardReadProgressContent />;
    case "Authorizing":
      return <ItwCieAuthorizationWebview />;
    case "Failure":
      return <ItwCieCardReadFailureContent />;
    default:
      return (
        <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
      );
  }
};
