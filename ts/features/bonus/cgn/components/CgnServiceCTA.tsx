import React, { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { ButtonSolid, IOToast } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  servicePreferenceResponseSuccessSelector,
  servicePreferenceSelector
} from "../../../services/store/reducers/servicePreference";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { cgnActivationStart } from "../store/actions/activation";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";
import { fold, isLoading } from "../../../../common/model/RemoteValue";
import { cgnUnsubscribeSelector } from "../store/reducers/unsubscribe";
import { loadServicePreference } from "../../../services/store/actions";
import { loadAvailableBonuses } from "../../common/store/actions/availableBonusesTypes";

type CgnServiceCtaProps = {
  serviceId: ServiceId;
};

export const CgnServiceCta = ({ serviceId }: CgnServiceCtaProps) => {
  const isFirstRender = useRef<boolean>(true);

  const dispatch = useIODispatch();

  const servicePreferenceResponseSuccess = useIOSelector(
    servicePreferenceResponseSuccessSelector
  );

  const servicePreferencePot = useIOSelector(servicePreferenceSelector);

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
        () => IOToast.error(I18n.t("global.genericError"))
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
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("global.buttons.deactivate"),
            onPress: () => dispatch(cgnUnsubscribe.request())
          }
        ]
      ),
    [dispatch]
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
        dispatch(loadAvailableBonuses.request());
        dispatch(cgnActivationStart());
      }}
    />
  );
};
