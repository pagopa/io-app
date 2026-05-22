import i18n from "i18next";
import { useEffect } from "react";
import { Body, HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  setStartActiveSessionLogin,
  setIdpSelectedActiveSessionLogin,
  setActiveSessionLoginFlow,
  setFinishedActiveSessionLoginFlow
} from "../../../authentication/activeSessionLogin/store/actions";
import { IdpCIE } from "../../../authentication/login/hooks/useNavigateToLoginMethod";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciEndRequest } from "../../store/actions";
import { WhatsNewScreenContent } from "../../../../components/screens/WhatsNewScreenContent";
import { useIsNfcFeatureAvailable } from "../../../pn/aar/hooks/useIsNfcFeatureAvailable";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import {
  trackFciLoginRequest,
  trackFciLoginRequestClose,
  trackFciLoginRequestContinue
} from "../../analytics";
import { fastLoginOptInFFEnabled } from "../../../authentication/fastLogin/store/selectors/index.ts";
import { AUTHENTICATION_ROUTES } from "../../../authentication/common/navigation/routes.ts";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes.ts";

export const FciLoginL3Screen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isNfcAvailable = useIsNfcFeatureAvailable();
  const { setOptions } = useIONavigation();
  const isFastLoginOptInFFEnabled = useIOSelector(fastLoginOptInFFEnabled);

  useOnFirstRender(() => {
    trackFciLoginRequest();
  });

  useEffect(() => {
    setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
          ignoreSafeAreaMargin={false}
          type="singleAction"
          firstAction={{
            icon: "closeMedium",
            onPress: () => {
              trackFciLoginRequestClose();
              dispatch(setFinishedActiveSessionLoginFlow());
              dispatch(fciEndRequest());
            },
            accessibilityLabel: i18n.t("global.buttons.close")
          }}
        />
      )
    });
  }, [dispatch, setOptions]);

  const onPressContinue = () => {
    trackFciLoginRequestContinue();
    if (isNfcAvailable) {
      dispatch(setActiveSessionLoginFlow("FCI"));
      dispatch(setStartActiveSessionLogin());
      dispatch(setIdpSelectedActiveSessionLogin(IdpCIE));
      dispatch(setActiveSessionLoginFlow("FCI"));
      if (isFastLoginOptInFFEnabled) {
        navigation.navigate(FCI_ROUTES.MAIN, {
          screen: FCI_ROUTES.LOGIN_OPTIN
        });
      } else {
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen: SETTINGS_ROUTES.AUTHENTICATION,
          params: {
            screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
          }
        });
      }
    } else {
      navigation.navigate(FCI_ROUTES.MAIN, {
        screen: FCI_ROUTES.NFC_NOT_AVAILABLE
      });
    }
  };

  return (
    <WhatsNewScreenContent
      testID="FciLoginL3ScreenContent"
      pictogram="identityCheck"
      title={i18n.t("features.fci.requestL3.landingPage.title")}
      action={{
        label: i18n.t("global.buttons.continue"),
        fullWidth: true,
        onPress: onPressContinue,
        testID: "FciLoginL3ContinueButton"
      }}
    >
      <Body style={{ textAlign: "center" }} testID="FciLoginL3SubtitleText">
        {i18n.t("features.fci.requestL3.landingPage.subtitle")}
      </Body>
    </WhatsNewScreenContent>
  );
};
