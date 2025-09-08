import {
  Body,
  BodyProps,
  ComposedBodyFromArray,
  ContentWrapper,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ComponentProps, useCallback, useEffect, useMemo } from "react";
import { AccessibilityInfo } from "react-native";
import I18n from "i18next";
import { UserDataProcessingChoiceEnum } from "../../../../../definitions/backend/UserDataProcessingChoice";
import { BulletList, BulletListItem } from "../../../../components/BulletList";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
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

  const actions = useMemo<IOScrollViewActions>(
    () => ({
      type: "SingleButton",
      primary: {
        testID: "export-data-download-button",
        color: "primary",
        label: I18n.t("profile.main.privacy.exportData.cta"),
        accessibilityLabel: I18n.t("profile.main.privacy.exportData.cta"),
        loading: isLoading,
        onPress: handleDownloadPress
      }
    }),
    [handleDownloadPress, isLoading]
  );

  const listItems = useMemo<Array<BulletListItem>>(
    () => [
      {
        id: "first_item",
        value: I18n.t("profile.main.privacy.exportData.detail.bulletList.item1")
      },
      {
        id: "second_item",
        value: I18n.t("profile.main.privacy.exportData.detail.bulletList.item2")
      },
      {
        id: "third_item",
        value: I18n.t("profile.main.privacy.exportData.detail.bulletList.item3")
      },
      {
        id: "fourth_item",
        value: I18n.t("profile.main.privacy.exportData.detail.bulletList.item4")
      }
    ],
    []
  );

  const titleProps = useMemo<ComponentProps<typeof Body>>(
    () => ({ weight: "Semibold" }),
    []
  );

  const secondParagraph = useMemo<Array<BodyProps>>(
    () => [
      {
        text: I18n.t("profile.main.privacy.exportData.detail.paragraph2.part1")
      },
      {
        text: I18n.t("profile.main.privacy.exportData.detail.paragraph2.part2"),
        weight: "Semibold"
      },
      {
        text: I18n.t("profile.main.privacy.exportData.detail.paragraph2.part3")
      }
    ],
    []
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.main.privacy.exportData.title"),
        testID: "share-data-component-title"
      }}
      description={I18n.t("profile.main.privacy.exportData.subtitle")}
      actions={actions}
    >
      <VSpacer size={8} />
      <ContentWrapper>
        <BulletList
          title={I18n.t(
            "profile.main.privacy.exportData.detail.bulletList.title"
          )}
          titleProps={titleProps}
          list={listItems}
        />
        <VSpacer size={16} />
        <Body>
          {I18n.t("profile.main.privacy.exportData.detail.paragraph1")}
        </Body>
        <VSpacer />
        <ComposedBodyFromArray textAlign="left" body={secondParagraph} />
        <VSpacer />
        <Body accessibilityRole="link" onPress={handleNavigateToProfilePrivacy}>
          {I18n.t("profile.main.privacy.exportData.detail.paragraph3.part1")}
          <Body
            asLink
            weight="Semibold"
            onPress={handleNavigateToProfilePrivacy}
          >
            {I18n.t("profile.main.privacy.exportData.detail.paragraph3.link")}
          </Body>
        </Body>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default DownloadProfileDataScreen;
