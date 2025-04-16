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

const consecutiveTapRequired = 5;

export const useInfoBottomsheetComponent = () => {
  const tosConfig = useIOSelector(tosConfigSelector, _isEqual);
  const privacyUrl = tosConfig.tos_url;
  const tap = useRef<number>(0);

  const navigateToPrivacyUrl = useCallback(() => {
    openWebUrl(privacyUrl);
  }, [privacyUrl]);

  const navigateToManageAccess = useCallback(() => {
    openWebUrl("https://ioapp.it/esci-da-io");
  }, []);

  const navigateToIOShowcase = useCallback(() => {
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
    title: I18n.t("authentication.landing.cie_bottom_sheet.title"),
    component: (
      <View>
        <ListItemAction
          label="Informativa Privacy"
          onPress={navigateToPrivacyUrl}
          icon="security"
          variant="primary"
        />
        <Divider />
        <ListItemAction
          label="Gestisci i tuoi accessi"
          accessibilityLabel="Gestisci i tuoi accessi"
          onPress={navigateToManageAccess}
          icon="key"
          variant="primary"
        />
        <Divider />
        <ListItemAction
          label="Cosa puoi fare con l’app IO"
          onPress={navigateToIOShowcase}
          variant="primary"
          icon="externalLink"
        />
        <Divider />
        <AppVersion onPress={onTapAppVersion} />
      </View>
    ),
    snapPoint: [350]
  });

  return {
    presentInfoBottomsheet: present,
    dismissInfoBottomsheet: dismissBottomSheet,
    infoBottomsheetComponent: bottomSheet
  };
};
