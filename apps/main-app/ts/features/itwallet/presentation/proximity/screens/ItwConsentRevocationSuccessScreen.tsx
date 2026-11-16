import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton";
import { useItwCredentialName } from "../../../common/hooks/useItwCredentialName";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";

export type ItwConsentRevocationSuccessScreenNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CONSENT_REVOCATION_SUCCESS"
>;

/** Confirms the last or bulk revocation and closes the consent-management flow. */
export const ItwConsentRevocationSuccessScreen = ({
  navigation,
  route
}: Props) => {
  const { credentialType } = route.params;
  const credentialName = useItwCredentialName(credentialType);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: () =>
          navigation.popTo(ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL, {
            credentialType
          })
      }}
      pictogram="success"
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.consentManagement.revocationSuccess.subtitle"
      )}
      title={I18n.t(
        "features.itWallet.presentation.proximity.consentManagement.revocationSuccess.title",
        { credentialName }
      )}
    />
  );
};
