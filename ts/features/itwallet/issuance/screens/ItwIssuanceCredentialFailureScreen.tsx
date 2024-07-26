import { Alert } from "@pagopa/io-app-design-system";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import React from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { isDebugModeEnabledSelector } from "../../../../store/reducers/debug";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType,
  CredentialIssuanceFailureTypeEnum
} from "../../machine/credential/failure";
import { selectFailureOption } from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { DebugPrettyPrint } from "../../../../components/DebugPrettyPrint";

export const ItwIssuanceCredentialFailureScreen = () => {
  const failureOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectFailureOption);

  return pipe(
    failureOption,
    O.alt(() => O.some({ type: CredentialIssuanceFailureTypeEnum.GENERIC })),
    O.fold(constNull, type => <ContentView failure={type} />)
  );
};

type ContentViewProps = { failure: CredentialIssuanceFailure };

/**
 * Renders the content of the screen
 */
const ContentView = ({ failure }: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  const closeIssuance = () => machineRef.send({ type: "close" });
  const retryIssuance = () => machineRef.send({ type: "retry" });

  const resultScreensMap: Record<
    CredentialIssuanceFailureType,
    OperationResultScreenContentProps
  > = {
    GENERIC: {
      title: I18n.t("features.itWallet.issuance.genericError.title"),
      subtitle: I18n.t("features.itWallet.issuance.genericError.body"),
      pictogram: "workInProgress",
      action: {
        label: I18n.t("features.itWallet.issuance.genericError.primaryAction"),
        onPress: retryIssuance
      },
      secondaryAction: {
        label: I18n.t(
          "features.itWallet.issuance.genericError.secondaryAction"
        ),
        onPress: closeIssuance
      }
    }
  };

  const resultScreenProps = resultScreensMap[failure.type];
  return (
    <OperationResultScreenContent {...resultScreenProps}>
      <ErrorAlertDebugOnly failure={failure} />
    </OperationResultScreenContent>
  );
};

const ErrorAlertDebugOnly = ({
  failure
}: {
  failure: CredentialIssuanceFailure;
}) => {
  const isDebug = useIOSelector(isDebugModeEnabledSelector);

  if (!isDebug) {
    return null;
  }

  const renderErrorText = () =>
    pipe(
      failure.reason instanceof Error ? failure.reason.message : failure.reason,
      t.string.decode,
      O.fromEither,
      O.getOrElse(() => "Unknown error")
    );

  return <DebugPrettyPrint />;

  return <Alert variant="error" content={renderErrorText()} />;
};
