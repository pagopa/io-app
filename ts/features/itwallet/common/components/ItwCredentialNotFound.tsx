import { useEffect } from "react";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useItwDisableGestureNavigation } from "../hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";

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
      pictogram="cie"
      title={I18n.t("features.itWallet.issuance.credentialNotFound.title")}
      subtitle={I18n.t(
        "features.itWallet.issuance.credentialNotFound.subtitle"
      )}
      isHeaderVisible={false}
      action={{
        label: I18n.t("global.buttons.continue"),
        accessibilityLabel: I18n.t("global.buttons.continue"),
        onPress: navigateToCredential
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        onPress: handleClose
      }}
    />
  );
};

export default ItwCredentialNotFound;
