import { useCallback, useMemo } from "react";
import I18n from "i18next";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { isCdcAppVersionSupportedSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { CDC_ROUTES } from "../navigation/routes";
import * as analytics from "../../analytics";
import { loadAvailableBonuses } from "../../../common/store/actions/availableBonusesTypes";
/**
 * Hook to handle the CDC flow request
 */
const useCdcActivation = () => {
  const navigation = useIONavigation();

  const dispatch = useIODispatch();

  const subscribeHandler = useCallback(() => {
    dispatch(loadAvailableBonuses.request());
    analytics.trackCdcRequestStart();
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
 * for activating the CDC service.
 */
export const useSpecialCtaCdc = ():
  | IOScrollViewActions["primary"]
  | undefined => {
  const isCdcEnabled = useIOSelector(isCdcAppVersionSupportedSelector);

  const { subscribeHandler } = useCdcActivation();

  return useMemo(() => {
    // if cdc is not enabled then the CTA is not available
    if (!isCdcEnabled) {
      return undefined;
    }

    return {
      label: I18n.t("bonus.cdc.request"),
      onPress: subscribeHandler,
      testID: "service-activate-bonus-button"
    };
  }, [isCdcEnabled, subscribeHandler]);
};
