import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useEffect } from "react";
import { Errors } from "@pagopa/io-react-native-wallet";
import { sequenceS } from "fp-ts/lib/Apply";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
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
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import {
  CREDENTIALS_MAP,
  trackAddCredentialFailure,
  trackCredentialInvalidStatusFailure,
  trackCredentialNotEntitledFailure,
  trackItWalletDeferredIssuing,
  trackWalletCreationFailed
} from "../../analytics";
import ROUTES from "../../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { getClaimsFullLocale } from "../../common/utils/itwClaimsUtils";
import { StatusAttestationError } from "../../common/utils/itwCredentialStatusAttestationUtils";

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

type ContentViewProps = { failure: CredentialIssuanceFailure };

/**
 * Renders the content of the screen
 */
const ContentView = ({ failure }: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const credentialType = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );

  const invalidStatusDetails = useCredentialInvalidStatusDetails(failure);

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
      type: "close",
      navigateTo: [ROUTES.MAIN, { screen: MESSAGES_ROUTES.MESSAGES_HOME }]
    });
  };

  useDebugInfo({
    failure
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
            title: I18n.t(
              "features.itWallet.issuance.asyncCredentialError.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.issuance.asyncCredentialError.body"
            ),
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

  useEffect(() => {
    if (O.isNone(credentialType)) {
      return;
    }

    if (failure.type === CredentialIssuanceFailureType.ASYNC_ISSUANCE) {
      trackItWalletDeferredIssuing(CREDENTIALS_MAP[credentialType.value]);
      return;
    }

    if (failure.type === CredentialIssuanceFailureType.INVALID_STATUS) {
      const trackingFunction =
        invalidStatusDetails.errorCode === "credential_not_found"
          ? trackCredentialNotEntitledFailure
          : trackCredentialInvalidStatusFailure;

      trackingFunction({
        reason: invalidStatusDetails.errorCode,
        type: failure.type,
        credential: CREDENTIALS_MAP[credentialType.value]
      });
      return;
    }

    if (
      failure.type === CredentialIssuanceFailureType.UNEXPECTED ||
      failure.type === CredentialIssuanceFailureType.ISSUER_GENERIC ||
      failure.type === CredentialIssuanceFailureType.WALLET_PROVIDER_GENERIC
    ) {
      trackAddCredentialFailure({
        reason: failure.reason,
        type: failure.type,
        credential: CREDENTIALS_MAP[credentialType.value]
      });
    }

    /* trackAddCredentialTimeout({
      reason: failure.reason,
      type: failure.type,
      credential: CREDENTIALS_MAP[credentialType.value]
    }); */
  }, [credentialType, failure, invalidStatusDetails.errorCode]);

  const resultScreenProps = getOperationResultScreenContentProps();
  return <OperationResultScreenContent {...resultScreenProps} />;
};

const defaultInvalidStatusMessage = {
  title: I18n.t("features.itWallet.issuance.notEntitledCredentialError.title"),
  description: I18n.t(
    "features.itWallet.issuance.notEntitledCredentialError.body"
  )
};

/**
 * Hook used to safely extract details from an invalid status error, including the localized message.
 *
 * **Note:** The message is dynamic and must be extracted from the EC.
 */
const useCredentialInvalidStatusDetails = (
  failure: CredentialIssuanceFailure
) => {
  const credentialType = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );
  const issuerConf = ItwCredentialIssuanceMachineContext.useSelector(
    selectIssuerConfigurationOption
  );

  const errorCodeOption = pipe(
    failure,
    O.fromPredicate(
      e => e.type === CredentialIssuanceFailureType.INVALID_STATUS
    ),
    O.chainEitherK(e => StatusAttestationError.decode(e.reason.reason)),
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
