import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Content } from "native-base";
import { PreferencesListItem } from "../../components/PreferencesListItem";
import I18n from "../../i18n";
import { profilePreferencesSelector } from "../../store/reducers/profile";
import { useIODispatch } from "../../store/hooks";
import { profileUpsert } from "../../store/actions/profile";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import { showToast } from "../../utils/showToast";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import Switch from "../../components/ui/Switch";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { BlockButtonProps } from "../../components/ui/BlockButtons";
import { InfoBox } from "../../components/box/InfoBox";
import { H5 } from "../../components/core/typography/H5";
import { IOColors } from "../../components/core/variables/IOColors";
import customVariables from "../../theme/variables";
import { IOBadge } from "../../components/core/IOBadge";
import { H1 } from "../../components/core/typography/H1";
import { Body } from "../../components/core/typography/Body";
import { Link } from "../../components/core/typography/Link";
import { PushNotificationsContentTypeEnum } from "../../../definitions/backend/PushNotificationsContentType";
import { usePreviewMoreInfo } from "../../utils/hooks/usePreviewMoreInfo";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { NotificationsPreferencesPreview } from "./components/NotificationsPreferencesPreview";

const styles = StyleSheet.create({
  contentHeader: {
    padding: customVariables.contentPadding,
    paddingTop: 0
  },
  flexGrow: {
    flexGrow: 1
  },
  separator: {
    backgroundColor: customVariables.itemSeparator,
    height: StyleSheet.hairlineWidth
  },
  bottomSpacer: {
    marginBottom: customVariables.spacerLargeHeight
  },
  blueBg: {
    backgroundColor: IOColors.blue
  },
  containerActions: {
    backgroundColor: IOColors.white,
    borderRadius: 16,
    height: "100%",
    paddingLeft: customVariables.contentPadding,
    paddingRight: customVariables.contentPadding
  },
  containerActionsBlueBg: {
    paddingTop: customVariables.contentPadding
  },
  badge: {
    padding: customVariables.contentPadding / 2
  },
  mediumText: {
    fontSize: customVariables.fontSizeSmall,
    lineHeight: customVariables.h5LineHeight
  }
});

export type OnboardingNotificationsPreferencesScreenNavigationParams = {
  isFirstOnboarding: boolean;
};

type Props = IOStackNavigationRouteProps<
  OnboardingParamsList,
  "ONBOARDING_NOTIFICATIONS_PREFERENCES"
>;

const continueButtonProps = (
  isLoading: boolean,
  onPress: () => void
): BlockButtonProps => ({
  block: true,
  onPress,
  title: I18n.t("onboarding.notifications.continue"),
  isLoading
});

const loadingButtonProps = (): BlockButtonProps => ({
  block: true,
  onPress: undefined,
  title: "",
  disabled: true,
  style: { backgroundColor: IOColors.greyLight, width: "100%" },
  isLoading: true,
  iconColor: IOColors.bluegreyDark
});

const CustomGoBack = memo(
  ({ isFirstOnboarding }: { isFirstOnboarding: boolean }) => (
    <View style={styles.badge}>
      {!isFirstOnboarding && (
        <IOBadge
          text={I18n.t("onboarding.notifications.badge")}
          labelColor={"bluegreyDark"}
        />
      )}
    </View>
  )
);

const Header = memo(({ isFirstOnboarding }: { isFirstOnboarding: boolean }) => (
  <View style={styles.contentHeader}>
    <H1 color={isFirstOnboarding ? "bluegreyDark" : "white"}>
      {I18n.t(
        isFirstOnboarding
          ? "profile.preferences.notifications.title"
          : "profile.preferences.notifications.titleExistingUser"
      )}
    </H1>
    <Body color={isFirstOnboarding ? "bluegreyDark" : "white"}>
      {I18n.t(
        isFirstOnboarding
          ? "profile.preferences.notifications.subtitle"
          : "profile.preferences.notifications.subtitleExistingUser"
      )}
    </Body>
  </View>
));

const OnboardingNotificationsPreferencesScreen = (props: Props) => {
  const dispatch = useIODispatch();

  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const preferences = useSelector(profilePreferencesSelector);
  const { present, bottomSheet } = usePreviewMoreInfo();

  const isError = pot.isError(preferences);
  const isUpdating = pot.isUpdating(preferences);

  const { isFirstOnboarding } = props.route.params;

  useEffect(() => {
    if (isError && !isUpdating) {
      showToast(I18n.t("profile.preferences.notifications.error"));
    }
  }, [isError, isUpdating]);

  const upsertPreferences = () => {
    dispatch(
      profileUpsert.request({
        reminder_status: remindersEnabled
          ? ReminderStatusEnum.ENABLED
          : ReminderStatusEnum.DISABLED,
        push_notifications_content_type: previewEnabled
          ? PushNotificationsContentTypeEnum.FULL
          : PushNotificationsContentTypeEnum.ANONYMOUS
      })
    );
  };

  return (
    <BaseScreenComponent
      customGoBack={<CustomGoBack isFirstOnboarding={isFirstOnboarding} />}
      headerTitle={
        isFirstOnboarding
          ? I18n.t("onboarding.notifications.headerTitle")
          : undefined
      }
      contextualHelp={emptyContextualHelp}
      primary={!isFirstOnboarding}
    >
      <SafeAreaView style={IOStyles.flex}>
        <Content
          noPadded={true}
          contentContainerStyle={styles.flexGrow}
          style={[!isFirstOnboarding && styles.blueBg]}
        >
          <Header isFirstOnboarding={isFirstOnboarding} />
          <NotificationsPreferencesPreview
            previewEnabled={previewEnabled}
            remindersEnabled={remindersEnabled}
            isFirstOnboarding={isFirstOnboarding}
          />
          <View
            style={[
              styles.containerActions,
              !isFirstOnboarding && styles.containerActionsBlueBg
            ]}
          >
            {isFirstOnboarding && <View style={styles.separator} />}
            <PreferencesListItem
              title={I18n.t("profile.preferences.notifications.preview.title")}
              description={
                <>
                  {`${I18n.t(
                    "profile.preferences.notifications.preview.description"
                  )} `}
                  <Link style={styles.mediumText} onPress={present}>
                    {I18n.t("profile.preferences.notifications.preview.link")}
                  </Link>
                </>
              }
              rightElement={
                <Switch
                  value={previewEnabled}
                  onValueChange={setPreviewEnabled}
                  disabled={isUpdating}
                  testID="previewsPreferenceSwitch"
                />
              }
            />
            <View style={styles.separator} />
            <PreferencesListItem
              title={I18n.t(
                "profile.preferences.notifications.reminders.title"
              )}
              description={I18n.t(
                "profile.preferences.notifications.reminders.description"
              )}
              rightElement={
                <Switch
                  value={remindersEnabled}
                  onValueChange={setRemindersEnabled}
                  disabled={isUpdating}
                  testID="remindersPreferenceSwitch"
                />
              }
            />
            <View style={[styles.separator, styles.bottomSpacer]} />
            <InfoBox iconName={"io-profilo"} iconColor={IOColors.bluegrey}>
              <H5 color={"bluegrey"} weight={"Regular"}>
                {I18n.t(
                  "profile.main.privacy.shareData.screen.profileSettings"
                )}
              </H5>
            </InfoBox>
          </View>
        </Content>
        {bottomSheet}
        <FooterWithButtons
          type="SingleButton"
          leftButton={
            isUpdating
              ? loadingButtonProps()
              : continueButtonProps(isUpdating, upsertPreferences)
          }
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OnboardingNotificationsPreferencesScreen;
