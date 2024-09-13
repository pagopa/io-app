import React, { useEffect, useState } from "react";
import { Linking, View } from "react-native";
import {
  Body,
  ButtonLink,
  ContentWrapper,
  VSpacer
} from "@pagopa/io-app-design-system";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../i18n";
import { selectIsCieIdEidRequest } from "../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

const CieIdConnectionContent = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  return (
    <ContentWrapper>
      <VSpacer size={8} />
      <View>
        <Body style={{ textAlign: "center" }}>
          {I18n.t("features.itWallet.identification.loading.cieId.subtitle")}
        </Body>
        <VSpacer size={24} />
        <View style={{ alignSelf: "center" }}>
          <ButtonLink
            accessibilityLabel={I18n.t(
              "features.itWallet.identification.loading.cieId.cancel"
            )}
            label={I18n.t(
              "features.itWallet.identification.loading.cieId.cancel"
            )}
            onPress={() => machineRef.send({ type: "abort" })}
          />
        </View>
      </View>
    </ContentWrapper>
  );
};

/**
 * This loading screen component displays a cancel button during CieID identification
 * to allow the user to abort the flow after the external browser was opened.
 */
export const ItwIssuanceLoadingScreen = () => {
  const [callbackUrlReceived, setCallbackUrlReceived] = useState(false);

  const isCieIdEidRequest = ItwEidIssuanceMachineContext.useSelector(
    selectIsCieIdEidRequest
  );

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

  const isWaitingForCieIdIdentification =
    isCieIdEidRequest && !callbackUrlReceived;

  return (
    <LoadingScreenContent
      contentTitle={
        isWaitingForCieIdIdentification
          ? I18n.t("features.itWallet.identification.loading.cieId.title")
          : I18n.t("global.genericWaiting")
      }
    >
      {isWaitingForCieIdIdentification && <CieIdConnectionContent />}
    </LoadingScreenContent>
  );
};
