import { useIOToast } from "@pagopa/io-app-design-system";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { Linking } from "react-native";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useIOSelector } from "../../../../store/hooks";
import { generateDynamicUrlSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { DOCUMENTS_ON_IO_FAQ_12_URL_BODY } from "../../../../urls";
import { openWebUrl } from "../../../../utils/url";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { trackItwKoStateAction } from "../../analytics";
import { KoState } from "../../analytics/utils/types";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useItwFailureSupportModal } from "../../common/hooks/useItwFailureSupportModal";
import { ZendeskSubcategoryValue } from "../../common/hooks/useItwZendeskSupport";
import { serializeFailureReason } from "../../common/utils/itwStoreUtils";
import {
  IssuanceFailure,
  IssuanceFailureType
} from "../../machine/eid/failure";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectFailureOption,
  selectIdentification,
  selectIssuanceLevel
} from "../../machine/eid/selectors";
import { useEidEventsTracking } from "../hooks/useEidEventsTracking";

// Errors that allow a user to send a support request to Zendesk
const zendeskAssistanceErrors = [
  IssuanceFailureType.UNEXPECTED,
  IssuanceFailureType.WALLET_PROVIDER_GENERIC,
  IssuanceFailureType.UNSUPPORTED_DEVICE,
  IssuanceFailureType.HARDWARE_KEY_INVALID,
  IssuanceFailureType.PID_ANPR_CREDENTIAL_NOT_FOUND
];

const ASSERTION_FAILED_FAQ_URL =
  "https://assistenza.ioapp.it/hc/it/articles/43824826487953-Provo-ad-aggiungere-un-documento-al-Portafoglio-ma-ricevo-un-errore-dal-mio-dispositivo-Apple";

const PID_ANPR_MISMATCH_FAQ_URL =
  "https://assistenza.ioapp.it/hc/it/articles/40032473652881-Continuare-a-usare-Documenti-su-IO-senza-limitazioni-dopo-12-mesi";

const failureLinkMapper: Partial<Record<IssuanceFailureType, string>> = {
  [IssuanceFailureType.HARDWARE_KEY_INVALID]: ASSERTION_FAILED_FAQ_URL,
  [IssuanceFailureType.PID_ANPR_CREDENTIAL_NOT_FOUND]: PID_ANPR_MISMATCH_FAQ_URL
};

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
  const issuanceLevel =
    ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);
  const isL3Issuance = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const credential = isL3Issuance ? "ITW_PID" : "ITW_ID";

  const toast = useIOToast();

  const FAQ_URL = useIOSelector(state =>
    generateDynamicUrlSelector(
      state,
      "io_showcase",
      DOCUMENTS_ON_IO_FAQ_12_URL_BODY
    )
  );

  useDebugInfo({
    failure: serializeFailureReason(failure)
  });

  const supportModal = useItwFailureSupportModal({
    failure,
    supportChatEnabled: zendeskAssistanceErrors.includes(failure.type),
    zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI,
    supportLink: failureLinkMapper[failure.type]
  });

  const closeIssuance = (errorConfig: KoState) => {
    machineRef.send({ type: "close" });
    trackItwKoStateAction(errorConfig);
  };

  const supportModalAction = {
    label: I18n.t("features.itWallet.support.button"),
    onPress: supportModal.present
  };

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      switch (failure.type) {
        case IssuanceFailureType.CIE_NOT_MATCHING_AUTHENTICATION_IDENTITY:
          return {
            title: I18n.t(
              "features.itWallet.issuance.cieNotMatchingAuthenticationIdentityError.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.issuance.cieNotMatchingAuthenticationIdentityError.body"
            ),
            pictogram: "attention",
            action: {
              label: I18n.t("global.buttons.retry"),
              onPress: () => {
                trackItwKoStateAction({
                  reason: failure.reason,
                  cta_category: "custom_1",
                  cta_id: I18n.t("global.buttons.retry")
                });
                machineRef.send({ type: "retry" });
              }
            },
            secondaryAction: {
              label: I18n.t("global.buttons.close"),
              onPress: () =>
                closeIssuance({
                  reason: failure.reason,
                  cta_category: "custom_2",
                  cta_id: I18n.t("global.buttons.close")
                })
            }
          };
        case IssuanceFailureType.CIE_NOT_REGISTERED:
          return {
            title: I18n.t("features.itWallet.issuance.cieNotRegistered.title"),
            subtitle: I18n.t(
              "features.itWallet.issuance.cieNotRegistered.subtitle"
            ),
            pictogram: "attention",
            action: {
              label: I18n.t("global.buttons.findOutMore"),
              // TODO: replace with the actual URL when available
              onPress: () => Linking.openURL("https://ioapp.it/")
            },
            secondaryAction: {
              label: I18n.t("global.buttons.close"),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        case IssuanceFailureType.HARDWARE_KEY_INVALID:
          return {
            title: I18n.t("features.itWallet.hardwareKeyInvalid.error.title"),
            subtitle: I18n.t("features.itWallet.hardwareKeyInvalid.error.body"),
            pictogram: "fatalError",
            action: {
              label: I18n.t(
                "features.itWallet.hardwareKeyInvalid.error.primaryAction"
              ),
              onPress: () => supportModal.present()
            },
            secondaryAction: {
              label: I18n.t("global.buttons.close"),

              onPress: () =>
                closeIssuance({
                  reason: failure.reason,
                  cta_category: "custom_1",
                  cta_id: I18n.t("global.buttons.close")
                })
            }
          };
        case IssuanceFailureType.ISSUER_GENERIC:
          return {
            title: I18n.t("features.itWallet.issuance.genericError.title"),
            subtitle: I18n.t("features.itWallet.issuance.genericError.body"),
            pictogram: "umbrella",
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
            secondaryAction: supportModalAction
          };
        case IssuanceFailureType.MRTD_CHALLENGE_INIT_ERROR:
          return {
            title: I18n.t(
              "features.itWallet.issuance.mrtdChallengeInitError.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.issuance.mrtdChallengeInitError.subtitle"
            ),
            pictogram: "umbrella",
            action: {
              label: I18n.t("global.buttons.close"),
              onPress: () => machineRef.send({ type: "retry" }) // Retry event goes to UserIdentification
            },
            secondaryAction: {
              label: I18n.t("features.itWallet.support.button"),
              onPress: () => {
                supportModal.present();
              }
            }
          };
        case IssuanceFailureType.NOT_MATCHING_IDENTITY:
          return {
            title: I18n.t(
              "features.itWallet.issuance.notMatchingIdentityError.title"
            ),
            subtitle: I18n.t(
              isL3Issuance
                ? "features.itWallet.issuance.notMatchingIdentityError.body.l3"
                : "features.itWallet.issuance.notMatchingIdentityError.body.l2"
            ),
            pictogram: "attention",
            action: {
              label: I18n.t("global.buttons.retry"),
              onPress: () => {
                trackItwKoStateAction({
                  reason: failure.reason,
                  cta_category: "custom_1",
                  cta_id: I18n.t("global.buttons.retry")
                });
                machineRef.send({ type: "retry" });
              }
            },
            secondaryAction: {
              label: I18n.t("global.buttons.close"),
              onPress: () =>
                closeIssuance({
                  reason: failure.reason,
                  cta_category: "custom_2",
                  cta_id: I18n.t("global.buttons.close")
                })
            }
          };
        case IssuanceFailureType.PID_ANPR_CREDENTIAL_NOT_FOUND:
          return {
            title: I18n.t(
              "features.itWallet.issuance.pidAnprMismatchError.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.issuance.pidAnprMismatchError.body"
            ),
            pictogram: "fatalError",
            action: {
              label: I18n.t(
                "features.itWallet.issuance.pidAnprMismatchError.primaryAction"
              ),
              onPress: () => {
                trackItwKoStateAction({
                  reason: failure.reason,
                  cta_category: "custom_1",
                  cta_id: I18n.t(
                    "features.itWallet.issuance.pidAnprMismatchError.primaryAction"
                  )
                });
                supportModal.present();
              }
            },
            secondaryAction: {
              label: I18n.t("global.buttons.close"),
              onPress: () =>
                closeIssuance({
                  reason: failure.reason,
                  cta_category: "custom_2",
                  cta_id: I18n.t("global.buttons.close")
                })
            }
          };
        case IssuanceFailureType.UNEXPECTED: // Map unexpected errors with the previous GENERIC message
        case IssuanceFailureType.WALLET_PROVIDER_GENERIC:
          return {
            title: I18n.t("features.itWallet.generic.error.title"),
            subtitle: I18n.t("features.itWallet.generic.error.body"),
            pictogram: "workInProgress",
            action: supportModalAction, // This is a primary action because it includes the Zendesk support chat
            secondaryAction: {
              label: I18n.t("global.buttons.close"),
              onPress: () =>
                closeIssuance({
                  reason: failure.reason,
                  cta_category: "custom_1",
                  cta_id: I18n.t("global.buttons.close")
                }) // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
            }
          };
        case IssuanceFailureType.UNSUPPORTED_DEVICE:
          return {
            title: I18n.t("features.itWallet.unsupportedDevice.error.title"),
            subtitle: I18n.t(
              "features.itWallet.unsupportedDevice.error.subtitle",
              { faqUrl: FAQ_URL }
            ),
            onSubtitleLinkPress: url => {
              openWebUrl(url, () =>
                toast.error(I18n.t("global.jserror.title"))
              );
            },
            pictogram: "workInProgress",
            action: supportModalAction,
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.unsupportedDevice.error.secondaryAction"
              ),
              onPress: () =>
                closeIssuance({
                  reason: failure.reason,
                  cta_category: "custom_1",
                  cta_id: I18n.t(
                    "features.itWallet.unsupportedDevice.error.secondaryAction"
                  )
                }) // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
            }
          };
        case IssuanceFailureType.UNTRUSTED_ISS:
          return {
            title: I18n.t(
              `features.itWallet.issuance.issuerNotTrustedCommonError.title`
            ),
            subtitle: I18n.t(
              "features.itWallet.issuance.issuerNotTrustedCommonError.subtitle",
              {
                credential: "IT-Wallet"
              }
            ),
            pictogram: "umbrella",
            action: {
              label: I18n.t(
                `features.itWallet.issuance.issuerNotTrustedCommonError.primaryAction`
              ),
              onPress: () => {
                trackItwKoStateAction({
                  reason: failure.reason.message,
                  cta_category: "custom_1",
                  cta_id: I18n.t(
                    "features.itWallet.issuance.issuerNotTrustedCommonError.primaryAction"
                  )
                });
                machineRef.send({ type: "close" });
              }
            },
            secondaryAction: {
              label: I18n.t(
                `features.itWallet.issuance.issuerNotTrustedCommonError.secondaryAction`
              ),
              onPress: () => {
                trackItwKoStateAction({
                  reason: failure.reason.message,
                  cta_category: "custom_2",
                  cta_id: I18n.t(
                    "features.itWallet.issuance.issuerNotTrustedCommonError.secondaryAction"
                  )
                });
                supportModal.present();
              }
            }
          };
        case IssuanceFailureType.WALLET_REVOCATION_ERROR:
          return {
            title: I18n.t(
              "features.itWallet.walletRevocation.failureScreen.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.walletRevocation.failureScreen.subtitle"
            ),
            pictogram: "umbrella",
            action: {
              label: I18n.t("global.buttons.retry"),
              onPress: () => machineRef.send({ type: "revoke-wallet-instance" })
            },
            secondaryAction: {
              label: I18n.t("global.buttons.close"),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
      }
    };

  useEidEventsTracking({ failure, identification, issuanceLevel, credential });

  const resultScreenProps = getOperationResultScreenContentProps();

  return (
    <>
      <OperationResultScreenContent {...resultScreenProps} />
      {supportModal.bottomSheet}
    </>
  );
};
