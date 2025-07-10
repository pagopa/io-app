import { SafeAreaView } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { areNotificationPermissionsEnabledSelector } from "../../../appearanceSettings/store/selectors";
import { isLoadingSelector } from "../../common/machine/selectors";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { setIdPayOnboardingSucceeded } from "../../wallet/store/actions";

const IdPayCompletionScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();
  const dispatch = useIODispatch();

  const isLoading = useSelector(isLoadingSelector);
  const isPushNotificationEnabled = useIOSelector(
    areNotificationPermissionsEnabledSelector
  );

  const handleClosePress = () => machine.send({ type: "close" });

  useHeaderSecondLevel({
    title: I18n.t("idpay.onboarding.headerTitle"),
    canGoBack: isLoading,
    headerShown: isLoading
  });

  // Send the event to check notification status only on the first render
  useOnFirstRender(() => {
    dispatch(setIdPayOnboardingSucceeded(true));
    machine.send({
      type: "update-notification-status",
      isPushNotificationEnabled
    });
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
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
      enableAnimatedPictogram
      loop={false}
    />
  );
};

export default IdPayCompletionScreen;
