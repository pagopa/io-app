import { Body, ContentWrapper } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { selectIsLoading } from "../../machine/eid/selectors";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard.ts";
import { useIOSelector } from "../../../../store/hooks.ts";
import { itwLifecycleIsITWalletValidSelector } from "../store/selectors/index.ts";

const RevocationLoadingScreen = () => {
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return (
    <LoadingScreenContent
      contentTitle={I18n.t(
        "features.itWallet.walletRevocation.loadingScreen.title",
        { name: isItwL3 ? "IT-Wallet" : "Documenti su IO" }
      )}
    >
      <ContentWrapper style={{ alignItems: "center" }}>
        <Body>
          {I18n.t("features.itWallet.walletRevocation.loadingScreen.subtitle")}
        </Body>
      </ContentWrapper>
    </LoadingScreenContent>
  );
};

export const ItwLifecycleWalletRevocationScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);

  const handleRevokeWalletInstance = useOfflineToastGuard(() =>
    machineRef.send({ type: "revoke-wallet-instance" })
  );

  if (isLoading) {
    return <RevocationLoadingScreen />;
  }

  return (
    <OperationResultScreenContent
      enableAnimatedPictogram
      pictogram="attention"
      title={I18n.t("features.itWallet.walletRevocation.confirmScreen.title")}
      subtitle={I18n.t(
        "features.itWallet.walletRevocation.confirmScreen.subtitle"
      )}
      action={{
        label: I18n.t(
          "features.itWallet.walletRevocation.confirmScreen.action"
        ),
        accessibilityLabel: I18n.t(
          "features.itWallet.walletRevocation.confirmScreen.action"
        ),
        onPress: handleRevokeWalletInstance
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        onPress: () => machineRef.send({ type: "close" })
      }}
    />
  );
};
