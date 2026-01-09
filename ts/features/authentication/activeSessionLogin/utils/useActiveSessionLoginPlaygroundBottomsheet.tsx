import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useIODispatch } from "../../../../store/hooks";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import {
  setIdpSelectedActiveSessionLogin,
  setStartActiveSessionLogin
} from "../store/actions";
import { TestIdp } from "../../login/landing/hooks/useInfoBottomsheetComponent";

export const useActiveSessionLoginPlaygroundBottomsheet = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const navigateToLoginScreen = () => {
    dispatch(setStartActiveSessionLogin());
    navigation.navigate(SETTINGS_ROUTES.AUTHENTICATION, {
      screen: AUTHENTICATION_ROUTES.LANDING_ACTIVE_SESSION_LOGIN
    });
    dismissActiveSessionLoginPlaygroundBottomSheet();
  };

  const navigateToTestLoginScreen = () => {
    dispatch(setStartActiveSessionLogin());
    dispatch(setIdpSelectedActiveSessionLogin(TestIdp));
    navigation.navigate(SETTINGS_ROUTES.AUTHENTICATION, {
      screen: AUTHENTICATION_ROUTES.TEST_ACTIVE_SESSION_LOGIN
    });
    dismissActiveSessionLoginPlaygroundBottomSheet();
  };

  const {
    present: presentActiveSessionLoginPlaygroundBottomSheet,
    bottomSheet: activeSessionLoginPlaygroundBottomSheet,
    dismiss: dismissActiveSessionLoginPlaygroundBottomSheet
  } = useIOBottomSheetModal({
    title: I18n.t(
      "profile.main.loginEnvironment.activeSession.playground.bottomSheet.title"
    ),
    component: (
      <>
        <ListItemNav
          value={I18n.t(
            "profile.main.loginEnvironment.activeSession.playground.bottomSheet.standardLogin"
          )}
          onPress={navigateToLoginScreen}
        />
        <Divider />
        <ListItemNav
          value={I18n.t(
            "profile.main.loginEnvironment.activeSession.playground.bottomSheet.testLogin"
          )}
          onPress={navigateToTestLoginScreen}
        />
        <VSpacer size={16} />
      </>
    )
  });

  return {
    activeSessionLoginPlaygroundBottomSheet,
    presentActiveSessionLoginPlaygroundBottomSheet,
    dismissActiveSessionLoginPlaygroundBottomSheet
  };
};
