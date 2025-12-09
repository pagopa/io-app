import { useEffect } from "react";
import { AccessibilityInfo } from "react-native";
import I18n from "i18next";
import { profileNameSelector } from "../../../settings/common/store/selectors";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { trackIdpAuthenticationSuccessScreen } from "../../../settings/common/analytics";
import { useIOSelector } from "../../../../store/hooks";
import { loggedInIdpSelector } from "../store/selectors";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";

export const IdpSuccessfulAuthentication = () => {
  const idp = useIOSelector(loggedInIdpSelector);
  useOnFirstRender(() => {
    trackIdpAuthenticationSuccessScreen(idp?.id);
  });
  const name = useIOSelector(profileNameSelector);
  // If the name is undefined, we set it to an empty string to avoid
  // the pictogram shift up when the name is available.
  const contentTitle = name
    ? I18n.t("authentication.idp_login_success.contentTitle", {
        name
      })
    : " ";
  // Announce the screen content when the name is available.
  // Prefer an announce intead of setting the focus to the title
  // because the screen is visible just for a short time.
  useEffect(() => {
    if (name) {
      AccessibilityInfo.announceForAccessibility(contentTitle);
    }
  }, [contentTitle, name]);

  return (
    <OperationResultScreenContent
      enableAnimatedPictogram
      testID="idp-successful-authentication"
      pictogram="success"
      title={contentTitle}
      isHeaderVisible
    />
  );
};
