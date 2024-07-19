import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import React from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureEnum
} from "../../machine/credential/failure";
import { selectFailureOption } from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";

export const ItwIssuanceCredentialFailureScreen = () => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const failureOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectFailureOption);

  const closeIssuance = () => machineRef.send({ type: "close" });
  const retryIssuance = () => machineRef.send({ type: "retry" });

  const ContentView = ({ failure }: { failure: CredentialIssuanceFailure }) => {
    const resultScreensMap: Record<
      CredentialIssuanceFailure,
      OperationResultScreenContentProps
    > = {
      [CredentialIssuanceFailureEnum.GENERIC]: {
        title: I18n.t("features.itWallet.issuance.genericError.title"),
        subtitle: I18n.t("features.itWallet.issuance.genericError.body"),
        pictogram: "workInProgress",
        action: {
          label: I18n.t(
            "features.itWallet.issuance.genericError.primaryAction"
          ),
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

    const resultScreenProps =
      resultScreensMap[failure] ?? resultScreensMap.GENERIC;

    return <OperationResultScreenContent {...resultScreenProps} />;
  };

  return pipe(
    failureOption,
    O.alt(() => O.some(CredentialIssuanceFailureEnum.GENERIC)),
    O.fold(constNull, failure => <ContentView failure={failure} />)
  );
};
