import React from "react";
import I18n from "../../../../i18n";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";

export type ItwIssuanceCredentialNotFoundNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_CREDENTIAL_NOT_FOUND"
>;

export const ItwIssuanceCredentialNotFoundScreen = ({ route }: Props) => {
  const { credentialType } = route.params;
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const navigation = useIONavigation();
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const navigateToCredential = () => {
    machineRef.send({
      type: "select-credential",
      credentialType,
      skipNavigation: true
    });
  };

  const handleClose = () => {
    navigation.pop();
  };

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
