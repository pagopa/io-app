import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { itwCredentialSelector } from "../../credentials/store/selectors";
import { useItwNavigation } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

/**
 * @deprecated This screen is related to the dismissed async issuance flow.
 * It is left here to handle old messages that a user might still have.
 */
export const ItwIssuanceCredentialAsyncContinuationScreen = () => {
  const credentialType = CredentialType.DRIVING_LICENSE;
  const navigation = useItwNavigation();
  const credential = useIOSelector(itwCredentialSelector(credentialType));

  const isCredentialValid =
    credential !== undefined && getCredentialStatus(credential) === "valid";

  if (isCredentialValid) {
    return (
      <OperationResultScreenContent
        action={{
          label: I18n.t(
            `features.itWallet.issuance.credentialAlreadyAdded.primaryAction`
          ),
          onPress: () =>
            navigation.replace(ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL, {
              credentialType
            })
        }}
        pictogram="itWallet"
        secondaryAction={{
          label: I18n.t("global.buttons.close"),
          onPress: () => navigation.popToTop()
        }}
        subtitle={I18n.t(
          `features.itWallet.issuance.credentialAlreadyAdded.body`
        )}
        title={I18n.t(
          `features.itWallet.issuance.credentialAlreadyAdded.title`
        )}
      />
    );
  }

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t(
          "features.itWallet.issuance.mdlMessageExpired.primaryAction"
        ),
        onPress: () => navigation.replace(ITW_ROUTES.ONBOARDING)
      }}
      pictogram="ended"
      secondaryAction={{
        label: I18n.t("global.buttons.notNow"),
        onPress: () => navigation.popToTop()
      }}
      subtitle={I18n.t("features.itWallet.issuance.mdlMessageExpired.subtitle")}
      title={I18n.t("features.itWallet.issuance.mdlMessageExpired.title")}
    />
  );
};
