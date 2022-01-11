import * as React from "react";
import { constNull } from "fp-ts/lib/function";
import { Label } from "../../../../components/core/typography/Label";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { servicePreferenceSelector } from "../../../../store/reducers/entities/services/servicePreference";
import { isStrictSome } from "../../../../utils/pot";
import { isServicePreferenceResponseSuccess } from "../../../../types/services/ServicePreferenceResponse";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { cgnActivationStart } from "../store/actions/activation";
import { loadAvailableBonuses } from "../../bonusVacanze/store/actions/bonusVacanze";

type Props = {
  serviceId: ServiceId;
};
const CgnServiceCTA = (props: Props) => {
  const dispatch = useIODispatch();
  const servicePreference = useIOSelector(servicePreferenceSelector);

  const isServiceActive =
    isStrictSome(servicePreference) &&
    isServicePreferenceResponseSuccess(servicePreference.value) &&
    servicePreference.value.value.inbox;

  if (
    !isStrictSome(servicePreference) ||
    (isStrictSome(servicePreference) &&
      servicePreference.value.id !== props.serviceId)
  ) {
    return <></>;
  }

  return isServiceActive ? (
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
