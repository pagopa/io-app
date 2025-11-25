import { useCallback, useEffect, useMemo } from "react";
import I18n from "i18next";
import { IOToast } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { isCdcAppVersionSupportedSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { CDC_ROUTES } from "../navigation/routes";
import * as analytics from "../../analytics";
import { loadAvailableBonuses } from "../../../common/store/actions/availableBonusesTypes";
import { getDeviceId } from "../../../../../utils/device.ts";
import { cdcWalletVisibilityConfigSelector } from "../store/selectors/remoteConfig.ts";
import { isMixpanelEnabled as isMixpanelEnabledSelector } from "../../../../../store/reducers/persistedPreferences.ts";
import { useFIMSRemoteServiceConfiguration } from "../../../../fims/common/hooks";
import { getCdcStatusWallet } from "../../wallet/store/actions";
import { cdcStatusSelector } from "../../wallet/store/selectors";
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

const useCdcGoToService = () => {
  const cdcWalletConfig = useIOSelector(cdcWalletVisibilityConfigSelector);
  const isMixpanelEnabled = useIOSelector(isMixpanelEnabledSelector) ?? false;

  const { startFIMSAuthenticationFlow } =
    useFIMSRemoteServiceConfiguration("cdc-onboarding");

  const subscribeHandler = useCallback(() => {
    if (!cdcWalletConfig?.url) {
      IOToast.error(I18n.t("global.genericError"));
      return;
    }
    const url = new URL(cdcWalletConfig.url);
    if (cdcWalletConfig.includeDeviceId && isMixpanelEnabled) {
      url.searchParams.set("device", getDeviceId());
    }
    analytics.trackCdcGoToService();
    startFIMSAuthenticationFlow(I18n.t("bonus.cdc.request"), url.toString());
  }, [cdcWalletConfig, isMixpanelEnabled, startFIMSAuthenticationFlow]);

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
  const cdcStatus = useIOSelector(cdcStatusSelector);

  const dispatch = useIODispatch();

  useEffect(() => {
    dispatch(getCdcStatusWallet.request());
  }, [dispatch]);

  const { subscribeHandler: activationHandler } = useCdcActivation();
  const { subscribeHandler: goToServiceHandler } = useCdcGoToService();

  return useMemo(() => {
    if (!isCdcEnabled || pot.isLoading(cdcStatus)) {
      return undefined;
    }

    const hasCdcStatus = pot.isSome(cdcStatus);

    if (hasCdcStatus) {
      return {
        label: I18n.t("bonus.cdc.goToService"),
        onPress: goToServiceHandler,
        testID: "service-activate-bonus-button"
      };
    }

    return {
      label: I18n.t("bonus.cdc.request"),
      onPress: activationHandler,
      testID: "service-activate-bonus-button"
    };
  }, [isCdcEnabled, cdcStatus, activationHandler, goToServiceHandler]);
};
