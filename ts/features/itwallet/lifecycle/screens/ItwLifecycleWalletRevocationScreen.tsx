import { View } from "react-native";
import { Body, IOStyles } from "@pagopa/io-app-design-system";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { selectIsLoading } from "../../machine/eid/selectors";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";

const RevocationLoadingScreen = () => {
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return (
    <LoadingScreenContent
      contentTitle={I18n.t(
        "features.itWallet.walletRevocation.loadingScreen.title"
      )}
    >
      <View style={[IOStyles.alignCenter, IOStyles.horizontalContentPadding]}>
        <Body>
          {I18n.t("features.itWallet.walletRevocation.loadingScreen.subtitle")}
        </Body>
      </View>
    </LoadingScreenContent>
  );
};

export const ItwLifecycleWalletRevocationScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);

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
        onPress: () => machineRef.send({ type: "revoke-wallet-instance" })
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        onPress: () => machineRef.send({ type: "close" })
      }}
    />
  );
};
