import { Errors } from "@pagopa/io-react-native-wallet";
import { sequenceS } from "fp-ts/lib/Apply";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { trackWalletCreationFailed } from "../../analytics";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { getClaimsFullLocale } from "../../common/utils/itwClaimsUtils";
import { StatusAttestationError } from "../../common/utils/itwCredentialStatusAttestationUtils";
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
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { useCredentialEventsTracking } from "../hooks/useCredentialEventsTracking";
import { useIOSelector } from "../../../../store/hooks";
import { itwDeferredIssuanceScreenContentSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { getFullLocale } from "../../../../utils/locale";
import { serializeFailureReason } from "../../common/utils/itwStoreUtils";

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

type ContentViewProps = { failure: CredentialIssuanceFailure };

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
  const deferredIssuanceScreenContent = useIOSelector(
    itwDeferredIssuanceScreenContentSelector
  );

  const invalidStatusDetails = getCredentialInvalidStatusDetails(failure, {
    credentialType,
    issuerConf
  });

  const closeIssuance = (cta_id: string) => {
    machineRef.send({ type: "close" });
    trackWalletCreationFailed({
      reason: failure.reason,
      cta_category: "custom_2",
      cta_id
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

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      switch (failure.type) {
        case CredentialIssuanceFailureType.UNEXPECTED:
        case CredentialIssuanceFailureType.ISSUER_GENERIC:
        case CredentialIssuanceFailureType.WALLET_PROVIDER_GENERIC:
          return {
            title: I18n.t("features.itWallet.issuance.genericError.title"),
            subtitle: I18n.t("features.itWallet.issuance.genericError.body"),
            pictogram: "umbrellaNew",
            action: {
              label: I18n.t(
                "features.itWallet.issuance.genericError.primaryAction"
              ),
              onPress: () =>
                closeIssuance(
                  I18n.t(
                    "features.itWallet.issuance.genericError.primaryAction"
                  )
                )
            }
          };
        // NOTE: only the mDL supports the async flow, so this error message is specific to mDL
        case CredentialIssuanceFailureType.ASYNC_ISSUANCE:
          return {
            title:
              deferredIssuanceScreenContent?.title?.[locale] ??
              I18n.t("features.itWallet.issuance.asyncCredentialError.title"),
            subtitle:
              deferredIssuanceScreenContent?.description?.[locale] ??
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
        case CredentialIssuanceFailureType.INVALID_STATUS:
          return {
            title:
              invalidStatusDetails.message?.title ??
              defaultInvalidStatusMessage.title,
            subtitle:
              invalidStatusDetails.message?.description ??
              defaultInvalidStatusMessage.description,
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
          };
      }
    };

  useCredentialEventsTracking({
    failure,
    credentialType: O.toUndefined(credentialType),
    invalidErrorCode: invalidStatusDetails.errorCode
  });

  const resultScreenProps = getOperationResultScreenContentProps();
  return (
    <OperationResultScreenContent
      {...resultScreenProps}
      subtitleProps={{ textBreakStrategy: "simple" }}
    />
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
  { credentialType, issuerConf }: GetCredentialInvalidStatusDetailsParams
) => {
  const errorCodeOption = pipe(
    failure,
    O.fromPredicate(isInvalidStatusFailure),
    O.chainEitherK(x => StatusAttestationError.decode(x.reason?.reason)),
    O.map(x => x.error)
  );

  const localizedMessage = pipe(
    sequenceS(O.Monad)({
      errorCode: errorCodeOption,
      credentialType,
      issuerConf
    }),
    O.map(({ errorCode, ...rest }) =>
      Errors.extractErrorMessageFromIssuerConf(errorCode, rest)
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
