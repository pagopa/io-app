import { Body } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useEffect } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks.ts";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import {
  getMixPanelCredential,
  trackAddFirstCredential,
  trackBackToWallet,
  trackItwCredentialReissuingFailed
} from "../../analytics";
import { ItwReissuanceFeedbackBanner } from "../../common/components/ItwReissuanceFeedbackBanner.tsx";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors/index.ts";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import {
  selectIsLoading,
  selectIssuanceMode,
  selectUpgradeFailedCredentials
} from "../../machine/eid/selectors";

export const ItwIssuanceEidResultScreen = () => {
  const route = useRoute();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const issuanceMode =
    ItwEidIssuanceMachineContext.useSelector(selectIssuanceMode);
  const failedCredentials = ItwEidIssuanceMachineContext.useSelector(
    selectUpgradeFailedCredentials
  );
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);

  const itw_flow = isItwL3 ? "L3" : "reissuing_eID";

  useEffect(() => {
    if (failedCredentials.length > 0) {
      failedCredentials.forEach(failedCredential => {
        trackItwCredentialReissuingFailed({
          credential_failed: getMixPanelCredential(
            failedCredential.credentialType,
            isItwL3
          ),
          reason: failedCredential?.failure?.reason,
          type: failedCredential?.failure?.type ?? "",
          itw_flow
        });
      });
    }
  }, [failedCredentials, itw_flow, isItwL3]);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const handleAddCredential = () => {
    machineRef.send({ type: "add-new-credential" });
    trackAddFirstCredential();
  };

  const handleBackToWallet = () => machineRef.send({ type: "go-to-wallet" });

  if (issuanceMode === "credentialTriggered") {
    return <ItwIssuanceEidCredentialTriggerContent />;
  }

  if (issuanceMode === "upgrade") {
    return (
      <ItwIssuanceEidUpgradeResultContent
        failedCredentials={failedCredentials}
      />
    );
  }

  if (issuanceMode === "reissuance") {
    return <ItwIssuanceEidReissuanceResultContent />;
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

const ItwIssuanceEidUpgradeResultContent = ({
  failedCredentials
}: {
  failedCredentials: ReadonlyArray<StoredCredential>;
}) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);

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

const ItwIssuanceEidReissuanceResultContent = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const route = useRoute();

  if (isLoading) {
    return (
      <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
    );
  }

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t(
        "features.itWallet.issuance.eidResult.success.reissuance.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.issuance.eidResult.success.reissuance.subtitle"
      )}
      action={{
        label: I18n.t(
          "features.itWallet.issuance.eidResult.success.reissuance.primaryAction"
        ),
        onPress: () => {
          machineRef.send({ type: "go-to-wallet" });
          trackBackToWallet({
            exit_page: route.name,
            credential: "ITW_ID_V2"
          });
        }
      }}
    >
      <ItwReissuanceFeedbackBanner />
    </OperationResultScreenContent>
  );
};

/**
 * Transitional screen shown right after the eID issuance is completed.
 * Its only purpose is to display a loading indicator while navigation
 * proceeds toward the credential issuance flow.
 */
const ItwIssuanceEidCredentialTriggerContent = () => (
  <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
);
