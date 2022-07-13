import React, { Dispatch } from "react";
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

type Props = {
  serviceId: ServiceId;
};

const LoadingButton = () => (
  <ButtonDefaultOpacity
    block
    primary
    style={{ backgroundColor: IOColors.greyLight, width: "100%" }}
  >
    <ActivityIndicator
      animating={true}
      size={"small"}
      color={IOColors.bluegreyDark}
      accessible={true}
      accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
      accessibilityLabel={I18n.t(
        "global.accessibility.activityIndicator.label"
      )}
      importantForAccessibility={"no-hide-descendants"}
    />
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
    onPress={() => props.dispatch(pnActivationUpsert.request(false))}
  >
    <Label color={"white"}>{I18n.t("features.pn.service.deactivate")}</Label>
  </ButtonDefaultOpacity>
);

const PnServiceCTA = (props: Props) => {
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

  return pot.fold(
    servicePreference,
    () => null,
    () => <LoadingButton />,
    _ => <LoadingButton />,
    _ => null,
    _ =>
      isServiceActive ? (
        <DeactivateButton dispatch={dispatch} />
      ) : (
        <ActivateButton dispatch={dispatch} />
      ),
    _ => <LoadingButton />,
    (_, __) => <LoadingButton />,
    // eslint-disable-next-line sonarjs/no-identical-functions
    _ =>
      isServiceActive ? (
        <DeactivateButton dispatch={dispatch} />
      ) : (
        <ActivateButton dispatch={dispatch} />
      )
  );
};

export default PnServiceCTA;
