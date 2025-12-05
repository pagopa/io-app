import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { trackItWalletCieCardReading } from "../../../analytics";
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
import {
  ItwCieMachineContext,
  ItwCieMachineProvider
} from "../machine/provider";
import { selectCurrentState, selectRedirectUrl } from "../machine/selectors";

export const ItwCieCardReaderScreen = () => {
  const pin = ItwEidIssuanceMachineContext.useSelector(selectCiePin);
  const authUrl = ItwEidIssuanceMachineContext.useSelector(selectAuthUrlOption);
  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );

  useFocusEffect(
    useCallback(() => trackItWalletCieCardReading(isL3 ? "L3" : "L2"), [isL3])
  );

  if (O.isNone(authUrl)) {
    return (
      <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
    );
  }

  return (
    <ItwCieMachineProvider
      pin={pin}
      authenticationUrl={authUrl.value}
      isL3={isL3}
    >
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
