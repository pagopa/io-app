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
  CredentialIssuanceFailureType,
  CredentialIssuanceFailureTypeEnum,
  isCredentialInvalidStatusError
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
  trackAddCredentialTimeout,
  trackCredentialInvalidStatusFailure,
  trackCredentialNotEntitledFailure,
  trackItWalletDeferredIssuing,
  trackWalletCreationFailed
} from "../../analytics";
import ROUTES from "../../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { getClaimsFullLocale } from "../../common/utils/itwClaimsUtils";

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

  const invalidStatusMessage = useCredentialInvalidStatusMessage(failure);

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

  const resultScreensMap: Record<
    CredentialIssuanceFailureType,
    OperationResultScreenContentProps
  > = {
    GENERIC: {
      title: I18n.t("features.itWallet.issuance.genericError.title"),
      subtitle: I18n.t("features.itWallet.issuance.genericError.body"),
      pictogram: "umbrellaNew",
      action: {
        label: I18n.t("features.itWallet.issuance.genericError.primaryAction"),
        onPress: () =>
          closeIssuance(
            I18n.t("features.itWallet.issuance.genericError.primaryAction")
          )
      }
    },
    // NOTE: only the mDL supports the async flow, so this error message is specific to mDL
    ASYNC_ISSUANCE: {
      title: I18n.t("features.itWallet.issuance.asyncCredentialError.title"),
      subtitle: I18n.t("features.itWallet.issuance.asyncCredentialError.body"),
      pictogram: "pending",
      action: {
        label: I18n.t(
          "features.itWallet.issuance.asyncCredentialError.primaryAction"
        ),
        onPress: closeAsyncIssuance
      }
    },
    // Dynamic errors extracted from the entity configuration
    INVALID_STATUS: {
      title:
        invalidStatusMessage?.title ??
        I18n.t("features.itWallet.issuance.notEntitledCredentialError.title"),
      subtitle:
        invalidStatusMessage?.description ??
        I18n.t("features.itWallet.issuance.notEntitledCredentialError.body"),
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
    }
  };

  useEffect(() => {
    if (O.isNone(credentialType)) {
      return;
    }

    if (failure.type === CredentialIssuanceFailureTypeEnum.ASYNC_ISSUANCE) {
      trackItWalletDeferredIssuing(CREDENTIALS_MAP[credentialType.value]);
      return;
    }

    if (failure.type === CredentialIssuanceFailureTypeEnum.INVALID_STATUS) {
      const error = failure.reason as Errors.CredentialInvalidStatusError;

      const trackingFunction =
        error.errorCode === "credential_not_found"
          ? trackCredentialNotEntitledFailure
          : trackCredentialInvalidStatusFailure;

      trackingFunction({
        reason: error.errorCode,
        type: failure.type,
        credential: CREDENTIALS_MAP[credentialType.value]
      });
      return;
    }

    if (failure.type === CredentialIssuanceFailureTypeEnum.GENERIC) {
      trackAddCredentialFailure({
        reason: failure.reason,
        type: failure.type,
        credential: CREDENTIALS_MAP[credentialType.value]
      });
      return;
    }
    trackAddCredentialTimeout({
      reason: failure.reason,
      type: failure.type,
      credential: CREDENTIALS_MAP[credentialType.value]
    });
  }, [credentialType, failure]);

  const resultScreenProps = resultScreensMap[failure.type];
  return <OperationResultScreenContent {...resultScreenProps} />;
};

/**
 * Hook used to safely extract the localized message from an invalid status error.
 * This message is dynamic and must be extracted from the EC.
 */
const useCredentialInvalidStatusMessage = (
  failure: CredentialIssuanceFailure
) => {
  const credentialType = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );
  const issuerConf = ItwCredentialIssuanceMachineContext.useSelector(
    selectIssuerConfigurationOption
  );

  return pipe(
    sequenceS(O.Monad)({
      failure: pipe(failure, O.fromPredicate(isCredentialInvalidStatusError)),
      credentialType,
      issuerConf
    }),
    // eslint-disable-next-line @typescript-eslint/no-shadow
    O.map(({ failure, ...rest }) =>
      Errors.extractErrorMessageFromIssuerConf(failure.reason.errorCode, rest)
    ),
    O.map(message => message?.[getClaimsFullLocale()]),
    O.toUndefined
  );
};
