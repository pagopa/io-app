import React, { useEffect, useState } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import {
  ButtonSolid,
  IOToast,
  ListItemAction
} from "@pagopa/io-app-design-system";
import { LoadingIndicator } from "../../../components/ui/LoadingIndicator";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { servicePreferenceSelector } from "../../services/details/store/reducers/servicePreference";
import { isServicePreferenceResponseSuccess } from "../../services/details/types/ServicePreferenceResponse";
import { AppDispatch } from "../../../App";
import { pnActivationUpsert } from "../store/actions";
import { pnActivationSelector } from "../store/reducers/activation";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { loadServicePreference } from "../../services/details/store/actions/preference";
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

const LoadingButton = () => <LoadingIndicator />;

const ActivateButton = (props: { dispatch: AppDispatch }) => (
  <ButtonSolid
    fullWidth
    onPress={() => {
      trackPNServiceStartActivation();
      props.dispatch(pnActivationUpsert.request({ value: true }));
    }}
    label={I18n.t("features.pn.service.activate")}
  />
);

const DeactivateButton = (props: { dispatch: AppDispatch }) => (
  <ListItemAction
    variant="danger"
    label={I18n.t("features.pn.service.deactivate")}
    accessibilityLabel={I18n.t("features.pn.service.deactivate")}
    onPress={() => {
      trackPNServiceStartDeactivation();
      props.dispatch(pnActivationUpsert.request({ value: false }));
    }}
  />
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
        () => void dispatch(pnActivationUpsert.request({ value: true }))
      )
    );
  });

  if (!servicePreferenceValue || servicePreferenceValue.id !== serviceId) {
    return null;
  }

  return isLoading ? (
    <LoadingButton />
  ) : isServiceActive ? (
    <DeactivateButton dispatch={dispatch} />
  ) : (
    <ActivateButton dispatch={dispatch} />
  );
};

export default LegacyPnServiceCTA;
