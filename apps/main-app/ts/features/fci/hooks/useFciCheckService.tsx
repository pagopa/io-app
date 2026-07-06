import { Body, ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import { IOButton } from "@pagopa/io-app-design-system/src/components/buttons";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";

import { ServiceId } from "../../../../definitions/services/ServiceId";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { upsertServicePreference } from "../../services/details/store/actions/preference";
import { servicePreferencePotByIdSelector } from "../../services/details/store/selectors";
import { isServicePreferenceResponseSuccess } from "../../services/details/types/ServicePreferenceResponse";
import {
  trackFciBottomsheetMessagePermissionAccepted,
  trackFciBottomsheetMessagePermissionDeclined,
  trackFciBottomsheetMessagePermissionRequest,
  trackFciUxConversion
} from "../analytics";
import { fciStartSigningRequest } from "../store/actions";
import { fciEnvironmentSelector } from "../store/reducers/fciEnvironment";
import { fciMetadataServiceIdSelector } from "../store/reducers/fciMetadata";

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

  const handleDismiss = () => {
    trackFciBottomsheetMessagePermissionDeclined();
    dispatch(fciStartSigningRequest());
    dismiss();
  };

  const handleConfirm = () => {
    trackFciBottomsheetMessagePermissionAccepted();
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
  };

  const {
    present: presentBottomSheet,
    bottomSheet,
    dismiss
  } = useIOBottomSheetModal({
    onDismiss: handleDismiss,
    component: (
      <Body weight={"Regular"}>
        {I18n.t("features.fci.checkService.content")}
      </Body>
    ),
    title: I18n.t("features.fci.checkService.title"),
    snapPoint: [320],
    footer: (
      <ContentWrapper>
        <VSpacer size={16} />
        <IOButton
          fullWidth
          label={I18n.t("features.fci.checkService.confirm")}
          onPress={handleConfirm}
          variant="solid"
        />
      </ContentWrapper>
    )
  });

  const present = () => {
    trackFciBottomsheetMessagePermissionRequest();
    presentBottomSheet();
  };

  return {
    dismiss,
    present,
    bottomSheet
  };
};
