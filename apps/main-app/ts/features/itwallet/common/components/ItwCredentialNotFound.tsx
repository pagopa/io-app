import I18n from "i18next";
import { useEffect } from "react";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import { useItwDisableGestureNavigation } from "../hooks/useItwDisableGestureNavigation";

const ItwCredentialNotFound = ({
  credentialType
}: {
  credentialType: string;
}) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const navigation = useIONavigation();

  // Disable the back gesture navigation and the hardware back button
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const navigateToCredential = () => {
    machineRef.send({
      type: "select-credential",
      mode: "issuance",
      credentialType
    });
  };

  const handleClose = () => {
    navigation.pop();
  };

  // Since this component could be used on a screen where the header is visible, we hide it.
  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.continue"),
        accessibilityLabel: I18n.t("global.buttons.continue"),
        onPress: navigateToCredential
      }}
      pictogram="cie"
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        onPress: handleClose
      }}
      subtitle={I18n.t(
        "features.itWallet.issuance.credentialNotFound.subtitle"
      )}
      title={I18n.t("features.itWallet.issuance.credentialNotFound.title")}
    />
  );
};

export default ItwCredentialNotFound;
