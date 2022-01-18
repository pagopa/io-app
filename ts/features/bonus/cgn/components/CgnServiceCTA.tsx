import * as React from "react";
import { useEffect, useRef } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Alert } from "react-native";
import { Label } from "../../../../components/core/typography/Label";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { servicePreferenceSelector } from "../../../../store/reducers/entities/services/servicePreference";
import { isServicePreferenceResponseSuccess } from "../../../../types/services/ServicePreferenceResponse";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { loadAvailableBonuses } from "../../bonusVacanze/store/actions/bonusVacanze";
import { cgnActivationStart } from "../store/actions/activation";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";
import { isReady } from "../../bpd/model/RemoteValue";
import { showToast } from "../../../../utils/showToast";
import { cgnUnsubscribeSelector } from "../store/reducers/unsubscribe";
import { loadServicePreference } from "../../../../store/actions/services/servicePreference";

type Props = {
  serviceId: ServiceId;
};
const CgnServiceCTA = (props: Props) => {
  const isFirstRender = useRef<boolean>(true);
  const dispatch = useIODispatch();
  const servicePreference = useIOSelector(servicePreferenceSelector);
  const unsubsriptionStatus = useIOSelector(cgnUnsubscribeSelector);

  const servicePreferenceValue = pot.getOrElse(servicePreference, undefined);

  useEffect(() => {
    if (isReady(unsubsriptionStatus) && !isFirstRender.current) {
      showToast(I18n.t("bonus.cgn.activation.deactivate.toast"), "success");
      dispatch(loadServicePreference.request(props.serviceId));
    }
    // eslint-disable-next-line functional/immutable-data
    isFirstRender.current = false;
  }, [unsubsriptionStatus]);

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

  return isServiceActive ? (
    <ButtonDefaultOpacity block bordered danger onPress={requestUnsubscription}>
      <Label color={"red"}>{I18n.t("bonus.cgn.cta.deactivateBonus")}</Label>
    </ButtonDefaultOpacity>
  ) : (
    <ButtonDefaultOpacity
      block
      primary
      onPress={() => {
        dispatch(loadAvailableBonuses.request());
        dispatch(cgnActivationStart());
      }}
    >
      <Label color={"white"}>{I18n.t("bonus.cgn.cta.activeBonus")}</Label>
    </ButtonDefaultOpacity>
  );
};
export default CgnServiceCTA;
