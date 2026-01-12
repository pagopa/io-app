import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import { useIOToast } from "@pagopa/io-app-design-system";
import { Linking } from "react-native";
import I18n from "i18next";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import {
  IssuanceFailure,
  IssuanceFailureType
} from "../../machine/eid/failure";
import {
  selectFailureOption,
  selectIdentification,
  selectIssuanceLevel
} from "../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import {
  useItwFailureSupportModal,
  ZendeskSubcategoryValue
} from "../../common/hooks/useItwFailureSupportModal";
import { KoState } from "../../analytics/utils/types";
import { trackItwKoStateAction } from "../../analytics";
import { openWebUrl } from "../../../../utils/url";
import { useEidEventsTracking } from "../hooks/useEidEventsTracking";
import { serializeFailureReason } from "../../common/utils/itwStoreUtils";
import { useIOSelector } from "../../../../store/hooks";
import { generateDynamicUrlSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { DOCUMENTS_ON_IO_FAQ_12_URL_BODY } from "../../../../urls";

// Errors that allow a user to send a support request to Zendesk
const zendeskAssistanceErrors = [
  IssuanceFailureType.UNEXPECTED,
  IssuanceFailureType.WALLET_PROVIDER_GENERIC,
  IssuanceFailureType.UNSUPPORTED_DEVICE
];

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
    zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI
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
        case IssuanceFailureType.UNSUPPORTED_DEVICE:
          return {
            title: I18n.t("features.itWallet.unsupportedDevice.error.title"),
            subtitle: [
              {
                text: I18n.t("features.itWallet.unsupportedDevice.error.body")
              },
              {
                text: I18n.t(
                  "features.itWallet.unsupportedDevice.error.primaryAction"
                ),
                asLink: true,
                weight: "Semibold",
                onPress: () => {
                  openWebUrl(FAQ_URL, () =>
                    toast.error(I18n.t("global.jserror.title"))
                  );
                }
              }
            ],
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
        case IssuanceFailureType.NOT_MATCHING_IDENTITY:
          return {
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
              onPress: () =>
                closeIssuance({
                  reason: failure.reason,
                  cta_category: "custom_2",
                  cta_id: I18n.t(
                    "features.itWallet.issuance.notMatchingIdentityError.secondaryAction"
                  )
                }) // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
            },
            secondaryAction: supportModalAction
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
              onPress: () => machineRef.send({ type: "close" })
            },
            secondaryAction: {
              label: I18n.t(
                `features.itWallet.issuance.issuerNotTrustedCommonError.secondaryAction`
              ),
              onPress: () => {
                supportModal.present();
              }
            }
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
      }
    };

  useEidEventsTracking({ failure, identification, issuanceLevel });

  const resultScreenProps = getOperationResultScreenContentProps();

  return (
    <>
      <OperationResultScreenContent
        {...resultScreenProps}
        subtitleProps={{ textBreakStrategy: "simple" }}
      />
      {supportModal.bottomSheet}
    </>
  );
};
