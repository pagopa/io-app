import React, { useEffect, useRef, useState } from "react";
import { AppStateStatus, Linking, View } from "react-native";
import { ButtonOutline, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../i18n";
import { selectIsCieIdEidRequest } from "../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { useIOSelector } from "../../../../store/hooks";
import { appStateSelector } from "../../../../store/reducers/appState";

/**
 * This loading screen component displays a cancel button during CieID identification
 * to allow the user to abort the flow after the external browser was opened.
 */
export const ItwIssuanceLoadingScreen = () => {
  const { appState } = useIOSelector(appStateSelector);

  const [callbackUrlReceived, setCallbackUrlReceived] = useState(false);
  const prevAppState = useRef<AppStateStatus>();

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isCieIdEidRequest = ItwEidIssuanceMachineContext.useSelector(
    selectIsCieIdEidRequest
  );

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    prevAppState.current = appState;
  }, [appState]);

  useEffect(() => {
    if (!isCieIdEidRequest) {
      return;
    }

    const listener = Linking.addEventListener("url", ({ url }) =>
      setCallbackUrlReceived(!!url)
    );
    return () => {
      listener.remove();
    };
  }, [isCieIdEidRequest]);

  // The button is only shown if the app has been in the background,
  // as aborting before the external browser is opened is not handled yet.
  // This heuristic is not 100% accurate because the user could manually put the app in the background
  // during the initial API calls in the flow, but they are usually quite fast.
  const shouldShowCancelButton =
    isCieIdEidRequest &&
    prevAppState.current === "background" &&
    !callbackUrlReceived;

  return (
    <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")}>
      {shouldShowCancelButton && (
        <View style={IOStyles.alignCenter}>
          <VSpacer size={16} />
          <ButtonOutline
            fullWidth
            accessibilityLabel={I18n.t("global.buttons.cancel")}
            label={I18n.t("global.buttons.cancel")}
            onPress={() => machineRef.send({ type: "abort" })}
          />
        </View>
      )}
    </LoadingScreenContent>
  );
};
