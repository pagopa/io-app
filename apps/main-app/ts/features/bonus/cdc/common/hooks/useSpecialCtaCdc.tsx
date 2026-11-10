import { IOToast } from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useMemo } from "react";

import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { useIOSelector } from "../../../../../store/hooks";
import { isCdcAppVersionSupportedSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isMixpanelEnabled as isMixpanelEnabledSelector } from "../../../../../store/reducers/persistedPreferences.ts";
import { getDeviceId } from "../../../../../utils/device.ts";
import { useFIMSRemoteServiceConfiguration } from "../../../../fims/common/hooks";
import * as analytics from "../../analytics";
import { cdcWalletVisibilityConfigSelector } from "../store/selectors/remoteConfig.ts";

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
    startFIMSAuthenticationFlow(
      I18n.t("bonus.cdc.goToService"),
      url.toString()
    );
  }, [cdcWalletConfig, isMixpanelEnabled, startFIMSAuthenticationFlow]);

  return {
    subscribeHandler
  };
};

/**
 * This hook determines and returns the appropriate primary action prop for
 * going to the CDC service.
 */
export const useSpecialCtaCdc = ():
  | IOScrollViewActions["primary"]
  | undefined => {
  const isCdcEnabled = useIOSelector(isCdcAppVersionSupportedSelector);

  const { subscribeHandler } = useCdcGoToService();

  return useMemo(() => {
    if (!isCdcEnabled) {
      return undefined;
    }

    return {
      label: I18n.t("bonus.cdc.goToService"),
      onPress: subscribeHandler,
      testID: "service-go-to-service-button"
    };
  }, [isCdcEnabled, subscribeHandler]);
};
