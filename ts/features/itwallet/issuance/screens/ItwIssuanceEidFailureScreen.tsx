import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import React, { useEffect } from "react";
import { IOToast } from "@pagopa/io-app-design-system";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import {
  IssuanceFailure,
  IssuanceFailureType
} from "../../machine/eid/failure";
import {
  selectFailureOption,
  selectIdentification
} from "../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import {
  KoState,
  trackIdNotMatch,
  trackItwIdRequestFailure,
  trackItwIdRequestUnexpected,
  trackItwUnsupportedDevice,
  trackWalletCreationFailed
} from "../../analytics";
import { openWebUrl } from "../../../../utils/url";

export const ItwIssuanceEidFailureScreen = () => {
  const failureOption =
    ItwEidIssuanceMachineContext.useSelector(selectFailureOption);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return pipe(
    failureOption,
    O.fold(constNull, failure => <ContentView failure={failure} />)
  );
};

type ContentViewProps = { failure: IssuanceFailure };

const ContentView = ({ failure }: ContentViewProps) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);

  useDebugInfo({
    failure
  });

  const closeIssuance = (errorConfig: KoState) => {
    machineRef.send({ type: "close" });
    trackWalletCreationFailed(errorConfig);
  };

  const retryIssuance = (errorConfig: KoState) => {
    machineRef.send({ type: "retry" });
    trackWalletCreationFailed(errorConfig);
  };

  const resultScreensMap: Record<
    IssuanceFailureType,
    OperationResultScreenContentProps
  > = {
    [IssuanceFailureType.GENERIC]: {
      title: I18n.t("features.itWallet.generic.error.title"),
      subtitle: I18n.t("features.itWallet.generic.error.body"),
      pictogram: "workInProgress",
      action: {
        label: I18n.t("global.buttons.close"),
        onPress: () =>
          closeIssuance({
            reason: failure.reason,
            cta_category: "custom_1",
            cta_id: I18n.t("global.buttons.close")
          }) // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
      }
    },
    [IssuanceFailureType.ISSUER_GENERIC]: {
      title: I18n.t("features.itWallet.issuance.genericError.title"),
      subtitle: I18n.t("features.itWallet.issuance.genericError.body"),
      pictogram: "umbrellaNew",
      action: {
        label: I18n.t("features.itWallet.issuance.genericError.primaryAction"),
        onPress: () =>
          closeIssuance({
            reason: failure.reason,
            cta_category: "custom_1",
            cta_id: I18n.t(
              "features.itWallet.issuance.genericError.primaryAction"
            )
          }) // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
      }
    },
    [IssuanceFailureType.UNSUPPORTED_DEVICE]: {
      title: I18n.t("features.itWallet.unsupportedDevice.error.title"),
      subtitle: I18n.t("features.itWallet.unsupportedDevice.error.body"),
      pictogram: "workInProgress",
      action: {
        label: I18n.t(
          "features.itWallet.unsupportedDevice.error.primaryAction"
        ),
        onPress: () =>
          closeIssuance({
            reason: failure.reason,
            cta_category: "custom_1",
            cta_id: I18n.t(
              "features.itWallet.unsupportedDevice.error.primaryAction"
            )
          }) // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
      },
      secondaryAction: {
        label: I18n.t(
          "features.itWallet.unsupportedDevice.error.secondaryAction"
        ),
        onPress: () =>
          openWebUrl("https://io.italia.it/documenti-su-io/faq/#n1_12", () =>
            IOToast.error(I18n.t("global.jserror.title"))
          )
      }
    },
    [IssuanceFailureType.NOT_MATCHING_IDENTITY]: {
      title: I18n.t(
        "features.itWallet.issuance.notMatchingIdentityError.title"
      ),
      subtitle: I18n.t(
        "features.itWallet.issuance.notMatchingIdentityError.body"
      ),
      pictogram: "accessDenied",
      action: {
        label: I18n.t(
          "features.itWallet.issuance.notMatchingIdentityError.primaryAction"
        ),
        onPress: () =>
          retryIssuance({
            reason: failure.reason,
            cta_category: "custom_1",
            cta_id: I18n.t(
              "features.itWallet.issuance.notMatchingIdentityError.primaryAction"
            )
          }) // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
      },
      secondaryAction: {
        label: I18n.t(
          "features.itWallet.issuance.notMatchingIdentityError.secondaryAction"
        ),
        onPress: () =>
          closeIssuance({
            reason: failure.reason,
            cta_category: "custom_2",
            cta_id: I18n.t(
              "features.itWallet.issuance.notMatchingIdentityError.secondaryAction"
            )
          }) // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
      }
    },
    [IssuanceFailureType.WALLET_REVOCATION_GENERIC]: {
      title: I18n.t("features.itWallet.walletRevocation.failureScreen.title"),
      subtitle: I18n.t(
        "features.itWallet.walletRevocation.failureScreen.subtitle"
      ),
      pictogram: "umbrellaNew",
      action: {
        label: I18n.t("global.buttons.retry"),
        onPress: () => machineRef.send({ type: "revoke-wallet-instance" })
      },
      secondaryAction: {
        label: I18n.t("global.buttons.close"),
        onPress: () => machineRef.send({ type: "close" })
      }
    }
  };

  useEffect(() => {
    if (
      failure.type === IssuanceFailureType.NOT_MATCHING_IDENTITY &&
      identification
    ) {
      trackIdNotMatch(identification.mode);
    }

    if (failure.type === IssuanceFailureType.UNSUPPORTED_DEVICE) {
      trackItwUnsupportedDevice(failure);
    }

    if (failure.type === IssuanceFailureType.ISSUER_GENERIC && identification) {
      trackItwIdRequestFailure({
        ITW_ID_method: identification.mode,
        reason: failure.reason,
        type: failure.type
      });
    }

    if (failure.type === IssuanceFailureType.GENERIC) {
      trackItwIdRequestUnexpected({
        reason: failure.reason,
        type: failure.type
      });
    }
  }, [failure, identification]);

  const resultScreenProps =
    resultScreensMap[failure.type] ?? resultScreensMap.GENERIC;

  return <OperationResultScreenContent {...resultScreenProps} />;
};
