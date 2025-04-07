import { SafeAreaView } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { isLoadingSelector } from "../../common/machine/selectors";
import { IdPayOnboardingMachineContext } from "../machine/provider";

const IdPayCompletionScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const isLoading = useSelector(isLoadingSelector);

  const handleClosePress = () => machine.send({ type: "close" });

  useHeaderSecondLevel({
    title: I18n.t("idpay.onboarding.headerTitle"),
    canGoBack: isLoading,
    headerShown: isLoading
  });

  if (isLoading) {
    return (
      <SafeAreaView style={IOStyles.flex}>
        <LoadingSpinnerOverlay isLoading />
      </SafeAreaView>
    );
  }

  return (
    <OperationResultScreenContent
      title={I18n.t("idpay.onboarding.success.requestSent.title")}
      subtitle={I18n.t("idpay.onboarding.success.requestSent.body")}
      action={{
        label: I18n.t("idpay.onboarding.success.button.continue"),
        accessibilityLabel: I18n.t("idpay.onboarding.success.button.continue"),
        onPress: handleClosePress
      }}
      pictogram="success"
    />
  );
};

export default IdPayCompletionScreen;
