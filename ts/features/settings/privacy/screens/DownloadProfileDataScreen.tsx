import {
  ContentWrapper,
  IOMarkdown,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useCallback, useEffect } from "react";
import { AccessibilityInfo } from "react-native";
import I18n from "i18next";
import { UserDataProcessingChoiceEnum } from "../../../../../definitions/backend/UserDataProcessingChoice";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { upsertUserDataProcessing } from "../../common/store/actions/userDataProcessing";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { userDataProcessingSelector } from "../../common/store/selectors/userDataProcessing";
import { usePrevious } from "../../../../utils/hooks/usePrevious";
import { SETTINGS_ROUTES } from "../../common/navigation/routes";
import { isScreenReaderEnabledSelector } from "../../../../store/reducers/preferences";

/**
 * A screen to explain how profile data export works.
 * Here user can ask to download his data
 */
const DownloadProfileDataScreen = () => {
  const dispatch = useIODispatch();
  const { navigate, goBack } = useIONavigation();
  const userDataProcessing = useIOSelector(userDataProcessingSelector);
  const prevUserDataProcessing = usePrevious(userDataProcessing);
  const toast = useIOToast();
  const screenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);

  const isLoading =
    pot.isLoading(userDataProcessing.DOWNLOAD) ||
    pot.isUpdating(userDataProcessing.DOWNLOAD);

  useEffect(() => {
    // eslint-disable-next-line functional/no-let
    let timer: number;
    // the request to download has been done
    if (
      prevUserDataProcessing &&
      pot.isUpdating(prevUserDataProcessing.DOWNLOAD) &&
      pot.isSome(userDataProcessing.DOWNLOAD)
    ) {
      if (pot.isError(userDataProcessing.DOWNLOAD)) {
        toast.error(I18n.t("profile.main.privacy.exportData.error"));
        return;
      }
      /**
       * When the data submission request is successful and the user has
       * the screen reader active he is notified that the operation was
       * successful and then is sent back to the previous page.
       */
      if (screenReaderEnabled) {
        const message = I18n.t("profile.main.privacy.exportData.a11y");
        AccessibilityInfo.announceForAccessibility(message);

        timer = setTimeout(() => {
          goBack();
        }, 2000);
        // Otherwise the user is sent back to the previous page
      } else {
        goBack();
      }
    }
    return () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [
    prevUserDataProcessing,
    userDataProcessing,
    goBack,
    toast,
    screenReaderEnabled
  ]);

  const handleDownloadPress = useCallback(() => {
    dispatch(
      upsertUserDataProcessing.request(UserDataProcessingChoiceEnum.DOWNLOAD)
    );
  }, [dispatch]);

  const handleNavigateToProfilePrivacy = useCallback(() => {
    navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PRIVACY
    });
  }, [navigate]);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.main.privacy.exportData.title"),
        testID: "share-data-component-title"
      }}
      description={I18n.t("profile.main.privacy.exportData.subtitle")}
      actions={{
        type: "SingleButton",
        primary: {
          testID: "export-data-download-button",
          color: "primary",
          label: I18n.t("profile.main.privacy.exportData.cta"),
          accessibilityLabel: I18n.t("profile.main.privacy.exportData.cta"),
          loading: isLoading,
          onPress: handleDownloadPress
        }
      }}
    >
      <VSpacer size={8} />
      <ContentWrapper>
        <IOMarkdown
          content={I18n.t("profile.main.privacy.exportData.detail.body")}
          onLinkPress={handleNavigateToProfilePrivacy}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default DownloadProfileDataScreen;
