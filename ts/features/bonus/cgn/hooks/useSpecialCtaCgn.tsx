import { constNull } from "fp-ts/lib/function";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Alert, Platform } from "react-native";
import { IOToast } from "@pagopa/io-app-design-system";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { cgnUnsubscribeSelector } from "../store/reducers/unsubscribe";
import { fold, isLoading } from "../../../../common/model/RemoteValue";
import I18n from "../../../../i18n";
import * as analytics from "../../../services/common/analytics";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";
import { loadAvailableBonuses } from "../../common/store/actions/availableBonusesTypes";
import { cgnActivationStart } from "../store/actions/activation";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import { loadServicePreference } from "../../../services/details/store/actions/preference";
import { isCGNEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { useServicePreferenceByChannel } from "../../../services/details/hooks/useServicePreference";

/**
 * Hook to handle the CGN activation/deactivation
 */
const useCgnActivation = (serviceId: ServiceId) => {
  const isFirstRender = useRef<boolean>(true);

  const dispatch = useIODispatch();

  const unsubscriptionStatus = useIOSelector(cgnUnsubscribeSelector);

  const isLoadingCgnActivation = isLoading(unsubscriptionStatus);

  useEffect(() => {
    if (!isFirstRender.current) {
      fold(
        unsubscriptionStatus,
        constNull,
        constNull,
        () => {
          IOToast.success(I18n.t("bonus.cgn.activation.deactivate.toast"));
          dispatch(loadServicePreference.request(serviceId));
        },
        () => IOToast.error(I18n.t("wallet.delete.failed"))
      );
    }
    // eslint-disable-next-line functional/immutable-data
    isFirstRender.current = false;
  }, [unsubscriptionStatus, dispatch, serviceId]);

  const unsubscribeHandler = useCallback(
    () =>
      Alert.alert(
        I18n.t("bonus.cgn.activation.deactivate.alert.title"),
        I18n.t("bonus.cgn.activation.deactivate.alert.message"),
        [
          {
            text:
              Platform.OS === "ios"
                ? I18n.t(`wallet.delete.ios.confirm`)
                : I18n.t(`wallet.delete.android.confirm`),
            style: "destructive",
            onPress: () => {
              analytics.trackSpecialServiceStatusChanged({
                is_active: false,
                service_id: serviceId
              });
              dispatch(cgnUnsubscribe.request());
            }
          },
          {
            text: I18n.t("global.buttons.cancel"),
            style: "default"
          }
        ],
        { cancelable: false }
      ),
    [dispatch, serviceId]
  );

  const subscribeHandler = useCallback(() => {
    analytics.trackServicesCgnStartRequest(serviceId);
    dispatch(loadAvailableBonuses.request());
    dispatch(cgnActivationStart());
  }, [dispatch, serviceId]);

  return {
    isLoadingCgnActivation,
    unsubscribeHandler,
    subscribeHandler
  };
};

/**
 * This hook determines and returns the appropriate primary action prop
 * for activating and deactivating the CGN service.
 */
export const useSpecialCtaCgn = (
  serviceId: ServiceId
): IOScrollViewActions["primary"] | undefined => {
  const isCgnEnabled = useIOSelector(isCGNEnabledSelector);

  const { isLoadingCgnActivation, subscribeHandler, unsubscribeHandler } =
    useCgnActivation(serviceId);

  const { isLoadingServicePreferenceByChannel, servicePreferenceByChannel } =
    useServicePreferenceByChannel("inbox");

  const isLoading =
    isLoadingServicePreferenceByChannel || isLoadingCgnActivation;

  // If the inbox channel is enabled, then the special service is active
  const isServiceActive = servicePreferenceByChannel ?? false;

  return useMemo(() => {
    // if cgn is not enabled or the inbox channel is undefined
    // then the special service is not available
    if (!isCgnEnabled || servicePreferenceByChannel === undefined) {
      return undefined;
    }

    if (!isServiceActive) {
      return {
        label: I18n.t("bonus.cgn.cta.activeBonus"),
        loading: isLoading,
        onPress: subscribeHandler,
        testID: "service-activate-bonus-button"
      };
    }

    return {
      color: "danger",
      label: I18n.t("bonus.cgn.cta.deactivateBonus"),
      loading: isLoading,
      onPress: unsubscribeHandler,
      testID: "service-cgn-deactivate-bonus-button"
    };
  }, [
    isCgnEnabled,
    isLoading,
    isServiceActive,
    servicePreferenceByChannel,
    subscribeHandler,
    unsubscribeHandler
  ]);
};
