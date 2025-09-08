import { Divider, ListItemAction } from "@pagopa/io-app-design-system";
import _isEqual from "lodash/isEqual";
import { useCallback, useRef } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { IdpData } from "../../../../../../definitions/content/IdpData";
import AppVersion from "../../../../../components/AppVersion";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { SpidIdp } from "../../../../../utils/idps";
import { openWebUrl } from "../../../../../utils/url";
import { tosConfigSelector } from "../../../../tos/store/selectors";
import {
  trackLoginInfoResourceTap,
  trackLoginInfoTap
} from "../../../common/analytics";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { idpSelected } from "../../../common/store/actions";
import { isFastLoginFFEnabledSelector } from "../../../fastLogin/store/selectors";
import { Identifier } from "../../optIn/screens/OptInScreen";

const TAPS_TO_INIT_TESTIDP_FLOW = 5;

const TestIdp: SpidIdp = {
  id: "test" as keyof IdpData,
  name: "Test Idp",
  logo: {
    light: {
      uri: "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid.png"
    }
  },
  profileUrl: "",
  isTestIdp: true
};

export const useInfoBottomsheetComponent = () => {
  const tosConfig = useIOSelector(tosConfigSelector, _isEqual);
  const isFastLoginOptInFFEnabled = useIOSelector(isFastLoginFFEnabledSelector);

  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const privacyUrl = tosConfig.tos_url;
  const tap = useRef<number>(0);

  const setSelectedTestIdp = useCallback(
    () => dispatch(idpSelected(TestIdp)),
    [dispatch]
  );

  const navigateToPrivacyUrl = useCallback(() => {
    trackLoginInfoResourceTap("privacy_policy");
    openWebUrl(privacyUrl);
  }, [privacyUrl]);

  /**
   * The URL is currently hardcoded because the remote config still points to io.italia.it.
   * Switching to use `generateDynamicUrlSelector` and ioapp.it now would break links,
   * as not all have been migrated yet.
   *
   * TODO: Replace with `generateDynamicUrlSelector` once the migration to ioapp.it is complete.
   */

  const navigateToManageAccess = useCallback(() => {
    trackLoginInfoResourceTap("manage_access");
    openWebUrl("https://ioapp.it/esci-da-io");
  }, []);

  const navigateToIOShowcase = useCallback(() => {
    trackLoginInfoResourceTap("app_features");
    openWebUrl("https://ioapp.it");
  }, []);

  const initTestLoginFlow = useCallback(() => {
    setSelectedTestIdp();
    if (isFastLoginOptInFFEnabled) {
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.OPT_IN,
        params: { identifier: Identifier.TEST }
      });
    } else {
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.IDP_TEST
      });
    }
  }, [isFastLoginOptInFFEnabled, navigation, setSelectedTestIdp]);

  // Secret login for App Store reviewers
  const onTapAppVersion = () => {
    if (tap.current <= TAPS_TO_INIT_TESTIDP_FLOW) {
      // eslint-disable-next-line functional/immutable-data
      tap.current = tap.current + 1;
      if (tap.current === TAPS_TO_INIT_TESTIDP_FLOW) {
        // eslint-disable-next-line functional/immutable-data
        tap.current = 0;
        initTestLoginFlow();
      }
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
