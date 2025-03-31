import { constVoid } from "fp-ts/lib/function";
import { useCallback, useMemo } from "react";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isCdcEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { useServicePreferenceByChannel } from "../../../services/details/hooks/useServicePreference";
import { CDC_ROUTES } from "../../cdc/navigation/routes";
import { loadAvailableBonuses } from "../../common/store/actions/availableBonusesTypes";

/**
 * Hook to handle the CDC activation/deactivation
 */
const useCdcActivation = () => {
  const navigation = useIONavigation();

  const dispatch = useIODispatch();

  const unsubscribeHandler = () => constVoid;

  const subscribeHandler = useCallback(() => {
    dispatch(loadAvailableBonuses.request());
    navigation.navigate(CDC_ROUTES.CDC_MAIN, {
      screen: CDC_ROUTES.CDC_INFORMATION_TOS
    });
  }, [dispatch, navigation]);

  return {
    unsubscribeHandler,
    subscribeHandler
  };
};

/**
 * This hook determines and returns the appropriate primary action prop
 * for activating and deactivating the CDC service.
 */
export const useSpecialCtaCdc = ():
  | IOScrollViewActions["primary"]
  | undefined => {
  const isCdcEnabled = useIOSelector(isCdcEnabledSelector);

  const { subscribeHandler, unsubscribeHandler } = useCdcActivation();

  const { isLoadingServicePreferenceByChannel, servicePreferenceByChannel } =
    useServicePreferenceByChannel("inbox");

  const loading = isLoadingServicePreferenceByChannel;

  // If the inbox channel is enabled, then the special service is active
  const isServiceActive = servicePreferenceByChannel ?? false;

  return useMemo(() => {
    // if cdc is not enabled or the inbox channel is undefined
    // then the special service is not available
    if (!isCdcEnabled || servicePreferenceByChannel === undefined) {
      return undefined;
    }

    if (!isServiceActive) {
      return {
        label: "Richiedi Carta della Cultura",
        loading,
        onPress: subscribeHandler,
        testID: "service-activate-bonus-button"
      };
    }

    return {
      color: "danger",
      label: I18n.t("bonus.cgn.cta.deactivateBonus"),
      loading,
      onPress: unsubscribeHandler,
      testID: "service-cdc-deactivate-bonus-button"
    };
  }, [
    isCdcEnabled,
    loading,
    isServiceActive,
    servicePreferenceByChannel,
    subscribeHandler,
    unsubscribeHandler
  ]);
};
