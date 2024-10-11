import React, { useState } from "react";
import { View } from "react-native";
import { H2, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import ItwPrivacyWebViewComponent from "../components/ItwPrivacyWebViewComponent";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { trackOpenItwTosAccepted } from "../../analytics";

const IPZS_PRIVACY_URL = "http://io.italia.it/informativa-ipzs";

const ItwIpzsPrivacyScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const handleContinuePress = () => {
    trackOpenItwTosAccepted();
    machineRef.send({ type: "accept-ipzs-privacy" });
  };

  const onLoadEnd = () => {
    setIsLoading(false);
  };

  const onError = () => {
    onLoadEnd();
    machineRef.send({ type: "error-ipzs-privacy" });
  };

  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    supportRequest: true
  });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <View style={IOStyles.horizontalContentPadding}>
        <H2
          accessible={true}
          accessibilityRole="header"
          testID="screen-content-header-title"
        >
          {I18n.t("features.itWallet.ipzsPrivacy.title")}
        </H2>
        <VSpacer size={24} />
      </View>
      <ItwPrivacyWebViewComponent
        source={{
          uri: IPZS_PRIVACY_URL
        }}
        onAcceptTos={handleContinuePress}
        onLoadEnd={onLoadEnd}
        onError={onError}
      />
    </LoadingSpinnerOverlay>
  );
};

export default ItwIpzsPrivacyScreen;
