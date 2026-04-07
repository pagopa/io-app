import { useFocusEffect } from "@react-navigation/native";
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { useCallback } from "react";
import { Linking } from "react-native";

import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import {
  CieCardReadContent,
  CieCardReadContentProps
} from "../../../../common/components/cie/CieCardReadContent.tsx";
import { ItwFlow } from "../../../analytics/utils/types.ts";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";
import { type IdentificationContext } from "../../../machine/eid/context.ts";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectIdentification
} from "../../../machine/eid/selectors";
import {
  trackItWalletCardReadingClose,
  trackItWalletCieCardReadingFailure,
  trackItWalletCieCardReadingUnexpectedFailure,
  trackItWalletCieCardVerifyFailure,
  trackItWalletCiePinForgotten,
  trackItWalletCiePukForgotten,
  trackItWalletErrorCardReading,
  trackItWalletErrorPin,
  trackItWalletLastErrorPin,
  trackItWalletSecondErrorPin
} from "../../analytics";
import { CieCardReadingFailureReason } from "../../analytics/types";
import { CieManagerFailure, CieManagerState } from "../hooks/useCieManager";
import { isNfcError } from "../utils/error";

type ItwCieCardReadFailureContentProps = Extract<
  CieManagerState,
  { state: "failure" }
> & {
  /**
   * Handles the retry action for some failure cases.
   */
  onRetry: () => void;
};

/**
 * Renders the failure screen content based on the platforms and received failure
 */
export const ItwCieCardReadFailureContent = ({
  failure,
  progress,
  onRetry
}: ItwCieCardReadFailureContentProps) => {
  const issuanceActor = ItwEidIssuanceMachineContext.useActorRef();
  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);

  // Display failure information for debug
  useDebugInfo({ failure });

  // Track error on mount
  useFocusEffect(
    useCallback(
      () =>
        trackError({ failure, isL3, identification, readProgress: progress }),
      [failure, isL3, progress, identification]
    )
  );

  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: () => issuanceActor.send({ type: "close" })
  });

  const retryAction: CieCardReadContentProps["primaryAction"] = {
    label: I18n.t("global.buttons.retry"),
    onPress: onRetry
  };

  const closeDialogAction: CieCardReadContentProps["secondaryAction"] = {
    label: I18n.t("global.buttons.close"),
    onPress: dismissalDialog.show
  };

  const closeAction: CieCardReadContentProps["secondaryAction"] = {
    label: I18n.t("global.buttons.close"),
    onPress: () => issuanceActor.send({ type: "close" })
  };

  const handlePinForgot = useCallback(() => {
    trackItWalletCiePinForgotten(isL3 ? "L3" : "L2");
    Linking.openURL(
      "https://www.cartaidentita.interno.gov.it/info-utili/codici-di-sicurezza-pin-e-puk/"
    ).catch(constNull);
  }, [isL3]);

  const handlePukForgot = useCallback(() => {
    trackItWalletCiePukForgotten(isL3 ? "L3" : "L2");
    Linking.openURL(
      "https://www.cartaidentita.interno.gov.it/info-utili/recupero-puk/"
    ).catch(constNull);
  }, [isL3]);

  if (isNfcError(failure)) {
    switch (failure.name) {
      case "CERTIFICATE_EXPIRED":
      case "CERTIFICATE_REVOKED":
        return (
          <CieCardReadContent
            pictogram="attention"
            primaryAction={closeAction}
            subtitle={I18n.t(
              `features.itWallet.identification.cie.failure.expired.subtitle`
            )}
            title={I18n.t(
              `features.itWallet.identification.cie.failure.expired.title`
            )}
          />
        );
      case "NOT_A_CIE":
        return (
          <CieCardReadContent
            pictogram="cardQuestion"
            primaryAction={retryAction}
            secondaryAction={closeAction}
            subtitle={I18n.t(
              `features.itWallet.identification.cie.failure.wrongCard.subtitle`
            )}
            title={I18n.t(
              `features.itWallet.identification.cie.failure.wrongCard.title`
            )}
          />
        );
      case "TAG_LOST":
        return (
          <CieCardReadContent
            pictogram="empty"
            primaryAction={retryAction}
            secondaryAction={closeDialogAction}
            subtitle={I18n.t(
              `features.itWallet.identification.cie.failure.tagLost.subtitle`
            )}
            title={I18n.t(
              `features.itWallet.identification.cie.failure.tagLost.title`
            )}
          />
        );
      case "WRONG_PIN":
        if (failure.attemptsLeft > 1) {
          return (
            <CieCardReadContent
              pictogram="attention"
              primaryAction={closeAction}
              secondaryAction={{
                label: I18n.t(
                  `features.itWallet.identification.cie.failure.wrongPin1.secondaryAction`
                ),
                onPress: handlePinForgot
              }}
              subtitle={I18n.t(
                `features.itWallet.identification.cie.failure.wrongPin1.subtitle`
              )}
              title={I18n.t(
                `features.itWallet.identification.cie.failure.wrongPin1.title`
              )}
            />
          );
        } else {
          return (
            <CieCardReadContent
              pictogram="attention"
              primaryAction={closeDialogAction}
              secondaryAction={{
                label: I18n.t(
                  `features.itWallet.identification.cie.failure.wrongPin2.secondaryAction`
                ),
                onPress: handlePinForgot
              }}
              subtitle={I18n.t(
                `features.itWallet.identification.cie.failure.wrongPin2.subtitle`
              )}
              title={I18n.t(
                `features.itWallet.identification.cie.failure.wrongPin2.title`
              )}
            />
          );
        }
      case "CARD_BLOCKED":
        return (
          <CieCardReadContent
            pictogram="fatalError"
            primaryAction={closeAction}
            secondaryAction={{
              label: I18n.t(
                `features.itWallet.identification.cie.failure.locked.secondaryAction`
              ),
              onPress: handlePukForgot
            }}
            subtitle={I18n.t(
              `features.itWallet.identification.cie.failure.locked.subtitle`
            )}
            title={I18n.t(
              `features.itWallet.identification.cie.failure.locked.title`
            )}
          />
        );
    }
  }

  return (
    <CieCardReadContent
      pictogram="umbrella"
      primaryAction={retryAction}
      secondaryAction={closeAction}
      subtitle={I18n.t(
        `features.itWallet.identification.cie.failure.generic.subtitle`
      )}
      title={I18n.t(
        `features.itWallet.identification.cie.failure.generic.title`
      )}
    />
  );
};

type TrackErrorParams = {
  failure: CieManagerFailure;
  identification?: IdentificationContext;
  isL3: boolean;
  readProgress?: number;
};

const trackError = ({
  failure,
  isL3,
  readProgress,
  identification
  // eslint-disable-next-line complexity
}: TrackErrorParams) => {
  const itw_flow: ItwFlow = isL3 ? "L3" : "L2";
  // readProgress is a number between 0 and 1, mixpanel needs a number between 0 and 100
  const progress = Number(((readProgress ?? 0) * 100).toFixed(0));

  if (isNfcError(failure)) {
    switch (failure.name) {
      case "APDU_ERROR":
      case "AUTHENTICATION_ERROR":
      case "GENERIC_ERROR":
      case "NO_INTERNET_CONNECTION":
        trackItWalletCieCardReadingFailure({
          reason: CieCardReadingFailureReason[failure.name],
          itw_flow,
          cie_reading_progress: progress,
          ITW_ID_method: identification?.mode
        });
        return;
      case "CANCELLED_BY_USER":
        trackItWalletCardReadingClose({
          cie_reading_progress: progress,
          itw_flow,
          ITW_ID_method: identification?.mode
        });
        return;
      case "CARD_BLOCKED":
        trackItWalletLastErrorPin(itw_flow, progress);
        return;
      case "CERTIFICATE_EXPIRED":
        trackItWalletCieCardVerifyFailure({
          itw_flow,
          reason: "CERTIFICATE_EXPIRED",
          cie_reading_progress: progress,
          ITW_ID_method: identification?.mode
        });
        return;
      case "CERTIFICATE_REVOKED":
        trackItWalletCieCardVerifyFailure({
          itw_flow,
          reason: "CERTIFICATE_REVOKED",
          cie_reading_progress: progress,
          ITW_ID_method: identification?.mode
        });
        return;
      case "NOT_A_CIE":
        trackItWalletCieCardReadingFailure({
          reason: CieCardReadingFailureReason.ON_TAG_DISCOVERED_NOT_CIE,
          itw_flow,
          cie_reading_progress: progress,
          ITW_ID_method: identification?.mode
        });
        return;
      case "TAG_LOST":
        trackItWalletErrorCardReading({
          itw_flow,
          cie_reading_progress: progress,
          ITW_ID_method: identification?.mode
        });
        return;

      case "WRONG_PIN":
        if (failure.attemptsLeft > 1) {
          trackItWalletErrorPin(itw_flow, progress);
        } else {
          trackItWalletSecondErrorPin(itw_flow, progress);
        }
        return;
    }
  }

  trackItWalletCieCardReadingUnexpectedFailure({
    reason: failure?.name ?? "UNEXPECTED_ERROR",
    cie_reading_progress: progress,
    itw_flow,
    ITW_ID_method: identification?.mode
  });
};
