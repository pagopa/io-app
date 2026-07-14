import { useIOToast } from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { ReactElement, useCallback, useEffect } from "react";

import { ServicesPreferencesModeEnum } from "../../../../../definitions/identity/ServicesPreferencesMode";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { GlobalState } from "../../../../store/reducers/types";
import { getFlowType } from "../../../../utils/analytics";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { usePrevious } from "../../../../utils/hooks/usePrevious";
import {
  trackServiceConfiguration,
  trackServiceConfigurationScreen
} from "../../common/analytics";
import { profileUpsert } from "../../common/store/actions";
import {
  profileSelector,
  profileServicePreferencesModeSelector
} from "../../common/store/selectors";
import ServicesContactComponent from "../shared/components/ServicesContactComponent";
import { useManualConfigBottomSheet } from "../shared/hooks/useManualConfigBottomSheet";

/**
 * Display the current profile services preference mode (auto or manual)
 * User can update his/her mode
 * @param props
 * @constructor
 */
const ServicesPreferenceScreen = (): ReactElement => {
  const store = useIOStore();
  const toast = useIOToast();
  const state = store.getState();
  const dispatch = useIODispatch();
  const profile = useIOSelector(profileSelector);
  const prevProfile = usePrevious(profile);
  const isLoading = pot.isUpdating(profile) || pot.isLoading(profile);
  const profileServicePreferenceMode = useIOSelector(
    profileServicePreferencesModeSelector
  );
  const prevMode = usePrevious(profileServicePreferenceMode);

  const dispatchServicePreferencesSetting = useCallback(
    (mode: ServicesPreferencesModeEnum) =>
      dispatch(
        profileUpsert.request({ service_preferences_settings: { mode } })
      ),
    [dispatch]
  );

  const onServicePreferenceSelected = useCallback(
    (mode: ServicesPreferencesModeEnum, state: GlobalState) => {
      void trackServiceConfiguration(mode, getFlowType(false, false), state);
      dispatchServicePreferencesSetting(mode);
    },
    [dispatchServicePreferencesSetting]
  );

  const { present: confirmManualConfig, manualConfigBottomSheet } =
    useManualConfigBottomSheet(() =>
      onServicePreferenceSelected(ServicesPreferencesModeEnum.MANUAL, state)
    );

  useOnFirstRender(() => {
    trackServiceConfigurationScreen(getFlowType(false, false));
  });

  useEffect(() => {
    // show error toast only when the profile updating fails
    // otherwise, if the profile is in error state,
    // the toast will be shown immediately without any updates
    if (prevProfile && !pot.isError(prevProfile) && pot.isError(profile)) {
      toast.error(I18n.t("global.genericError"));
      return;
    }
    // if profile preferences are updated correctly
    // the button is selected
    // and the success banner is shown
    if (
      prevProfile &&
      pot.isUpdating(prevProfile) &&
      pot.isSome(profile) &&
      prevMode !== profileServicePreferenceMode
    ) {
      toast.hideAll();
      toast.success(
        profileServicePreferenceMode === ServicesPreferencesModeEnum.MANUAL
          ? I18n.t("services.optIn.preferences.manualConfig.successAlert")
          : I18n.t("services.optIn.preferences.quickConfig.successAlert")
      );
    }
  }, [profile, prevProfile, profileServicePreferenceMode, prevMode, toast]);

  const handleOnSelectMode = useCallback(
    (mode: ServicesPreferencesModeEnum) => {
      // if user's choice is 'manual', open bottom sheet to ask confirmation
      if (mode === ServicesPreferencesModeEnum.MANUAL) {
        confirmManualConfig();
        return;
      }
      onServicePreferenceSelected(mode, state);
    },
    [confirmManualConfig, onServicePreferenceSelected, state]
  );

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <IOScrollViewWithLargeHeader
        description={I18n.t("services.optIn.preferences.body")}
        headerActionsProp={{ showHelp: true }}
        includeContentMargins
        testID="services-preference-screen"
        title={{
          label: I18n.t("services.optIn.preferences.title")
        }}
      >
        <ServicesContactComponent
          mode={profileServicePreferenceMode}
          onSelectMode={handleOnSelectMode}
        />
        {manualConfigBottomSheet}
      </IOScrollViewWithLargeHeader>
    </LoadingSpinnerOverlay>
  );
};

export default ServicesPreferenceScreen;
