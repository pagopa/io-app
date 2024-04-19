/**
 * A screen to invite the user to update the app because current version is not supported yet
 *
 */

import React, { useCallback } from "react";
import { Linking } from "react-native";
import { IOToast } from "@pagopa/io-app-design-system";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import I18n from "../../i18n";
import { storeUrl, webStoreURL } from "../../utils/appVersion";
import { openWebUrl } from "../../utils/url";
import { OperationResultScreenContent } from "../../components/screens/OperationResultScreenContent";
import withModalAndToastProvider from "../../hocs/withModalAndToastProvider";
import { trackForcedUpdateScreen, trackUpdateAppButton } from "./analytics";

const UpdateAppModal: React.FC = () => {
  const title = I18n.t("titleUpdateApp");
  const subtitle = I18n.t("messageUpdateApp");
  const actionLabel = I18n.t("btnUpdateApp");
  // Disable Android back button
  useHardwareBackButton(() => true);

  trackForcedUpdateScreen();

  // Tries to open the native app store, falling to browser web store
  const openAppStore = useCallback(async () => {
    trackUpdateAppButton();

    try {
      await Linking.openURL(storeUrl);
    } catch (e) {
      openWebUrl(webStoreURL, () => {
        IOToast.error(I18n.t("msgErrorUpdateApp"));
      });
    }
  }, []);

  return (
    <OperationResultScreenContent
      pictogram="updateOS"
      title={title}
      subtitle={subtitle}
      action={{
        label: actionLabel,
        accessibilityLabel: actionLabel,
        onPress: openAppStore
      }}
    />
  );
};

export default withModalAndToastProvider(UpdateAppModal);
