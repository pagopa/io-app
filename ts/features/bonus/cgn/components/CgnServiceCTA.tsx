import { useCallback, useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import { ButtonSolid, IOToast } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  servicePreferencePotSelector,
  servicePreferenceResponseSuccessSelector
} from "../../../services/details/store/reducers";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { cgnActivationStart } from "../store/actions/activation";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";
import { fold, isLoading } from "../../../../common/model/RemoteValue";
import { cgnUnsubscribeSelector } from "../store/reducers/unsubscribe";
import { loadServicePreference } from "../../../services/details/store/actions/preference";
import { loadAvailableBonuses } from "../../common/store/actions/availableBonusesTypes";
import * as analytics from "../../../services/common/analytics";

type CgnServiceCtaProps = {
  serviceId: ServiceId;
};

export const CgnServiceCta = ({ serviceId }: CgnServiceCtaProps) => {
  const isFirstRender = useRef<boolean>(true);

  const dispatch = useIODispatch();

  const servicePreferenceResponseSuccess = useIOSelector(
    servicePreferenceResponseSuccessSelector
  );

  const servicePreferencePot = useIOSelector(servicePreferencePotSelector);

  const unsubscriptionStatus = useIOSelector(cgnUnsubscribeSelector);

  const isLoadingStatus =
    pot.isLoading(servicePreferencePot) || isLoading(unsubscriptionStatus);

  const isServiceActive =
    servicePreferenceResponseSuccess?.value.inbox ?? false;

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

  const handleUnsubscriptionStatus = useCallback(
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

  if (!servicePreferenceResponseSuccess) {
    return null;
  }

  if (isServiceActive) {
    return (
      <ButtonSolid
        fullWidth
        color="danger"
        accessibilityLabel={I18n.t("bonus.cgn.cta.deactivateBonus")}
        label={I18n.t("bonus.cgn.cta.deactivateBonus")}
        loading={isLoadingStatus}
        testID="service-cgn-deactivate-bonus-button"
        onPress={handleUnsubscriptionStatus}
      />
    );
  }

  return (
    <ButtonSolid
      fullWidth
      accessibilityLabel={I18n.t("bonus.cgn.cta.activeBonus")}
      label={I18n.t("bonus.cgn.cta.activeBonus")}
      loading={isLoadingStatus}
      testID="service-activate-bonus-button"
      onPress={() => {
        analytics.trackServicesCgnStartRequest(serviceId);
        dispatch(loadAvailableBonuses.request());
        dispatch(cgnActivationStart());
      }}
    />
  );
};
