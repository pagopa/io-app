import * as React from "react";
import { useEffect, useRef } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Alert } from "react-native";
import { constNull } from "fp-ts/lib/function";
import {
  ButtonOutline,
  ButtonSolid,
  IOToast
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { servicePreferenceSelector } from "../../../services/details/store/reducers/servicePreference";
import { isServicePreferenceResponseSuccess } from "../../../services/details/types/ServicePreferenceResponse";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { cgnActivationStart } from "../store/actions/activation";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";
import { fold, isLoading } from "../../../../common/model/RemoteValue";
import { cgnUnsubscribeSelector } from "../store/reducers/unsubscribe";
import { loadServicePreference } from "../../../services/details/store/actions/preference";
import ActivityIndicator from "../../../../components/ui/ActivityIndicator";
import { loadAvailableBonuses } from "../../common/store/actions/availableBonusesTypes";

type Props = {
  serviceId: ServiceId;
};
const LegacyCgnServiceCTA = (props: Props) => {
  const isFirstRender = useRef<boolean>(true);
  const dispatch = useIODispatch();
  const servicePreference = useIOSelector(servicePreferenceSelector);
  const unsubscriptionStatus = useIOSelector(cgnUnsubscribeSelector);

  const servicePreferenceValue = pot.getOrElse(servicePreference, undefined);

  useEffect(() => {
    if (!isFirstRender.current) {
      fold(
        unsubscriptionStatus,
        constNull,
        constNull,
        () => {
          IOToast.success(I18n.t("bonus.cgn.activation.deactivate.toast"));
          dispatch(loadServicePreference.request(props.serviceId));
        },
        () => {
          IOToast.error(I18n.t("global.genericError"));
        }
      );
    }
    // eslint-disable-next-line functional/immutable-data
    isFirstRender.current = false;
  }, [unsubscriptionStatus, dispatch, props.serviceId]);

  if (
    !servicePreferenceValue ||
    servicePreferenceValue.id !== props.serviceId
  ) {
    return null;
  }
  const isServiceActive =
    servicePreferenceValue &&
    isServicePreferenceResponseSuccess(servicePreferenceValue) &&
    servicePreferenceValue.value.inbox;

  const requestUnsubscription = () => {
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
    );
  };

  if (isServiceActive) {
    if (isLoading(unsubscriptionStatus)) {
      return <ActivityIndicator />;
    }
    return (
      <ButtonOutline
        fullWidth
        color="danger"
        label={I18n.t("bonus.cgn.cta.deactivateBonus")}
        testID="service-cgn-deactivate-bonus-button"
        onPress={requestUnsubscription}
      />
    );
  }
  return (
    <ButtonSolid
      fullWidth
      label={I18n.t("bonus.cgn.cta.activeBonus")}
      onPress={() => {
        dispatch(loadAvailableBonuses.request());
        dispatch(cgnActivationStart());
      }}
      testID="service-activate-bonus-button"
    />
  );
};
export default LegacyCgnServiceCTA;
