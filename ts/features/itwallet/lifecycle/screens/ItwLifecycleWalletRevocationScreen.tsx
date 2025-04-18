import { Body, ContentWrapper } from "@pagopa/io-app-design-system";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { selectIsLoading } from "../../machine/eid/selectors";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useOfflineGuard } from "../../../../hooks/useOfflineGuard";

const RevocationLoadingScreen = () => {
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return (
    <LoadingScreenContent
      contentTitle={I18n.t(
        "features.itWallet.walletRevocation.loadingScreen.title"
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

  const handleRevokeWalletInstance = useOfflineGuard(
    () => machineRef.send({ type: "revoke-wallet-instance" }),
    { type: "toast" }
  );

  if (isLoading) {
    return <RevocationLoadingScreen />;
  }

  return (
    <OperationResultScreenContent
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
