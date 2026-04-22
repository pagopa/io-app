import i18n from "i18next";
import { useEffect } from "react";
import {
  Body,
  HeaderSecondLevel,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  setStartActiveSessionLogin,
  setIdpSelectedActiveSessionLogin,
  setActiveSessionLoginFlow
} from "../../../authentication/activeSessionLogin/store/actions";
import { AUTHENTICATION_ROUTES } from "../../../authentication/common/navigation/routes";
import {
  IdpCIE,
  IdpCIE_ID
} from "../../../authentication/login/hooks/useNavigateToLoginMethod";
import { Identifier } from "../../../authentication/login/optIn/screens/OptInScreen";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciEndRequest } from "../../store/actions";
import { useIsNfcFeatureAvailable } from "../../../pn/aar/hooks/useIsNfcFeatureAvailable";
import { WhatsNewScreenContent } from "../../../../components/screens/WhatsNewScreenContent";
import { SpidIdp } from "../../../../utils/idps";
import { isCieLoginUatEnabledSelector } from "../../../authentication/login/cie/store/selectors";

export const FciLoginL3Screen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isNfcAvailable = useIsNfcFeatureAvailable();
  const { setOptions } = useIONavigation();
  const { info } = useIOToast();
  const isCieUatEnabled = useIOSelector(isCieLoginUatEnabledSelector);

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
    const idpSelected: SpidIdp = IdpCIE_ID;
    if (isNfcAvailable) {
      dispatch(setStartActiveSessionLogin());
      dispatch(setIdpSelectedActiveSessionLogin(idpSelected));
      dispatch(setActiveSessionLoginFlow("FCI"));
      if (idpSelected === IdpCIE_ID) {
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen: SETTINGS_ROUTES.AUTHENTICATION,
          params: {
            screen: AUTHENTICATION_ROUTES.OPT_IN,
            params: {
              identifier: Identifier.CIE_ID,
              params: { spidLevel: "SpidL3", isUat: isCieUatEnabled }
            }
          }
        });
      } else if (idpSelected === IdpCIE) {
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen: SETTINGS_ROUTES.AUTHENTICATION,
          params: {
            screen: AUTHENTICATION_ROUTES.OPT_IN,
            params: { identifier: Identifier.CIE }
          }
        });
      }
    } else {
      navigation.navigate(FCI_ROUTES.MAIN, {
        screen: FCI_ROUTES.NFC_NOT_AVAILABLE
      });
    }
  };

  // actually this action just shows a toast, but when the article is available, it will navigate to the help center
  // TODO: add link to the article on help center when available
  // Jira ref: https://pagopa.atlassian.net/browse/IEL-462
  const onNavigateToHelpCenter = () => {
    info(i18n.t("features.fci.requestL3.toast"));
  };

  return (
    <WhatsNewScreenContent
      testID="FciLoginL3ScreenContent"
      pictogram="identityCheck"
      title={i18n.t("features.fci.requestL3.title")}
      action={{
        label: i18n.t("global.buttons.continue"),
        fullWidth: true,
        onPress: onPressContinue,
        testID: "FciLoginL3ContinueButton"
      }}
      secondaryAction={{
        label: i18n.t("features.fci.requestL3.secondaryAction"),
        icon: "instruction",
        onPress: onNavigateToHelpCenter,
        testID: "FciLoginL3HelpButton"
      }}
    >
      <Body style={{ textAlign: "center" }} testID="FciLoginL3SubtitleText">
        {i18n.t("features.fci.requestL3.subtitle")}
      </Body>
    </WhatsNewScreenContent>
  );
};
