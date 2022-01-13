import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { constNull } from "fp-ts/lib/function";
import { Label } from "../../../../components/core/typography/Label";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { servicePreferenceSelector } from "../../../../store/reducers/entities/services/servicePreference";
import { isServicePreferenceResponseSuccess } from "../../../../types/services/ServicePreferenceResponse";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { loadAvailableBonuses } from "../../bonusVacanze/store/actions/bonusVacanze";
import { cgnActivationStart } from "../store/actions/activation";

type Props = {
  serviceId: ServiceId;
};
const CgnServiceCTA = (props: Props) => {
  const dispatch = useIODispatch();
  const servicePreference = useIOSelector(servicePreferenceSelector);

  const servicePreferenceValue = pot.getOrElse(servicePreference, undefined);
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

  return isServiceActive ? (
    // TODO onPress handler will be implemented once the unsubscribe API will be published by backend repository
    <ButtonDefaultOpacity block bordered danger onPress={constNull}>
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
