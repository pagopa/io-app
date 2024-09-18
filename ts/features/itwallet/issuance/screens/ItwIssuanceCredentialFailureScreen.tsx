import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType,
  CredentialIssuanceFailureTypeEnum
} from "../../machine/credential/failure";
import { selectFailureOption } from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";

export const ItwIssuanceCredentialFailureScreen = () => {
  const failureOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectFailureOption);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return pipe(
    failureOption,
    O.fold(
      () => (
        <ContentView
          failure={{ type: CredentialIssuanceFailureTypeEnum.GENERIC }}
        />
      ),
      type => <ContentView failure={type} />
    )
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

  useDebugInfo({
    failure
  });

  const resultScreensMap: Record<
    CredentialIssuanceFailureType,
    OperationResultScreenContentProps
  > = {
    GENERIC: {
      title: I18n.t("features.itWallet.issuance.genericCredentialError.title"),
      subtitle: I18n.t(
        "features.itWallet.issuance.genericCredentialError.body"
      ),
      pictogram: "workInProgress",
      action: {
        label: I18n.t(
          "features.itWallet.issuance.genericCredentialError.primaryAction"
        ),
        onPress: retryIssuance
      },
      secondaryAction: {
        label: I18n.t(
          "features.itWallet.issuance.genericCredentialError.secondaryAction"
        ),
        onPress: closeIssuance
      }
    },
    ASYNC_ISSUANCE: {
      title: I18n.t("features.itWallet.issuance.asyncCredentialError.title"),
      subtitle: I18n.t("features.itWallet.issuance.asyncCredentialError.body"),
      pictogram: "pending",
      action: {
        label: I18n.t(
          "features.itWallet.issuance.asyncCredentialError.primaryAction"
        ),
        onPress: closeIssuance
      }
    }
  };

  const resultScreenProps = resultScreensMap[failure.type];
  return <OperationResultScreenContent {...resultScreenProps} />;
};
