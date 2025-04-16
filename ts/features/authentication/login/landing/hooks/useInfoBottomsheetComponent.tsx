import { Divider, ListItemAction } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useCallback, useRef } from "react";
import _isEqual from "lodash/isEqual";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import I18n from "../../../../../i18n";
import AppVersion from "../../../../../components/AppVersion";
import { useIOSelector } from "../../../../../store/hooks";
import { tosConfigSelector } from "../../../../tos/store/selectors";
import { openWebUrl } from "../../../../../utils/url";
import {
  trackLoginInfoBottomsheet,
  trackLoginInfoResourceTap,
  trackLoginInfoTap
} from "../../../common/analytics";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";

const consecutiveTapRequired = 5;

export const useInfoBottomsheetComponent = () => {
  const tosConfig = useIOSelector(tosConfigSelector, _isEqual);
  const privacyUrl = tosConfig.tos_url;
  const tap = useRef<number>(0);

  useOnFirstRender(() => {
    trackLoginInfoBottomsheet();
  });

  const navigateToPrivacyUrl = useCallback(() => {
    trackLoginInfoResourceTap("privacy_policy");
    openWebUrl(privacyUrl);
  }, [privacyUrl]);

  const navigateToManageAccess = useCallback(() => {
    trackLoginInfoResourceTap("manage_access");
    openWebUrl("https://ioapp.it/esci-da-io");
  }, []);

  const navigateToIOShowcase = useCallback(() => {
    trackLoginInfoResourceTap("app_features");
    openWebUrl("https://ioapp.it");
  }, []);

  const onTapAppVersion = () => {
    if (tap.current === consecutiveTapRequired) {
      // eslint-disable-next-line functional/immutable-data
      tap.current = 0;
    } else {
      // eslint-disable-next-line functional/immutable-data
      tap.current = tap.current + 1;
    }
  };

  const {
    present,
    dismiss: dismissBottomSheet,
    bottomSheet
  } = useIOBottomSheetModal({
    title: I18n.t("authentication.landing.useful_resources.bottomSheet.title"),
    component: (
      <View>
        <ListItemAction
          label={I18n.t(
            "authentication.landing.useful_resources.bottomSheet.privacy_policy"
          )}
          onPress={navigateToPrivacyUrl}
          icon="security"
          variant="primary"
        />
        <Divider />
        <ListItemAction
          label={I18n.t(
            "authentication.landing.useful_resources.bottomSheet.manage_access"
          )}
          onPress={navigateToManageAccess}
          icon="key"
          variant="primary"
        />
        <Divider />
        <ListItemAction
          label={I18n.t(
            "authentication.landing.useful_resources.bottomSheet.io_more_informations"
          )}
          onPress={navigateToIOShowcase}
          variant="primary"
          icon="externalLink"
        />
        <Divider />
        <AppVersion onPress={onTapAppVersion} testID="app-version-button" />
      </View>
    ),
    snapPoint: [350]
  });

  const presentInfoBottomsheetWithTracking = useCallback(() => {
    trackLoginInfoTap();
    present();
  }, [present]);

  return {
    presentInfoBottomsheet: presentInfoBottomsheetWithTracking,
    dismissInfoBottomsheet: dismissBottomSheet,
    infoBottomsheetComponent: bottomSheet
  };
};
