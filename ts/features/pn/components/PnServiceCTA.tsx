import React, { useEffect } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ActivityIndicator } from "react-native";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Label } from "../../../components/core/typography/Label";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { servicePreferenceSelector } from "../../../store/reducers/entities/services/servicePreference";
import { isServicePreferenceResponseSuccess } from "../../../types/services/ServicePreferenceResponse";
import { IOColors } from "../../../components/core/variables/IOColors";
import { AppDispatch } from "../../../App";
import { pnActivationUpsert } from "../store/actions/service";
import { pnActivationSelector } from "../store/reducers/activation";
import { showToast } from "../../../utils/showToast";
import { Link } from "../../../components/core/typography/Link";

type Props = {
  serviceId: ServiceId;
};

const LoadingIndicator = () => (
  <ActivityIndicator
    animating={true}
    size={"small"}
    color={IOColors.bluegreyDark}
    accessible={true}
    accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
    accessibilityLabel={I18n.t("global.accessibility.activityIndicator.label")}
    importantForAccessibility={"no-hide-descendants"}
  />
);

const LoadingButton = (props: { isServiceActive: boolean }) => (
  <ButtonDefaultOpacity
    block
    primary
    style={{
      backgroundColor: props.isServiceActive
        ? IOColors.white
        : IOColors.greyLight,
      width: "100%"
    }}
  >
    <LoadingIndicator />
  </ButtonDefaultOpacity>
);

const ActivateButton = (props: { dispatch: AppDispatch }) => (
  <ButtonDefaultOpacity
    block
    primary
    onPress={() => props.dispatch(pnActivationUpsert.request(true))}
  >
    <Label color={"white"}>{I18n.t("features.pn.service.activate")}</Label>
  </ButtonDefaultOpacity>
);

const DeactivateButton = (props: { dispatch: AppDispatch }) => (
  <ButtonDefaultOpacity
    block
    primary
    onPress={() => props.dispatch(pnActivationUpsert.request(true))}
    style={{
      backgroundColor: IOColors.white
    }}
  >
    <Link weight={"SemiBold"} color={"red"}>
      {I18n.t("features.pn.service.deactivate")}
    </Link>
  </ButtonDefaultOpacity>
);

const PnServiceCTA = (props: Props) => {
  const dispatch = useIODispatch();
  const serviceActivation = useIOSelector(pnActivationSelector);
  const servicePreference = useIOSelector(servicePreferenceSelector);
  const servicePreferenceValue = pot.getOrElse(servicePreference, undefined);

  const isLoading =
    pot.isLoading(servicePreference) ||
    pot.isLoading(serviceActivation) ||
    pot.isUpdating(serviceActivation);

  const isError = pot.isError(serviceActivation);
  useEffect(() => {
    if (isError) {
      showToast(I18n.t("features.pn.service.toast.error"), "danger");
    }
  }, [isError]);

  const didActivate = pot.fold(
    serviceActivation,
    () => false,
    () => false,
    _ => false,
    _ => false,
    _ => _,
    _ => false,
    (_, __) => false,
    (_, __) => false
  );
  useEffect(() => {
    if (didActivate) {
      showToast(I18n.t("features.pn.service.toast.activated"), "success");
    }
  }, [didActivate]);

  const isServiceActive =
    servicePreferenceValue &&
    isServicePreferenceResponseSuccess(servicePreferenceValue) &&
    servicePreferenceValue.value.inbox;

  if (
    !servicePreferenceValue ||
    servicePreferenceValue.id !== props.serviceId
  ) {
    return null;
  }

  return isLoading ? (
    <LoadingButton isServiceActive />
  ) : isServiceActive ? (
    <DeactivateButton dispatch={dispatch} />
  ) : (
    <ActivateButton dispatch={dispatch} />
  );
};

export default PnServiceCTA;
