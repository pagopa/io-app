import { useMemo, useCallback } from "react";
import { useIOToast } from "@pagopa/io-app-design-system";
import { AccessibilityInfo, Platform } from "react-native";
import I18n from "i18next";
import { createPinSuccess } from "../store/actions/pinset";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { PinString } from "../../../../types/PinString";
import { setPin } from "../../../../utils/keychain";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../utils/supportAssistance";
import { isProfileFirstOnBoardingSelector } from "../../common/store/selectors";
import { getFlowType } from "../../../../utils/analytics";
import { trackCreatePinSuccess } from "../../common/analytics";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SETTINGS_ROUTES } from "../../common/navigation/routes";

/**
 *
 * @param {boolean} [isOnboarding=false] A boolean value used to identify when the submit action comes from onboarding process.
 * @returns {object} An object containing the `handleSubmit` function which accepts a pin of type `PinString` used to submit the chosen pin.
 */
export const useCreatePin = (props = { isOnboarding: false }) => {
  const { isOnboarding } = props;
  const navigation = useIONavigation();
  const { success: toastSuccess } = useIOToast();
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const dispatch = useIODispatch();

  const assistanceTool = useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);

  const handleSubmit = useCallback(
    (pin: PinString) => {
      setPin(pin)
        .then(() => {
          handleSendAssistanceLog(assistanceTool, `createPinSuccess`);
          dispatch(createPinSuccess(pin));
          trackCreatePinSuccess(getFlowType(isOnboarding, isFirstOnBoarding));
          if (!isOnboarding) {
            const successMessage = I18n.t("onboarding.pin.success.message");
            toastSuccess(successMessage);
            if (Platform.OS === "android") {
              AccessibilityInfo.announceForAccessibility(successMessage);
            }
            navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
              screen: SETTINGS_ROUTES.PROFILE_SECURITY
            });
          }
        })
        .catch(() => {
          // Here we are not logging the error because it could
          // cointain sensitive informations.
          handleSendAssistanceLog(assistanceTool, `setPin error`);

          // TODO: Here we should show an error to the
          // end user probably.
        });
    },
    [
      assistanceTool,
      isFirstOnBoarding,
      navigation,
      isOnboarding,
      dispatch,
      toastSuccess
    ]
  );

  return { handleSubmit };
};
