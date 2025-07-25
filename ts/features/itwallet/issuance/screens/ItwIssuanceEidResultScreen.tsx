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
  selectIssuanceMode
} from "../../machine/eid/selectors";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";

export const ItwIssuanceEidResultScreen = () => {
  const route = useRoute();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const issuanceMode =
    ItwEidIssuanceMachineContext.useSelector(selectIssuanceMode);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const handleAddCredential = () => {
    machineRef.send({ type: "add-new-credential" });
    trackAddFirstCredential();
  };

  const handleBackToWallet = () => machineRef.send({ type: "go-to-wallet" });

  if (isLoading) {
    return (
      <LoadingScreenContent
        contentTitle={I18n.t(
          "features.itWallet.issuance.eidResult.upgrading.title"
        )}
      >
        <Body>
          {I18n.t("features.itWallet.issuance.eidResult.upgrading.subtitle")}
        </Body>
      </LoadingScreenContent>
    );
  }

  switch (issuanceMode) {
    case "upgrading":
      return (
        <OperationResultScreenContent
          pictogram="success"
          title={I18n.t(
            "features.itWallet.issuance.eidResult.upgradeSuccess.title"
          )}
          subtitle={I18n.t(
            "features.itWallet.issuance.eidResult.upgradeSuccess.subtitle"
          )}
          action={{
            label: I18n.t(
              "features.itWallet.issuance.eidResult.upgradeSuccess.primaryAction"
            ),
            onPress: handleBackToWallet
          }}
        />
      );
    default:
      return (
        <OperationResultScreenContent
          pictogram="success"
          title={I18n.t("features.itWallet.issuance.eidResult.success.title")}
          subtitle={I18n.t(
            "features.itWallet.issuance.eidResult.success.subtitle"
          )}
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
  }
};
