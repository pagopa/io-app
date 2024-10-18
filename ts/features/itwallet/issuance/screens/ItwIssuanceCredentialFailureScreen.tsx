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
  selectCredentialTypeOption,
  selectFailureOption
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import {
  CREDENTIALS_MAP,
  trackAddCredentialFailure,
  trackAddCredentialTimeout,
  trackCredentialNotEntitledFailure,
  trackItWalletDeferredIssuing,
  trackWalletCreationFailed
} from "../../analytics";
import ROUTES from "../../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";

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
  const credentialType = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );

  const closeIssuance = (cta_id: string) => {
    machineRef.send({ type: "close" });
    trackWalletCreationFailed({
      reason: failure.reason,
      cta_category: "custom_2",
      cta_id
    });
  };
  const retryIssuance = (cta_id: string) => {
    machineRef.send({ type: "retry" });
    trackWalletCreationFailed({
      reason: failure.reason,
      cta_category: "custom_1",
      cta_id
    });
  };
  const closeAsyncIssuance = () => {
    machineRef.send({
      type: "close",
      navigateTo: [ROUTES.MAIN, { screen: MESSAGES_ROUTES.MESSAGES_HOME }]
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
    },
    // NOTE: only the mDL supports the async flow, so this error message is specific to mDL
    ASYNC_ISSUANCE: {
      title: I18n.t("features.itWallet.issuance.asyncCredentialError.title"),
      subtitle: I18n.t("features.itWallet.issuance.asyncCredentialError.body"),
      pictogram: "pending",
      action: {
        label: I18n.t(
          "features.itWallet.issuance.asyncCredentialError.primaryAction"
        ),
        onPress: closeAsyncIssuance
      }
    }
  };

  useEffect(() => {
    if (O.isNone(credentialType)) {
      return;
    }

    if (failure.type === CredentialIssuanceFailureTypeEnum.ASYNC_ISSUANCE) {
      trackItWalletDeferredIssuing(CREDENTIALS_MAP[credentialType.value]);
      return;
    }

    if (failure.type === CredentialIssuanceFailureTypeEnum.NOT_ENTITLED) {
      trackCredentialNotEntitledFailure({
        reason: failure.reason,
        type: failure.type,
        credential: CREDENTIALS_MAP[credentialType.value]
      });
      return;
    }

    if (failure.type === CredentialIssuanceFailureTypeEnum.GENERIC) {
      trackAddCredentialFailure({
        reason: failure.reason,
        type: failure.type,
        credential: CREDENTIALS_MAP[credentialType.value]
      });
      return;
    }
    trackAddCredentialTimeout({
      reason: failure.reason,
      type: failure.type,
      credential: CREDENTIALS_MAP[credentialType.value]
    });
  }, [credentialType, failure]);

  const resultScreenProps = resultScreensMap[failure.type];
  return <OperationResultScreenContent {...resultScreenProps} />;
};
