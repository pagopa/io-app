import {
  Body,
  ContentWrapper,
  Label,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { ComponentProps, useCallback, useEffect, useMemo } from "react";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import I18n from "../../i18n";
import { upsertUserDataProcessing } from "../../store/actions/userDataProcessing";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { userDataProcessingSelector } from "../../store/reducers/userDataProcessing";
import { usePrevious } from "../../utils/hooks/usePrevious";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import { BulletList, BulletListItem } from "../../components/BulletList";
import {
  BodyProps,
  ComposedBodyFromArray
} from "../../components/core/typography/ComposedBodyFromArray";
import { IOScrollViewActions } from "../../components/ui/IOScrollView";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";

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

  const isLoading =
    pot.isLoading(userDataProcessing.DOWNLOAD) ||
    pot.isUpdating(userDataProcessing.DOWNLOAD);

  useEffect(() => {
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
      goBack();
    }
  }, [prevUserDataProcessing, userDataProcessing, goBack, toast]);

  const handleDownloadPress = useCallback(() => {
    dispatch(
      upsertUserDataProcessing.request(UserDataProcessingChoiceEnum.DOWNLOAD)
    );
  }, [dispatch]);

  const handleNavigateToProfilePrivacy = useCallback(() => {
    navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PRIVACY
    });
  }, [navigate]);

  const actions = useMemo<IOScrollViewActions>(
    () => ({
      type: "SingleButton",
      primary: {
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
    () => ({ weight: "Bold" }),
    []
  );

  const secondParagraph = useMemo<Array<BodyProps>>(
    () => [
      {
        text: I18n.t("profile.main.privacy.exportData.detail.paragraph2.part1")
      },
      {
        text: I18n.t("profile.main.privacy.exportData.detail.paragraph2.part2"),
        weight: "Bold"
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
          <Label asLink onPress={handleNavigateToProfilePrivacy}>
            {I18n.t("profile.main.privacy.exportData.detail.paragraph3.link")}
          </Label>
        </Body>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default DownloadProfileDataScreen;
