import { useCallback, useMemo } from "react";
import { IOToast } from "@pagopa/io-app-design-system";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { IOScrollViewActions } from "../../../components/ui/IOScrollView";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isLoadingPnActivationSelector } from "../store/reducers/activation";
import I18n from "../../../i18n";
import { pnActivationUpsert } from "../store/actions";
import { loadServicePreference } from "../../services/details/store/actions/preference";
import * as analytics from "../../services/common/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackPNServiceActivated,
  trackPNServiceDeactivated
} from "../analytics";
import {
  isPnAppVersionSupportedSelector,
  isPnEnabledSelector
} from "../../../store/reducers/backendStatus/remoteConfig";
import { openAppStoreUrl } from "../../../utils/url";
import { useServicePreferenceByChannel } from "../../services/details/hooks/useServicePreference";

/**
 * Hook to handle the PN activation/deactivation
 */
const usePnActivation = (serviceId: ServiceId) => {
  const dispatch = useIODispatch();

  const isLoadingPnActivation = useIOSelector(isLoadingPnActivationSelector);

  const handleActivationFailure = useCallback(() => {
    dispatch(loadServicePreference.request(serviceId));
    IOToast.error(I18n.t("features.pn.service.toast.error"));
  }, [dispatch, serviceId]);

  const handleActivationSuccess = useCallback(
    (status: boolean) => {
      dispatch(loadServicePreference.request(serviceId));
      if (status) {
        IOToast.success(I18n.t("features.pn.service.toast.activated"));
      }
    },
    [dispatch, serviceId]
  );

  const activationHandler = useCallback(
    (status: boolean) => {
      analytics.trackSpecialServiceStatusChanged({
        is_active: status,
        service_id: serviceId
      });

      dispatch(
        pnActivationUpsert.request({
          value: status,
          onSuccess: () => handleActivationSuccess(status),
          onFailure: handleActivationFailure
        })
      );
    },
    [dispatch, handleActivationFailure, handleActivationSuccess, serviceId]
  );

  return {
    activationHandler,
    isLoadingPnActivation
  };
};

/**
 * This hook determines and returns the appropriate primary action prop
 * for activating and deactivating the PN service.
 */
export const useSpecialCtaPn = (
  serviceId: ServiceId,
  activate: boolean = false
): IOScrollViewActions["primary"] | undefined => {
  const isPnEnabled = useIOSelector(isPnEnabledSelector);
  const isPnSupported = useIOSelector(isPnAppVersionSupportedSelector);

  const { activationHandler, isLoadingPnActivation } =
    usePnActivation(serviceId);

  const { isLoadingServicePreferenceByChannel, servicePreferenceByChannel } =
    useServicePreferenceByChannel("inbox");

  const isLoading =
    isLoadingServicePreferenceByChannel || isLoadingPnActivation;

  // If the inbox channel is enabled, then the special service is active
  const isServiceActive = servicePreferenceByChannel ?? false;

  useOnFirstRender(
    () => {
      if (isServiceActive) {
        trackPNServiceActivated();
      } else {
        trackPNServiceDeactivated();
      }

      // Automatically activates the service if the `activate` flag is set
      if (activate) {
        activationHandler(true);
      }
    },
    () => isPnEnabled && isPnSupported
  );

  return useMemo(() => {
    // if pn is not enabled or the inbox channel is undefined
    // then the special service is not available
    if (!isPnEnabled || servicePreferenceByChannel === undefined) {
      return undefined;
    }

    if (!isPnSupported) {
      return {
        label: I18n.t("btnUpdateApp"),
        onPress: () => openAppStoreUrl()
      };
    }

    if (!isServiceActive) {
      return {
        label: I18n.t("features.pn.service.activate"),
        loading: isLoading,
        onPress: () => activationHandler(true)
      };
    }

    return {
      color: "danger",
      label: I18n.t("features.pn.service.deactivate"),
      loading: isLoading,
      onPress: () => activationHandler(false)
    };
  }, [
    activationHandler,
    isLoading,
    isPnEnabled,
    isPnSupported,
    isServiceActive,
    servicePreferenceByChannel
  ]);
};
