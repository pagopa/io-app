import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useEffect } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType,
  CredentialIssuanceFailureTypeEnum
} from "../../machine/credential/failure";
import {
  selectCredential,
  selectFailureOption
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import {
  CREDENTIALS_MAP,
  trackAddCredentialTimeout,
  trackWalletCreationFailed
} from "../../analytics";

export const ItwIssuanceCredentialFailureScreen = () => {
  const failureOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectFailureOption);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return pipe(
    failureOption,
    O.fold(
      () => (
        <ContentView
          failure={{ type: CredentialIssuanceFailureTypeEnum.GENERIC }}
        />
      ),
      type => <ContentView failure={type} />
    )
  );
};

type ContentViewProps = { failure: CredentialIssuanceFailure };

/**
 * Renders the content of the screen
 */
const ContentView = ({ failure }: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const storedCredential =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredential);

  const closeIssuance = (cta_id: string) => {
    machineRef.send({ type: "close" });
    trackWalletCreationFailed({
      reason: failure.type,
      cta_category: "custom_2",
      cta_id
    });
  };
  const retryIssuance = (cta_id: string) => {
    machineRef.send({ type: "retry" });
    trackWalletCreationFailed({
      reason: failure.type,
      cta_category: "custom_1",
      cta_id
    });
  };

  useDebugInfo({
    failure
  });

  const resultScreensMap: Record<
    CredentialIssuanceFailureType,
    OperationResultScreenContentProps
  > = {
    GENERIC: {
      title: I18n.t("features.itWallet.issuance.genericError.title"),
      subtitle: I18n.t("features.itWallet.issuance.genericError.body"),
      pictogram: "workInProgress",
      action: {
        label: I18n.t("features.itWallet.issuance.genericError.primaryAction"),
        onPress: () =>
          retryIssuance(
            I18n.t("features.itWallet.issuance.genericError.primaryAction")
          )
      },
      secondaryAction: {
        label: I18n.t(
          "features.itWallet.issuance.genericError.secondaryAction"
        ),
        onPress: () =>
          closeIssuance(
            I18n.t("features.itWallet.issuance.genericError.secondaryAction")
          )
      }
    },
    NOT_ENTITLED: {
      title: I18n.t(
        "features.itWallet.issuance.notEntitledCredentialError.title"
      ),
      subtitle: I18n.t(
        "features.itWallet.issuance.notEntitledCredentialError.body"
      ),
      pictogram: "accessDenied",
      action: {
        label: I18n.t(
          "features.itWallet.issuance.notEntitledCredentialError.primaryAction"
        ),
        onPress: () =>
          closeIssuance(
            I18n.t(
              "features.itWallet.issuance.notEntitledCredentialError.primaryAction"
            )
          )
      }
    }
  };

  useEffect(() => {
    if (storedCredential) {
      trackAddCredentialTimeout({
        reason: failure.type,
        credential: CREDENTIALS_MAP[storedCredential.credentialType]
      });
    }
  }, [failure.type, storedCredential]);

  const resultScreenProps = resultScreensMap[failure.type];
  return <OperationResultScreenContent {...resultScreenProps} />;
};
