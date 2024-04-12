import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  Body,
  ButtonSolidProps,
  FooterWithButtons
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { fciStartSigningRequest } from "../store/actions";
import { upsertServicePreference } from "../../services/store/actions";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { isServicePreferenceResponseSuccess } from "../../services/types/ServicePreferenceResponse";
import { servicePreferenceSelector } from "../../services/store/reducers/servicePreference";
import { fciMetadataServiceIdSelector } from "../store/reducers/fciMetadata";
import { trackFciUxConversion } from "../analytics";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { fciEnvironmentSelector } from "../store/reducers/fciEnvironment";

/**
 * A hook that returns a function to present the abort signature flow bottom sheet
 */
export const useFciCheckService = () => {
  const dispatch = useIODispatch();
  const fciServiceId = useIOSelector(fciMetadataServiceIdSelector);
  const servicePreference = useIOSelector(servicePreferenceSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const servicePreferenceValue = pot.getOrElse(servicePreference, undefined);
  const cancelButtonProps: ButtonSolidProps = {
    onPress: () => {
      dispatch(fciStartSigningRequest());
      dismiss();
    },
    label: I18n.t("features.fci.checkService.cancel"),
    accessibilityLabel: I18n.t("features.fci.checkService.cancel")
  };
  const confirmButtonProps: ButtonSolidProps = {
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
    label: I18n.t("features.fci.checkService.confirm"),
    accessibilityLabel: I18n.t("features.fci.checkService.confirm")
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
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        primary={{
          type: "Outline",
          buttonProps: cancelButtonProps
        }}
        secondary={{ type: "Solid", buttonProps: confirmButtonProps }}
      />
    )
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};
