import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import { ItwRemoteMachineContext } from "../machine/provider.tsx";
import { selectFailureOption } from "../machine/selectors.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { serializeFailureReason } from "../../../common/utils/itwStoreUtils.ts";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { RemoteFailure, RemoteFailureType } from "../machine/failure.ts";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import I18n from "../../../../../i18n.ts";

export const ItwRemoteFailureScreen = () => {
  const failureOption =
    ItwRemoteMachineContext.useSelector(selectFailureOption);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return pipe(
    failureOption,
    O.fold(constNull, failure => <ContentView failure={failure} />)
  );
};

type ContentViewProps = { failure: RemoteFailure };

const ContentView = ({ failure }: ContentViewProps) => {
  const machineRef = ItwRemoteMachineContext.useActorRef();

  useDebugInfo({
    failure: serializeFailureReason(failure)
  });

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      switch (failure.type) {
        case RemoteFailureType.UNEXPECTED:
          return {
            title: I18n.t("features.itWallet.generic.error.title"),
            subtitle: I18n.t("features.itWallet.generic.error.body"),
            pictogram: "workInProgress",
            action: {
              label: I18n.t("global.buttons.close"),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        case RemoteFailureType.WALLET_INACTIVE:
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.walletInactiveScreen.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.walletInactiveScreen.subtitle"
            ),
            pictogram: "itWallet",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.remote.walletInactiveScreen.continue"
              ),
              onPress: () => machineRef.send({ type: "accept-tos" })
            },
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.presentation.remote.walletInactiveScreen.close"
              ),
              onPress: () => machineRef.send({ type: "go-to-wallet" })
            }
          };
      }
    };

  const resultScreenProps = getOperationResultScreenContentProps();

  return (
    <>
      <OperationResultScreenContent
        {...resultScreenProps}
        subtitleProps={{ textBreakStrategy: "simple" }}
      />
    </>
  );
};
