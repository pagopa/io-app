import { Errors } from "@pagopa/io-react-native-wallet";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useIOSelector } from "../../../../store/hooks";
import {
  fallbackForLocalizedMessageKeys,
  getFullLocale
} from "../../../../utils/locale";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { trackItwKoStateAction } from "../../analytics";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import {
  useItwFailureSupportModal,
  ZendeskSubcategoryValue
} from "../../common/hooks/useItwFailureSupportModal";
import { itwDeferredIssuanceScreenContentSelector } from "../../common/store/selectors/remoteConfig";
import { getClaimsFullLocale } from "../../common/utils/itwClaimsUtils";
import { StatusAssertionError } from "../../common/utils/itwCredentialStatusAssertionUtils.ts";
import { serializeFailureReason } from "../../common/utils/itwStoreUtils";
import { IssuerConfiguration } from "../../common/utils/itwTypesUtils";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType
} from "../../machine/credential/failure";
import {
  selectCredentialTypeOption,
  selectFailureOption,
  selectIssuerConfigurationOption
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import { useCredentialEventsTracking } from "../hooks/useCredentialEventsTracking";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";

// Errors that allow a user to send a support request to Zendesk
const zendeskAssistanceErrors = [
  CredentialIssuanceFailureType.UNEXPECTED,
  CredentialIssuanceFailureType.WALLET_PROVIDER_GENERIC
];

export const ItwIssuanceCredentialFailureScreen = () => {
  const failureOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectFailureOption);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return pipe(
    failureOption,
    O.fold(constNull, failure => <ContentView failure={failure} />)
  );
};

const defaultInvalidStatusMessage = {
  title: I18n.t("features.itWallet.issuance.notEntitledCredentialError.title"),
  description: I18n.t(
    "features.itWallet.issuance.notEntitledCredentialError.body"
  )
};

type ContentViewProps = {
  failure: CredentialIssuanceFailure;
};

/**
 * Renders the content of the screen
 */
const ContentView = ({ failure }: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const credentialType = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );
  const issuerConf = ItwCredentialIssuanceMachineContext.useSelector(
    selectIssuerConfigurationOption
  );
  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);
  const deferredIssuanceScreenContent = useIOSelector(
    itwDeferredIssuanceScreenContentSelector
  );
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);

  const invalidStatusDetails = getCredentialInvalidStatusDetails(failure, {
    credentialType,
    issuerConf
  });

  const closeIssuance = () => {
    machineRef.send({ type: "close" });
    trackItwKoStateAction({
      reason: failure.reason,
      cta_category: "custom_2",
      cta_id: "close_issuance"
    });
  };
  const closeAsyncIssuance = () => {
    machineRef.send({
      type: "close"
    });
  };

  useDebugInfo({
    failure: serializeFailureReason(failure)
  });
  const supportModal = useItwFailureSupportModal({
    failure,
    credentialType: O.toUndefined(credentialType),
    supportChatEnabled: zendeskAssistanceErrors.includes(failure.type),
    zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI
  });

  const supportModalAction = {
    label: I18n.t("features.itWallet.support.button"),
    onPress: supportModal.present
  };

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      switch (failure.type) {
        case CredentialIssuanceFailureType.UNEXPECTED:
        case CredentialIssuanceFailureType.ISSUER_GENERIC:
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
        // NOTE: only the mDL supports the async flow, so this error message is specific to mDL
        case CredentialIssuanceFailureType.ASYNC_ISSUANCE:
          return {
            title:
              deferredIssuanceScreenContent?.title?.[localeFallback] ??
              I18n.t("features.itWallet.issuance.asyncCredentialError.title"),
            subtitle:
              deferredIssuanceScreenContent?.description?.[localeFallback] ??
              I18n.t("features.itWallet.issuance.asyncCredentialError.body"),
            pictogram: "pending",
            action: {
              label: I18n.t(
                "features.itWallet.issuance.asyncCredentialError.primaryAction"
              ),
              onPress: closeAsyncIssuance
            }
          };
        // Dynamic errors extracted from the entity configuration, with fallback
        case CredentialIssuanceFailureType.INVALID_STATUS: {
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
        case CredentialIssuanceFailureType.UNTRUSTED_ISS: {
          return {
            title: I18n.t(
              `features.itWallet.issuance.issuerNotTrustedCommonError.title`
            ),
            subtitle: I18n.t(
              "features.itWallet.issuance.issuerNotTrustedCommonError.subtitle",
              {
                credential: getCredentialNameFromType(
                  O.toUndefined(credentialType)
                )
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
    credentialType: O.toUndefined(credentialType),
    invalidErrorCode: invalidStatusDetails.errorCode
  });

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

type GetCredentialInvalidStatusDetailsParams = {
  credentialType: O.Option<string>;
  issuerConf: O.Option<IssuerConfiguration>;
};

/**
 * Utility to safely extract details from an invalid status failure, including the localized message.
 * **Note:** The message is dynamic and is extracted from the EC.
 */
const getCredentialInvalidStatusDetails = (
  failure: CredentialIssuanceFailure,
  { issuerConf }: GetCredentialInvalidStatusDetailsParams
) => {
  const { errorCodeOption, credentialConfigurationId } = pipe(
    failure,
    O.fromPredicate(isInvalidStatusFailure),
    O.map(({ reason }) => ({
      errorCodeOption: pipe(
        O.fromEither(StatusAssertionError.decode(reason?.reason)),
        O.map(({ error }) => error)
      ),
      credentialConfigurationId: O.fromNullable(reason?.metadata?.credentialId)
    })),
    O.getOrElse(() => ({
      errorCodeOption: O.none as O.Option<string>,
      credentialConfigurationId: O.none as O.Option<string>
    }))
  );

  const localizedMessage = pipe(
    sequenceS(O.Monad)({
      errorCode: errorCodeOption,
      credentialConfigurationId,
      issuerConf
    }),
    O.chain(params =>
      O.tryCatch(() =>
        Errors.extractErrorMessageFromIssuerConf(params.errorCode, {
          credentialType: params.credentialConfigurationId,
          issuerConf: params.issuerConf
        })
      )
    ),
    O.map(message => message?.[getClaimsFullLocale()]),
    O.toUndefined
  );

  return {
    message: localizedMessage,
    errorCode: pipe(errorCodeOption, O.toUndefined)
  };
};

const isInvalidStatusFailure = (
  failure: CredentialIssuanceFailure
): failure is Extract<
  CredentialIssuanceFailure,
  { type: CredentialIssuanceFailureType.INVALID_STATUS }
> => failure.type === CredentialIssuanceFailureType.INVALID_STATUS;
