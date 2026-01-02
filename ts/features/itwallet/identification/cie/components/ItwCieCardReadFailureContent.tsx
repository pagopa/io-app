import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { Linking } from "react-native";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
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
import {
  CieCardReadingFailureReason,
  ItwFlow
} from "../../../analytics/utils/analyticsTypes";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";
import { CieManagerFailure, CieManagerState } from "../hooks/useCieManager";
import { isNfcError } from "../utils/error";
import {
  CieCardReadContent,
  CieCardReadContentProps
} from "../../../../common/components/cie/CieCardReadContent.tsx";

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

  // Display failure information for debug
  useDebugInfo({ failure });

  // Track error on mount
  useEffect(() => trackError(failure, isL3, progress));

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
      case "NOT_A_CIE":
        return (
          <CieCardReadContent
            title={I18n.t(
              `features.itWallet.identification.cie.failure.wrongCard.title`
            )}
            subtitle={I18n.t(
              `features.itWallet.identification.cie.failure.wrongCard.subtitle`
            )}
            pictogram="cardQuestion"
            primaryAction={retryAction}
            secondaryAction={closeAction}
          />
        );
      case "TAG_LOST":
        return (
          <CieCardReadContent
            title={I18n.t(
              `features.itWallet.identification.cie.failure.tagLost.title`
            )}
            subtitle={I18n.t(
              `features.itWallet.identification.cie.failure.tagLost.subtitle`
            )}
            pictogram="empty"
            primaryAction={retryAction}
            secondaryAction={closeDialogAction}
          />
        );
      case "WRONG_PIN":
        if (failure.attemptsLeft > 1) {
          return (
            <CieCardReadContent
              title={I18n.t(
                `features.itWallet.identification.cie.failure.wrongPin1.title`
              )}
              subtitle={I18n.t(
                `features.itWallet.identification.cie.failure.wrongPin1.subtitle`
              )}
              pictogram="attention"
              primaryAction={closeAction}
              secondaryAction={{
                label: I18n.t(
                  `features.itWallet.identification.cie.failure.wrongPin1.secondaryAction`
                ),
                onPress: handlePinForgot
              }}
            />
          );
        } else {
          return (
            <CieCardReadContent
              title={I18n.t(
                `features.itWallet.identification.cie.failure.wrongPin2.title`
              )}
              subtitle={I18n.t(
                `features.itWallet.identification.cie.failure.wrongPin2.subtitle`
              )}
              pictogram="attention"
              primaryAction={closeDialogAction}
              secondaryAction={{
                label: I18n.t(
                  `features.itWallet.identification.cie.failure.wrongPin2.secondaryAction`
                ),
                onPress: handlePinForgot
              }}
            />
          );
        }
      case "CARD_BLOCKED":
        return (
          <CieCardReadContent
            title={I18n.t(
              `features.itWallet.identification.cie.failure.locked.title`
            )}
            subtitle={I18n.t(
              `features.itWallet.identification.cie.failure.locked.subtitle`
            )}
            pictogram="fatalError"
            primaryAction={closeAction}
            secondaryAction={{
              label: I18n.t(
                `features.itWallet.identification.cie.failure.locked.secondaryAction`
              ),
              onPress: handlePukForgot
            }}
          />
        );
      case "CERTIFICATE_EXPIRED":
      case "CERTIFICATE_REVOKED":
        return (
          <CieCardReadContent
            title={I18n.t(
              `features.itWallet.identification.cie.failure.expired.title`
            )}
            subtitle={I18n.t(
              `features.itWallet.identification.cie.failure.expired.subtitle`
            )}
            pictogram="attention"
            primaryAction={closeAction}
          />
        );
    }
  }

  return (
    <CieCardReadContent
      title={I18n.t(
        `features.itWallet.identification.cie.failure.generic.title`
      )}
      subtitle={I18n.t(
        `features.itWallet.identification.cie.failure.generic.subtitle`
      )}
      pictogram="umbrella"
      primaryAction={retryAction}
      secondaryAction={closeAction}
    />
  );
};

const trackError = (
  failure: CieManagerFailure,
  isL3: boolean,
  readProgress?: number
) => {
  const itw_flow: ItwFlow = isL3 ? "L3" : "L2";
  // readProgress is a number between 0 and 1, mixpanel needs a number between 0 and 100
  const progress = Number(((readProgress ?? 0) * 100).toFixed(0));

  if (isNfcError(failure)) {
    switch (failure.name) {
      case "TAG_LOST":
        trackItWalletErrorCardReading(itw_flow, progress);
        return;
      case "WRONG_PIN":
        if (failure.attemptsLeft > 1) {
          trackItWalletErrorPin(itw_flow, progress);
        } else {
          trackItWalletSecondErrorPin(itw_flow, progress);
        }
        return;
      case "CARD_BLOCKED":
        trackItWalletLastErrorPin(itw_flow, progress);
        return;
      case "CERTIFICATE_EXPIRED":
        trackItWalletCieCardVerifyFailure({
          itw_flow,
          reason: "CERTIFICATE_EXPIRED",
          cie_reading_progress: progress
        });
        return;
      case "CERTIFICATE_REVOKED":
        trackItWalletCieCardVerifyFailure({
          itw_flow,
          reason: "CERTIFICATE_REVOKED",
          cie_reading_progress: progress
        });
        return;
      case "NOT_A_CIE":
        trackItWalletCieCardReadingFailure({
          reason: CieCardReadingFailureReason.ON_TAG_DISCOVERED_NOT_CIE,
          itw_flow,
          cie_reading_progress: progress
        });
        return;
      case "GENERIC_ERROR":
      case "APDU_ERROR":
      case "NO_INTERNET_CONNECTION":
      case "AUTHENTICATION_ERROR":
        trackItWalletCieCardReadingFailure({
          reason: CieCardReadingFailureReason[failure.name],
          itw_flow,
          cie_reading_progress: progress
        });
        return;

      case "CANCELLED_BY_USER":
        trackItWalletCardReadingClose(progress);
        return;
    }
  }

  trackItWalletCieCardReadingUnexpectedFailure({
    reason: failure?.name ?? "UNEXPECTED_ERROR",
    cie_reading_progress: progress
  });
};
