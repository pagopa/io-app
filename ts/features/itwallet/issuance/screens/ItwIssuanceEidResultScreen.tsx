import { useRoute } from "@react-navigation/native";
import { Body } from "@pagopa/io-app-design-system";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { trackAddFirstCredential, trackBackToWallet } from "../../analytics";
import {
  selectIsLoading,
  selectIssuanceMode,
  selectUpgradeFailedCredentials
} from "../../machine/eid/selectors";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";

export const ItwIssuanceEidResultScreen = () => {
  const route = useRoute();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const issuanceMode =
    ItwEidIssuanceMachineContext.useSelector(selectIssuanceMode);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const handleAddCredential = () => {
    machineRef.send({ type: "add-new-credential" });
    trackAddFirstCredential();
  };

  const handleBackToWallet = () => machineRef.send({ type: "go-to-wallet" });

  if (issuanceMode === "upgrading") {
    return <ItwIssuanceEidUpgradeResultContent />;
  }

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("features.itWallet.issuance.eidResult.success.title")}
      subtitle={I18n.t("features.itWallet.issuance.eidResult.success.subtitle")}
      action={{
        label: I18n.t(
          "features.itWallet.issuance.eidResult.success.primaryAction"
        ),
        onPress: handleAddCredential
      }}
      secondaryAction={{
        label: I18n.t(
          "features.itWallet.issuance.eidResult.success.secondaryAction"
        ),
        onPress: () => {
          handleBackToWallet();
          trackBackToWallet({
            exit_page: route.name,
            credential: "ITW_ID_V2"
          });
        }
      }}
    />
  );
};

const ItwIssuanceEidUpgradeResultContent = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const failedCredentials = ItwEidIssuanceMachineContext.useSelector(
    selectUpgradeFailedCredentials
  );

  const handleBackToWallet = () => machineRef.send({ type: "go-to-wallet" });

  if (isLoading) {
    return (
      <LoadingScreenContent
        contentTitle={I18n.t(
          "features.itWallet.issuance.upgrade.loading.title"
        )}
      >
        <Body style={{ textAlign: "center" }}>
          {I18n.t("features.itWallet.issuance.upgrade.loading.subtitle")}
        </Body>
      </LoadingScreenContent>
    );
  }

  if (failedCredentials.length > 0) {
    const title =
      failedCredentials.length === 1
        ? I18n.t("features.itWallet.issuance.upgrade.failure.title", {
            credentialName: getCredentialNameFromType(
              failedCredentials[0].credentialType
            )
          })
        : I18n.t("features.itWallet.issuance.upgrade.failure.titleMany");

    return (
      <OperationResultScreenContent
        pictogram="success"
        title={title}
        subtitle={I18n.t("features.itWallet.issuance.upgrade.failure.subtitle")}
        action={{
          label: I18n.t(
            "features.itWallet.issuance.upgrade.failure.primaryAction"
          ),
          onPress: handleBackToWallet
        }}
      />
    );
  }

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("features.itWallet.issuance.upgrade.success.title")}
      subtitle={I18n.t("features.itWallet.issuance.upgrade.success.subtitle")}
      action={{
        label: I18n.t(
          "features.itWallet.issuance.upgrade.success.primaryAction"
        ),
        onPress: handleBackToWallet
      }}
    />
  );
};
