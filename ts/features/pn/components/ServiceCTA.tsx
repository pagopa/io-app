import { IOColors, IOToast } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { identity, pipe } from "fp-ts/lib/function";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { AppDispatch } from "../../../App";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Label } from "../../../components/core/typography/Label";
import { Link } from "../../../components/core/typography/Link";
import I18n from "../../../i18n";
import { loadServicePreference } from "../../../store/actions/services/servicePreference";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { servicePreferenceSelector } from "../../../store/reducers/entities/services/servicePreference";
import { isServicePreferenceResponseSuccess } from "../../../types/services/ServicePreferenceResponse";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackPNServiceActivated,
  trackPNServiceDeactivated,
  trackPNServiceStartActivation,
  trackPNServiceStartDeactivation
} from "../analytics";
import { pnActivationUpsert } from "../store/actions";
import { pnActivationSelector } from "../store/reducers/activation";

type Props = {
  serviceId: ServiceId;
  activate?: boolean;
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
    onPress={() => {
      trackPNServiceStartActivation();
      props.dispatch(pnActivationUpsert.request(true));
    }}
  >
    <Label color={"white"}>{I18n.t("features.pn.service.activate")}</Label>
  </ButtonDefaultOpacity>
);

const DeactivateButton = (props: { dispatch: AppDispatch }) => (
  <ButtonDefaultOpacity
    block
    primary
    onPress={() => {
      trackPNServiceStartDeactivation();
      props.dispatch(pnActivationUpsert.request(false));
    }}
    style={{
      backgroundColor: IOColors.white
    }}
  >
    <Link weight={"SemiBold"} color={"red"}>
      {I18n.t("features.pn.service.deactivate")}
    </Link>
  </ButtonDefaultOpacity>
);

// eslint-disable-next-line sonarjs/cognitive-complexity
const ServiceCTA = ({ serviceId, activate }: Props) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const dispatch = useIODispatch();
  const serviceActivation = useIOSelector(pnActivationSelector);
  const servicePreference = useIOSelector(servicePreferenceSelector);
  const servicePreferenceValue = pot.getOrElse(servicePreference, undefined);

  const isLoading =
    pot.isLoading(servicePreference) ||
    pot.isLoading(serviceActivation) ||
    pot.isUpdating(serviceActivation);

  const isServiceActive =
    servicePreferenceValue &&
    isServicePreferenceResponseSuccess(servicePreferenceValue) &&
    servicePreferenceValue.value.inbox;

  useEffect(() => {
    const wasUpdating = isUpdating;
    const isStillUpdating = pot.isUpdating(serviceActivation);
    const isError = pot.isError(serviceActivation);
    if (wasUpdating && !isStillUpdating) {
      if (isError) {
        IOToast.error(I18n.t("features.pn.service.toast.error"));
      } else {
        dispatch(loadServicePreference.request(serviceId));
        if (pot.toUndefined(serviceActivation)) {
          IOToast.success(I18n.t("features.pn.service.toast.activated"));
        }
      }
    }
    setIsUpdating(isStillUpdating);
  }, [isUpdating, dispatch, serviceId, serviceActivation, isServiceActive]);

  useOnFirstRender(() => {
    pipe(
      isServiceActive,
      O.fromNullable,
      O.filter(identity),
      O.fold(
        () => trackPNServiceDeactivated(),
        () => trackPNServiceActivated()
      )
    );
    pipe(
      activate,
      O.fromNullable,
      O.filter(identity),
      O.fold(
        () => undefined,
        () => void dispatch(pnActivationUpsert.request(true))
      )
    );
  });

  if (!servicePreferenceValue || servicePreferenceValue.id !== serviceId) {
    return null;
  }

  return isLoading ? (
    <LoadingButton isServiceActive={isServiceActive ?? false} />
  ) : isServiceActive ? (
    <DeactivateButton dispatch={dispatch} />
  ) : (
    <ActivateButton dispatch={dispatch} />
  );
};

export default ServiceCTA;
