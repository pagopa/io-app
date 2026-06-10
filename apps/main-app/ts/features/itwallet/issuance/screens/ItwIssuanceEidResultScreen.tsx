import { useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useEffect } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks.ts";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import {
  trackAddFirstCredential,
  trackBackToWallet,
  trackItwCredentialReissuingFailed
} from "../analytics";
import {
  getMixPanelCredential,
  toSurveyAuthMethod
} from "../../analytics/utils";
import ItwActivationSuccessFeedbackBanner from "../../common/components/ItwActivationSuccessFeedbackBanner";
import { ItwReissuanceFeedbackBanner } from "../../common/components/ItwReissuanceFeedbackBanner.tsx";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useItwCredentialName } from "../../common/hooks/useItwCredentialName";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils.ts";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import {
  selectCredentialType,
  selectIdentification,
  selectIsLoading,
  selectIssuanceMode,
  selectUpgradeFailedCredentials
} from "../../machine/eid/selectors";

export const ItwIssuanceEidResultScreen = () => {
  const route = useRoute();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const credentialMachineRef =
    ItwCredentialIssuanceMachineContext.useActorRef();
  const issuanceMode =
    ItwEidIssuanceMachineContext.useSelector(selectIssuanceMode);
  const failedCredentials = ItwEidIssuanceMachineContext.useSelector(
    selectUpgradeFailedCredentials
  );
  const credentialType =
    ItwEidIssuanceMachineContext.useSelector(selectCredentialType);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const isEidMachineLoading =
    ItwEidIssuanceMachineContext.useSelector(selectIsLoading);

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

  useEffect(() => {
    // When the EID issuance was triggered by a credential request, the credential
    // issuance must not start prematurely while the EID machine is still loading.
    if (credentialType && !isEidMachineLoading) {
      credentialMachineRef.send({
        type: "select-credential",
        mode: "issuance",
        credentialType
      });
    }
  }, [credentialType, credentialMachineRef, isEidMachineLoading]);

  if (credentialType) {
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
    <ItwIssuanceEidIssuanceResultContent
      onAddCredential={handleAddCredential}
      onBackToWallet={() => {
        handleBackToWallet();
        trackBackToWallet({ exit_page: route.name, credential: "ITW_ID_V2" });
      }}
    />
  );
};

type ItwIssuanceEidIssuanceResultContentProps = {
  onAddCredential: () => void;
  onBackToWallet: () => void;
};

const ItwIssuanceEidIssuanceResultContent = ({
  onAddCredential,
  onBackToWallet
}: ItwIssuanceEidIssuanceResultContentProps) => {
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);

  const docStatus = isWalletValid ? "active" : "not_active";
  const authMethod = toSurveyAuthMethod(identification);

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("features.itWallet.issuance.eidResult.success.title")}
      subtitle={I18n.t("features.itWallet.issuance.eidResult.success.subtitle")}
      action={{
        label: I18n.t(
          "features.itWallet.issuance.eidResult.success.primaryAction"
        ),
        onPress: onAddCredential
      }}
      secondaryAction={{
        label: I18n.t(
          "features.itWallet.issuance.eidResult.success.secondaryAction"
        ),
        onPress: onBackToWallet
      }}
    >
      <ItwActivationSuccessFeedbackBanner
        docStatus={docStatus}
        authMethod={authMethod}
      />
    </OperationResultScreenContent>
  );
};

const ItwIssuanceEidUpgradeResultContent = ({
  failedCredentials
}: {
  failedCredentials: ReadonlyArray<CredentialMetadata>;
}) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const failedCredentialName = useItwCredentialName(
    failedCredentials[0]?.credentialType
  );

  const handleBackToWallet = () => machineRef.send({ type: "go-to-wallet" });

  if (isLoading) {
    return (
      <LoadingScreenContent
        title={I18n.t("features.itWallet.issuance.upgrade.loading.title")}
        subtitle={I18n.t("features.itWallet.issuance.upgrade.loading.subtitle")}
      />
    );
  }

  if (failedCredentials.length > 0) {
    const title =
      failedCredentials.length === 1
        ? I18n.t("features.itWallet.issuance.upgrade.failure.title", {
            credentialName: failedCredentialName
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
    >
      <ItwActivationSuccessFeedbackBanner
        docStatus={isWalletValid ? "active" : "not_active"}
        authMethod={toSurveyAuthMethod(identification)}
      />
    </OperationResultScreenContent>
  );
};

const ItwIssuanceEidReissuanceResultContent = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const route = useRoute();

  if (isLoading) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
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
  <LoadingScreenContent title={I18n.t("global.genericWaiting")} />
);
