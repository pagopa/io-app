import { constNull } from "fp-ts/lib/function";
import { useCallback } from "react";
import { Linking } from "react-native";
import I18n from "i18next";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import {
  trackItWalletCiePinForgotten,
  trackItWalletCiePukForgotten
} from "../../../analytics";
import { ItwCieMachineContext } from "../machine/provider";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { selectFailure } from "../machine/selectors";
import { isNfcError } from "../utils/error";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";
import {
  CieCardReadContentProps,
  ItwCieCardReadContent
} from "./ItwCieCardReadContent";

/**
 * Renders the failure screen content based on the platforms and received failure
 */
export const ItwCieCardReadFailureContent = () => {
  const props = useFailureContentProps();
  return <ItwCieCardReadContent {...props} />;
};

const useFailureContentProps = (): CieCardReadContentProps => {
  const cieActor = ItwCieMachineContext.useActorRef();
  const issuanceActor = ItwEidIssuanceMachineContext.useActorRef();
  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const failure = ItwCieMachineContext.useSelector(selectFailure);

  // Display failure information for debug
  useDebugInfo({ failure });

  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: () => {
      issuanceActor.send({ type: "close" });
    }
  });

  const retryAction: CieCardReadContentProps["primaryAction"] = {
    label: I18n.t("global.buttons.retry"),
    onPress: () => cieActor.send({ type: "retry" })
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
        return {
          title: I18n.t(
            `features.itWallet.identification.cie.failure.wrongCard.title`
          ),
          subtitle: I18n.t(
            `features.itWallet.identification.cie.failure.wrongCard.subtitle`
          ),
          pictogram: "cardQuestion",
          primaryAction: retryAction,
          secondaryAction: closeAction
        };
      case "TAG_LOST":
        return {
          title: I18n.t(
            `features.itWallet.identification.cie.failure.tagLost.title`
          ),
          subtitle: I18n.t(
            `features.itWallet.identification.cie.failure.tagLost.subtitle`
          ),
          pictogram: "empty",
          primaryAction: retryAction,
          secondaryAction: closeDialogAction
        };
      case "WRONG_PIN":
        if (failure.attemptsLeft > 1) {
          return {
            title: I18n.t(
              `features.itWallet.identification.cie.failure.wrongPin1.title`
            ),
            subtitle: I18n.t(
              `features.itWallet.identification.cie.failure.wrongPin1.subtitle`
            ),
            pictogram: "attention",
            primaryAction: closeAction,
            secondaryAction: {
              label: I18n.t(
                `features.itWallet.identification.cie.failure.wrongPin1.secondaryAction`
              ),
              onPress: handlePinForgot
            }
          };
        } else {
          return {
            title: I18n.t(
              `features.itWallet.identification.cie.failure.wrongPin2.title`
            ),
            subtitle: I18n.t(
              `features.itWallet.identification.cie.failure.wrongPin2.subtitle`
            ),
            pictogram: "attention",
            primaryAction: closeDialogAction,
            secondaryAction: {
              label: I18n.t(
                `features.itWallet.identification.cie.failure.wrongPin2.secondaryAction`
              ),
              onPress: handlePinForgot
            }
          };
        }
      case "CARD_BLOCKED":
        return {
          title: I18n.t(
            `features.itWallet.identification.cie.failure.locked.title`
          ),
          subtitle: I18n.t(
            `features.itWallet.identification.cie.failure.locked.subtitle`
          ),
          pictogram: "fatalError",
          primaryAction: closeAction,
          secondaryAction: {
            label: I18n.t(
              `features.itWallet.identification.cie.failure.locked.secondaryAction`
            ),
            onPress: handlePukForgot
          }
        };
      case "CERTIFICATE_EXPIRED":
      case "CERTIFICATE_REVOKED":
        return {
          title: I18n.t(
            `features.itWallet.identification.cie.failure.expired.title`
          ),
          subtitle: I18n.t(
            `features.itWallet.identification.cie.failure.expired.subtitle`
          ),
          pictogram: "attention",
          primaryAction: closeAction
        };
      case "WEBVIEW_ERROR":
        return {
          title: I18n.t("features.itWallet.generic.error.title"),
          subtitle: I18n.t("features.itWallet.generic.error.body"),
          pictogram: "umbrella",
          primaryAction: closeAction
        };
    }
  }

  return {
    title: I18n.t(`features.itWallet.identification.cie.failure.generic.title`),
    subtitle: I18n.t(
      `features.itWallet.identification.cie.failure.generic.subtitle`
    ),
    pictogram: "umbrella",
    primaryAction: retryAction,
    secondaryAction: closeAction
  };
};
