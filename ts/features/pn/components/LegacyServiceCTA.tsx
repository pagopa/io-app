import React, { useEffect, useState } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ActivityIndicator } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Label } from "../../../components/core/typography/Label";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { servicePreferenceSelector } from "../../services/store/reducers/servicePreference";
import { isServicePreferenceResponseSuccess } from "../../services/types/ServicePreferenceResponse";
import { AppDispatch } from "../../../App";
import { pnActivationUpsert } from "../store/actions";
import { pnActivationSelector } from "../store/reducers/activation";
import { showToast } from "../../../utils/showToast";
import { Link } from "../../../components/core/typography/Link";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { loadServicePreference } from "../../services/store/actions";
import {
  trackPNServiceActivated,
  trackPNServiceDeactivated,
  trackPNServiceStartActivation,
  trackPNServiceStartDeactivation
} from "../analytics";

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
      props.dispatch(pnActivationUpsert.request({ value: true }));
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
      props.dispatch(pnActivationUpsert.request({ value: false }));
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
const LegacyPnServiceCTA = ({ serviceId, activate }: Props) => {
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
        showToast(I18n.t("features.pn.service.toast.error"), "danger");
      } else {
        dispatch(loadServicePreference.request(serviceId));
        if (pot.toUndefined(serviceActivation)) {
          showToast(I18n.t("features.pn.service.toast.activated"), "success");
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
        () => void dispatch(pnActivationUpsert.request({ value: true }))
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

export default LegacyPnServiceCTA;
