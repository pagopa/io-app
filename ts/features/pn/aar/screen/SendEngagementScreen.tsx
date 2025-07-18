import { useCallback, useState } from "react";
import { useIOToast } from "@pagopa/io-app-design-system";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SendEngagementComponent } from "../components/SendEngagementComponent";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { pnActivationUpsert } from "../../store/actions";
import { areNotificationPermissionsEnabledSelector } from "../../../pushNotifications/store/reducers/environment";

export const SendEngagementScreen = () => {
  const [screenStatus, setScreenStatus] = useState<
    "Waiting" | "Activating" | "Failed"
  >("Waiting");
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const toast = useIOToast();
  const notificationPermissionsEnabled = useIOSelector(
    areNotificationPermissionsEnabledSelector
  );

  const onActivationSucceeded = useCallback(() => {
    toast.success(I18n.t("features.pn.aar.serviceActivation.serviceActivated"));
    if (notificationPermissionsEnabled) {
      navigation.popToTop();
    } else {
      // TODO navigate to push notifications screen
    }
  }, [navigation, notificationPermissionsEnabled, toast]);
  const onActivationFailed = useCallback(() => {
    navigation.setOptions({
      headerShown: false
    });
    setScreenStatus("Failed");
  }, [navigation]);

  const onActivateService = useCallback(
    (isRetry: boolean = false) => {
      if (isRetry) {
        navigation.setOptions({
          headerShown: true
        });
      }
      setScreenStatus("Activating");
      dispatch(
        pnActivationUpsert.request({
          value: true,
          onSuccess: onActivationSucceeded,
          onFailure: onActivationFailed
        })
      );
    },
    [dispatch, navigation, onActivationFailed, onActivationSucceeded]
  );
  const onClose = useCallback(() => {
    if (screenStatus !== "Activating") {
      navigation.popToTop();
    }
  }, [navigation, screenStatus]);
  if (screenStatus === "Failed") {
    return (
      <OperationResultScreenContent
        pictogram="umbrella"
        title={I18n.t("features.pn.aar.serviceActivation.failure")}
        action={{
          label: I18n.t("global.buttons.retry"),
          onPress: () => onActivateService(true)
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.close"),
          onPress: onClose
        }}
      />
    );
  }
  return (
    <SendEngagementComponent
      isLoading={screenStatus === "Activating"}
      onPrimaryAction={onActivateService}
      onClose={onClose}
    />
  );
};
