import React, { useEffect, useState } from "react";
import { Linking, View } from "react-native";
import { ButtonOutline, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../i18n";
import { selectIsCieIdEidRequest } from "../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

/**
 * This loading screen component displays a cancel button during CieID identification
 * to allow the user to abort the flow after the external browser was opened.
 */
export const ItwIssuanceLoadingScreen = () => {
  const [callbackUrlReceived, setCallbackUrlReceived] = useState(false);

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isCieIdEidRequest = ItwEidIssuanceMachineContext.useSelector(
    selectIsCieIdEidRequest
  );

  useEffect(() => {
    // eslint-disable-next-line curly
    if (!isCieIdEidRequest) return;

    const listener = Linking.addEventListener("url", ({ url }) =>
      setCallbackUrlReceived(!!url)
    );
    return () => {
      listener.remove();
    };
  }, [isCieIdEidRequest]);

  return (
    <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")}>
      {isCieIdEidRequest && !callbackUrlReceived && (
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
