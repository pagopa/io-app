import React, { useCallback } from "react";
import { ButtonSolid, IOToast } from "@pagopa/io-app-design-system";
import { constNull, identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  servicePreferenceResponseSuccessSelector,
  servicePreferenceSelector
} from "../../services/store/reducers/servicePreference";
import { pnActivationUpsert } from "../store/actions";
import { isLoadingPnActivationSelector } from "../store/reducers/activation";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { loadServicePreference } from "../../services/store/actions";
import {
  trackPNServiceActivated,
  trackPNServiceDeactivated,
  trackPNServiceStartActivation,
  trackPNServiceStartDeactivation
} from "../analytics";

type PnServiceCtaProps = {
  serviceId: ServiceId;
  activate?: boolean;
};

export const PnServiceCta = ({ serviceId, activate }: PnServiceCtaProps) => {
  const dispatch = useIODispatch();

  const servicePreferenceResponseSuccess = useIOSelector(
    servicePreferenceResponseSuccessSelector
  );

  const servicePreferencePot = useIOSelector(servicePreferenceSelector);

  const isLoadingPnActivation = useIOSelector(isLoadingPnActivationSelector);

  const isLoading =
    pot.isLoading(servicePreferencePot) || isLoadingPnActivation;

  const isServiceActive =
    servicePreferenceResponseSuccess?.value.inbox ?? false;

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
        constNull,
        () =>
          void dispatch(
            pnActivationUpsert.request({
              value: true,
              onSuccess: () => handleActivationSuccess(true),
              onFailure: handleActivationFailure
            })
          )
      )
    );
  });

  const handleActivationSuccess = useCallback(
    (status: boolean) => {
      dispatch(loadServicePreference.request(serviceId));

      if (status) {
        IOToast.success(I18n.t("features.pn.service.toast.activated"));
      }
    },
    [dispatch, serviceId]
  );

  const handleActivationFailure = useCallback(() => {
    dispatch(loadServicePreference.request(serviceId));
    IOToast.error(I18n.t("features.pn.service.toast.error"));
  }, [dispatch, serviceId]);

  if (!servicePreferenceResponseSuccess) {
    return null;
  }

  if (!isServiceActive) {
    return (
      <ButtonSolid
        fullWidth
        accessibilityLabel={I18n.t("features.pn.service.activate")}
        label={I18n.t("features.pn.service.activate")}
        loading={isLoading}
        onPress={() => {
          trackPNServiceStartActivation();
          dispatch(
            pnActivationUpsert.request({
              value: true,
              onSuccess: () => handleActivationSuccess(true),
              onFailure: handleActivationFailure
            })
          );
        }}
      />
    );
  }

  return (
    <ButtonSolid
      fullWidth
      color="danger"
      accessibilityLabel={I18n.t("features.pn.service.deactivate")}
      label={I18n.t("features.pn.service.deactivate")}
      loading={isLoading}
      onPress={() => {
        trackPNServiceStartDeactivation();
        dispatch(
          pnActivationUpsert.request({
            value: false,
            onSuccess: () => handleActivationSuccess(false),
            onFailure: handleActivationFailure
          })
        );
      }}
    />
  );
};
