import I18n from "i18next";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useIOSelector } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { trackItwKoStateAction } from "../../analytics";
import { useItwCredentialName } from "../../common/hooks/useItwCredentialName";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useItwFailureSupportModal } from "../../common/hooks/useItwFailureSupportModal";
import { ZendeskSubcategoryValue } from "../../common/hooks/useItwZendeskSupport";
import { serializeFailureReason } from "../../common/utils/itwStoreUtils";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType
} from "../../machine/credential/failure";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import {
  selectCredentialType,
  selectFailure,
  selectIssuerConfiguration
} from "../../machine/credential/selectors";
import { useCredentialEventsTracking } from "../hooks/useCredentialEventsTracking";
import { useCredentialIssuanceStatusMessage } from "../hooks/useCredentialIssuanceStatusMessage";

const ASSERTION_FAILED_FAQ_URL =
  "https://assistenza.ioapp.it/hc/it/articles/43824826487953-Provo-ad-aggiungere-un-documento-al-Portafoglio-ma-ricevo-un-errore-dal-mio-dispositivo-Apple";

// Errors that allow a user to send a support request to Zendesk
const zendeskAssistanceErrors = [
  CredentialIssuanceFailureType.UNEXPECTED,
  CredentialIssuanceFailureType.WALLET_PROVIDER_GENERIC,
  CredentialIssuanceFailureType.HARDWARE_KEY_INVALID
];

const failureLinkMapper: Partial<
  Record<CredentialIssuanceFailureType, string>
> = {
  [CredentialIssuanceFailureType.HARDWARE_KEY_INVALID]: ASSERTION_FAILED_FAQ_URL
};

export const ItwIssuanceCredentialFailureScreen = () => {
  const failure =
    ItwCredentialIssuanceMachineContext.useSelector(selectFailure);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return failure ? <ContentView failure={failure} /> : null;
};

type ContentViewProps = { failure: CredentialIssuanceFailure };

/**
 * Renders the content of the screen
 */
const ContentView = ({ failure }: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const credentialType =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialType);
  const issuerConf = ItwCredentialIssuanceMachineContext.useSelector(
    selectIssuerConfiguration
  );
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const credentialName = useItwCredentialName(credentialType);

  const invalidStatusDetails = useCredentialIssuanceStatusMessage(
    failure,
    issuerConf
  );

  const defaultInvalidStatusMessage = {
    title: I18n.t(
      "features.itWallet.issuance.notEntitledCredentialError.title"
    ),
    description: I18n.t(
      "features.itWallet.issuance.notEntitledCredentialError.body"
    )
  };

  const closeIssuance = () => {
    machineRef.send({ type: "close" });
    trackItwKoStateAction({
      reason: failure.reason,
      cta_category: "custom_2",
      cta_id: "close_issuance"
    });
  };

  useDebugInfo({
    failure: serializeFailureReason(failure)
  });
  const supportModal = useItwFailureSupportModal({
    failure,
    credentialType,
    supportChatEnabled: zendeskAssistanceErrors.includes(failure.type),
    zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI,
    supportLink: failureLinkMapper[failure.type]
  });

  const supportModalAction = {
    label: I18n.t("features.itWallet.support.button"),
    onPress: supportModal.present
  };

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      switch (failure.type) {
        case CredentialIssuanceFailureType.HARDWARE_KEY_INVALID:
          return {
            title: I18n.t("features.itWallet.hardwareKeyInvalid.error.title"),
            subtitle: I18n.t("features.itWallet.hardwareKeyInvalid.error.body"),
            pictogram: "fatalError",
            action: {
              label: I18n.t(
                "features.itWallet.hardwareKeyInvalid.error.primaryAction"
              ),
              onPress: supportModal.present
            },
            secondaryAction: {
              label: I18n.t("global.buttons.close"),
              onPress: closeIssuance
            }
          };
        // Dynamic errors extracted from the entity configuration, with fallback
        case CredentialIssuanceFailureType.INVALID_STATUS_BY_ASSERTION:
        case CredentialIssuanceFailureType.INVALID_STATUS_BY_TSL: {
          const closeAction = {
            label: I18n.t(
              "features.itWallet.issuance.notEntitledCredentialError.primaryAction"
            ),
            onPress: closeIssuance
          };
          return {
            title:
              invalidStatusDetails.message?.title ??
              defaultInvalidStatusMessage.title,
            subtitle:
              invalidStatusDetails.message?.description ??
              defaultInvalidStatusMessage.description,
            pictogram: "accessDenied",
            ...(supportModal.hasContactMethods
              ? { action: supportModalAction, secondaryAction: closeAction }
              : { action: closeAction, secondaryAction: supportModalAction })
          };
        }
        case CredentialIssuanceFailureType.ISSUER_GENERIC:
        case CredentialIssuanceFailureType.UNEXPECTED:
        case CredentialIssuanceFailureType.WALLET_PROVIDER_GENERIC: {
          const closeAction = {
            label: I18n.t(
              "features.itWallet.issuance.notEntitledCredentialError.primaryAction"
            ),
            onPress: closeIssuance
          };
          return {
            title: I18n.t("features.itWallet.issuance.genericError.title"),
            subtitle: I18n.t("features.itWallet.issuance.genericError.body"),
            pictogram: "umbrella",
            ...(supportModal.hasContactMethods
              ? { action: supportModalAction, secondaryAction: closeAction }
              : { action: closeAction, secondaryAction: supportModalAction })
          };
        }
        case CredentialIssuanceFailureType.UNTRUSTED_ISS: {
          return {
            title: I18n.t(
              `features.itWallet.issuance.issuerNotTrustedCommonError.title`
            ),
            subtitle: I18n.t(
              "features.itWallet.issuance.issuerNotTrustedCommonError.subtitle",
              {
                credential: credentialName
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
        }
      }
    };

  useCredentialEventsTracking({
    failure,
    isItwL3,
    credentialType,
    invalidErrorCode: invalidStatusDetails.errorCode
  });

  const resultScreenProps = getOperationResultScreenContentProps();
  return (
    <>
      <OperationResultScreenContent {...resultScreenProps} />
      {supportModal.bottomSheet}
    </>
  );
};
