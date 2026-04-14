import i18n from "i18next";
import { useEffect } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import {
  setStartActiveSessionLogin,
  setIdpSelectedActiveSessionLogin,
  setActiveSessionLoginFlow
} from "../../../authentication/activeSessionLogin/store/actions";
import { AUTHENTICATION_ROUTES } from "../../../authentication/common/navigation/routes";
import { IdpCIE } from "../../../authentication/login/hooks/useNavigateToLoginMethod";
import { Identifier } from "../../../authentication/login/optIn/screens/OptInScreen";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciEndRequest } from "../../store/actions";
import { useIsNfcFeatureAvailable } from "../../../pn/aar/hooks/useIsNfcFeatureAvailable";
import { IOScrollViewCentredContent } from "../../../../components/ui/IOScrollViewCentredContent";

export const FciLoginL3Screen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isNfcAvailable = useIsNfcFeatureAvailable();
  const { setOptions } = useIONavigation();

  useEffect(() => {
    setOptions({ headerShown: true, presentation: "modal" });
  }, [setOptions]);

  const onPressContinue = () => {
    if (isNfcAvailable) {
      dispatch(setStartActiveSessionLogin());
      dispatch(setIdpSelectedActiveSessionLogin(IdpCIE));
      dispatch(setActiveSessionLoginFlow("FCI"));
      navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
        screen: SETTINGS_ROUTES.AUTHENTICATION,
        params: {
          screen: AUTHENTICATION_ROUTES.OPT_IN,
          params: { identifier: Identifier.CIE }
        }
      });
    } else {
      navigation.navigate(FCI_ROUTES.MAIN, {
        screen: FCI_ROUTES.NFC_NOT_AVAILABLE
      });
    }
  };

  const onNavigateToHelpCenter = () => {
    // eslint-disable-next-line no-console
    console.log("navigate to help center");
  };

  return (
    <IOScrollViewCentredContent
      pictogram="identityCheck"
      title={i18n.t("features.fci.requestL3.title")}
      description={i18n.t("features.fci.requestL3.subtitle")}
      actions={{
        type: "TwoButtons",
        primary: {
          testID: "help-center-cta",
          onPress: onPressContinue,
          label: i18n.t("global.buttons.continue")
        },
        secondary: {
          icon: "instruction",
          label: "cosa devo fare?",
          onPress: onNavigateToHelpCenter
        }
      }}
      alwaysBounceVertical={false}
      headerConfig={{
        title: "",
        type: "singleAction",
        firstAction: {
          icon: "closeLarge",
          onPress: () => {
            dispatch(fciEndRequest());
          },
          accessibilityLabel: i18n.t(
            "global.accessibility.contextualHelp.close"
          )
        }
      }}
      contentContainerStyle={{
        paddingHorizontal: 32
      }}
    />
  );
};
