import React from "react";
import { useSelector } from "@xstate5/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  IssuanceFailure,
  IssuanceFailureType
} from "../../machine/eid/failure";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { selectFailureOption } from "../../machine/eid/selectors";

export const ItwIssuanceEidFailureScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const failureOption = useSelector(machineRef, selectFailureOption);

  const closeIssuance = () => machineRef.send({ type: "close" });

  const ContentView = ({ failure }: { failure: IssuanceFailure }) => {
    const resultScreensMap: Record<
      IssuanceFailureType,
      OperationResultScreenContentProps
    > = {
      [IssuanceFailureType.GENERIC]: {
        title: I18n.t("features.itWallet.issuance.genericError.title"),
        subtitle: I18n.t("features.itWallet.issuance.genericError.body"),
        pictogram: "workInProgress",
        action: {
          label: I18n.t(
            "features.itWallet.issuance.genericError.primaryAction"
          ),
          onPress: closeIssuance
        },
        secondaryAction: {
          label: I18n.t(
            "features.itWallet.issuance.genericError.secondaryAction"
          ),
          onPress: closeIssuance
        }
      },
      [IssuanceFailureType.UNSUPPORTED_DEVICE]: {
        title: I18n.t("features.itWallet.unsupportedDevice.error.title"),
        subtitle: I18n.t("features.itWallet.unsupportedDevice.error.body"),
        pictogram: "workInProgress",
        action: {
          label: I18n.t(
            "features.itWallet.unsupportedDevice.error.primaryAction"
          ),
          onPress: closeIssuance
        },
        secondaryAction: {
          label: I18n.t(
            "features.itWallet.unsupportedDevice.error.secondaryAction"
          ),
          onPress: () => undefined
        }
      },
      [IssuanceFailureType.NOT_MATCHING_IDENTITY]: {
        title: I18n.t(
          "features.itWallet.issuance.notMatchingIdentityError.title"
        ),
        subtitle: I18n.t(
          "features.itWallet.issuance.notMatchingIdentityError.body"
        ),
        pictogram: "accessDenied",
        action: {
          label: I18n.t(
            "features.itWallet.issuance.notMatchingIdentityError.primaryAction"
          ),
          onPress: () => closeIssuance
        },
        secondaryAction: {
          label: I18n.t(
            "features.itWallet.issuance.notMatchingIdentityError.secondaryAction"
          ),
          onPress: () => undefined
        }
      }
    };

    const resultScreenProps =
      resultScreensMap[failure.type] ?? resultScreensMap.GENERIC;

    return <OperationResultScreenContent {...resultScreenProps} />;
  };

  return pipe(
    failureOption,
    O.fold(
      () => <ContentView failure={{ type: IssuanceFailureType.GENERIC }} />,
      failure => <ContentView failure={failure} />
    )
  );
};
