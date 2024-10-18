import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { useEffect } from "react";
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

export const ItwIssuanceEidFailureScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const failureOption =
    ItwEidIssuanceMachineContext.useSelector(selectFailureOption);
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const closeIssuance = (errorConfig?: KoState) => {
    machineRef.send({ type: "close" });
    if (errorConfig) {
      trackWalletCreationFailed(errorConfig);
    }
  };

  const ContentView = ({ failure }: { failure: IssuanceFailure }) => {
    useDebugInfo({
      failure
    });

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
          onPress: () => closeIssuance() // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
        }
      },
      [IssuanceFailureType.ISSUER_GENERIC]: {
        title: I18n.t("features.itWallet.issuance.genericError.title"),
        subtitle: I18n.t("features.itWallet.issuance.genericError.body"),
        pictogram: "workInProgress",
        action: {
          label: I18n.t(
            "features.itWallet.issuance.genericError.primaryAction"
          ),
          onPress: () =>
            closeIssuance({
              reason: failure.reason,
              cta_category: "custom_1",
              cta_id: I18n.t(
                "features.itWallet.issuance.genericError.primaryAction"
              )
            }) // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
        },
        secondaryAction: {
          label: I18n.t(
            "features.itWallet.issuance.genericError.secondaryAction"
          ),
          onPress: () =>
            closeIssuance({
              reason: failure.reason,
              cta_category: "custom_2",
              cta_id: I18n.t(
                "features.itWallet.issuance.genericError.secondaryAction"
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
          onPress: () => closeIssuance() // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
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
            "features.itWallet.issuance.notMatchingIdentityError.secondaryAction"
          ),
          onPress: () => closeIssuance() // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
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
      if (
        failure.type === IssuanceFailureType.ISSUER_GENERIC &&
        identification
      ) {
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
    }, [failure]);

    const resultScreenProps =
      resultScreensMap[failure.type] ?? resultScreensMap.GENERIC;

    return <OperationResultScreenContent {...resultScreenProps} />;
  };

  return pipe(
    failureOption,
    O.fold(
      () => <ContentView failure={{ type: IssuanceFailureType.GENERIC }} />,
      failure => <ContentView failure={failure} />
    )
  );
};
