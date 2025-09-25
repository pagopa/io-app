import { Body, FooterActionsInline } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ComponentProps } from "react";
import I18n from "i18next";
import { ServiceId } from "../../../../definitions/services/ServiceId";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { upsertServicePreference } from "../../services/details/store/actions/preference";
import { isServicePreferenceResponseSuccess } from "../../services/details/types/ServicePreferenceResponse";
import { trackFciUxConversion } from "../analytics";
import { fciStartSigningRequest } from "../store/actions";
import { fciEnvironmentSelector } from "../store/reducers/fciEnvironment";
import { fciMetadataServiceIdSelector } from "../store/reducers/fciMetadata";
import { servicePreferencePotByIdSelector } from "../../services/details/store/selectors";

/**
 * A hook that returns a function to present the abort signature flow bottom sheet
 */
export const useFciCheckService = () => {
  const dispatch = useIODispatch();
  const fciServiceId = useIOSelector(fciMetadataServiceIdSelector);
  const servicePreferencePot = useIOSelector(state =>
    servicePreferencePotByIdSelector(state, fciServiceId)
  );
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const servicePreferenceValue = pot.getOrElse(servicePreferencePot, undefined);
  const cancelButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["startAction"] = {
    color: "primary",
    onPress: () => {
      dispatch(fciStartSigningRequest());
      dismiss();
    },
    label: I18n.t("features.fci.checkService.cancel")
  };

  const confirmButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["endAction"] = {
    color: "primary",
    onPress: () => {
      if (
        fciServiceId &&
        servicePreferenceValue &&
        isServicePreferenceResponseSuccess(servicePreferenceValue)
      ) {
        const sp = { ...servicePreferenceValue.value, inbox: true };
        dispatch(
          upsertServicePreference.request({
            id: fciServiceId as ServiceId,
            ...sp
          })
        );
      }
      trackFciUxConversion(fciEnvironment);
      dispatch(fciStartSigningRequest());
      dismiss();
    },
    label: I18n.t("features.fci.checkService.confirm")
  };
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    component: (
      <Body weight={"Regular"}>
        {I18n.t("features.fci.checkService.content")}
      </Body>
    ),
    title: I18n.t("features.fci.checkService.title"),
    snapPoint: [320],
    footer: (
      <FooterActionsInline
        startAction={cancelButtonProps}
        endAction={confirmButtonProps}
      />
    )
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};
