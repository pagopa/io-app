import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { areNotificationPermissionsEnabledSelector } from "../../../pushNotifications/store/reducers/environment";
import { isLoadingSelector } from "../../common/machine/selectors";
import {
  idPayInitiativeWaitingListGet,
  setIdPayOnboardingSucceeded
} from "../../wallet/store/actions";
import { trackIDPayOnboardingSuccess } from "../analytics";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { selectInitiative } from "../machine/selectors";

const IdPayCompletionScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();
  const dispatch = useIODispatch();

  const initiative = useSelector(selectInitiative);

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.getOrElse(() => "")
  );
  const isLoading = useSelector(isLoadingSelector);
  const isPushNotificationEnabled = useIOSelector(
    areNotificationPermissionsEnabledSelector
  );

  const handleClosePress = () => {
    dispatch(setIdPayOnboardingSucceeded(true));
    dispatch(idPayInitiativeWaitingListGet.request());
    machine.send({ type: "close" });
  };

  useHeaderSecondLevel({
    title: I18n.t("idpay.onboarding.headerTitle"),
    canGoBack: isLoading,
    headerShown: isLoading
  });

  // Send the event to check notification status only on the first render
  useOnFirstRender(() => {
    machine.send({
      type: "update-notification-status",
      isPushNotificationEnabled
    });

    trackIDPayOnboardingSuccess({
      initiativeId
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
      action={{
        label: I18n.t("idpay.onboarding.success.button.continue"),
        accessibilityLabel: I18n.t("idpay.onboarding.success.button.continue"),
        onPress: handleClosePress
      }}
      pictogram="success"
      subtitle={I18n.t("idpay.onboarding.success.requestSent.subtitle")}
      title={I18n.t("idpay.onboarding.success.requestSent.title")}
    />
  );
};

export default IdPayCompletionScreen;
