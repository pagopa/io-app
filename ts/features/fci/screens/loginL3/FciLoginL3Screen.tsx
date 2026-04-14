import i18n from "i18next";
import { useEffect } from "react";
import { Body, HeaderSecondLevel } from "@pagopa/io-app-design-system";
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
import { WhatsNewScreenContent } from "../../../../components/screens/WhatsNewScreenContent";

export const FciLoginL3Screen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isNfcAvailable = useIsNfcFeatureAvailable();
  const { setOptions } = useIONavigation();

  useEffect(() => {
    setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
          ignoreSafeAreaMargin={false}
          type="singleAction"
          firstAction={{
            icon: "closeMedium",
            onPress: () => dispatch(fciEndRequest()),
            accessibilityLabel: i18n.t("global.buttons.close")
          }}
        />
      )
    });
  }, [dispatch, setOptions]);

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
    <WhatsNewScreenContent
      pictogram="identityCheck"
      title={i18n.t("features.fci.requestL3.title")}
      action={{
        label: i18n.t("global.buttons.continue"),
        fullWidth: true,
        onPress: onPressContinue
      }}
      secondaryAction={{
        label: i18n.t("features.fci.requestL3.secondaryAction"),
        icon: "instruction",
        onPress: onNavigateToHelpCenter
      }}
    >
      <Body style={{ textAlign: "center" }}>
        {i18n.t("features.fci.requestL3.subtitle")}
      </Body>
    </WhatsNewScreenContent>
  );
};
