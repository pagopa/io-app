import { useCallback, useMemo } from "react";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isCdcAppVersionSupportedSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { useServicePreferenceByChannel } from "../../../services/details/hooks/useServicePreference";
import { loadAvailableBonuses } from "../../common/store/actions/availableBonusesTypes";
import { CDC_ROUTES } from "../navigation/routes";
/**
 * Hook to handle the CDC activation/deactivation
 */
const useCdcActivation = () => {
  const navigation = useIONavigation();

  const dispatch = useIODispatch();

  const subscribeHandler = useCallback(() => {
    dispatch(loadAvailableBonuses.request());
    navigation.navigate(CDC_ROUTES.CDC_MAIN, {
      screen: CDC_ROUTES.CDC_INFORMATION_TOS
    });
  }, [dispatch, navigation]);

  return {
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
  const isCdcEnabled = useIOSelector(isCdcAppVersionSupportedSelector);

  const { subscribeHandler } = useCdcActivation();

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
        label: I18n.t("bonus.cdc.request"),
        loading,
        onPress: subscribeHandler,
        testID: "service-activate-bonus-button"
      };
    }

    return undefined;
  }, [
    isCdcEnabled,
    loading,
    isServiceActive,
    servicePreferenceByChannel,
    subscribeHandler
  ]);
};
