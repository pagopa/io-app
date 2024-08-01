import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import {
  IssuanceFailure,
  IssuanceFailureType
} from "../../machine/eid/failure";
import { selectFailureOption } from "../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useItwDisbleGestureNavigation } from "../../common/hooks/useItwDisbleGestureNavigation";

export const ItwIssuanceEidFailureScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const failureOption =
    ItwEidIssuanceMachineContext.useSelector(selectFailureOption);

  useItwDisbleGestureNavigation();
  useAvoidHardwareBackButton();

  const closeIssuance = () => machineRef.send({ type: "close" });

  const ContentView = ({ failure }: { failure: IssuanceFailure }) => {
    useDebugInfo({
      failure
    });

    const resultScreensMap: Record<
      IssuanceFailureType,
      OperationResultScreenContentProps
    > = {
      [IssuanceFailureType.GENERIC]: {
        title: I18n.t("features.itWallet.generic.error.title"),
        subtitle: I18n.t("features.itWallet.generic.error.body"),
        pictogram: "workInProgress",
        action: {
          label: I18n.t("global.buttons.close"),
          onPress: closeIssuance // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
        }
      },
      [IssuanceFailureType.ISSUER_GENERIC]: {
        title: I18n.t("features.itWallet.issuance.genericError.title"),
        subtitle: I18n.t("features.itWallet.issuance.genericError.body"),
        pictogram: "workInProgress",
        action: {
          label: I18n.t(
            "features.itWallet.issuance.genericError.primaryAction"
          ),
          onPress: closeIssuance // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
        },
        secondaryAction: {
          label: I18n.t(
            "features.itWallet.issuance.genericError.secondaryAction"
          ),
          onPress: closeIssuance // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
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
          onPress: closeIssuance // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
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
          onPress: closeIssuance // TODO: [SIW-1375] better retry and go back handling logic for the issuance process
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
