import {
  Body,
  Divider,
  GradientScrollView,
  H2,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { Linking, Platform } from "react-native";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import I18n from "../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../navigation/params/AppParamsList";

const MediaPermissionInstructionsScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  useHeaderSecondLevel({ title: "" });

  const handleOpenAppSettings = async () => {
    await Linking.openSettings();
    navigation.pop();
  };

  return (
    <GradientScrollView
      primaryActionProps={{
        label: I18n.t("permissionRequest.media.cta"),
        accessibilityLabel: I18n.t("permissionRequest.media.cta"),
        onPress: handleOpenAppSettings
      }}
    >
      <>
        <H2>{I18n.t("permissionRequest.media.title")}</H2>
        <VSpacer size={8} />
        <Body>{I18n.t("permissionRequest.media.subtitle")}</Body>
        <VSpacer size={8} />
        <ListItemHeader label={I18n.t("permissionRequest.media.caption")} />
        {Platform.OS === "android" ? (
          <AndroidMediaPermissionSteps />
        ) : (
          <IOSMediaPermissionSteps />
        )}
      </>
    </GradientScrollView>
  );
};

const AndroidMediaPermissionSteps = () => (
  <>
    <ListItemInfo
      label={I18n.t("permissionRequest.media.step", { step: 1 })}
      value={I18n.t("permissionRequest.media.steps.android.1")}
      icon="systemSettingsAndroid"
    />
    <Divider />
    <ListItemInfo
      label={I18n.t("permissionRequest.media.step", { step: 2 })}
      value={I18n.t("permissionRequest.media.steps.android.2")}
      icon="systemAppsAndroid"
    />
    <Divider />
    <ListItemInfo
      label={I18n.t("permissionRequest.media.step", { step: 3 })}
      value={I18n.t("permissionRequest.media.steps.android.3")}
      icon="productIOAppBlueBg"
    />
    <Divider />
    <ListItemInfo
      label={I18n.t("permissionRequest.media.step", { step: 4 })}
      value={I18n.t("permissionRequest.media.steps.android.4")}
      icon="systemPermissionsAndroid"
    />
    <Divider />
    <ListItemInfo
      label={I18n.t("permissionRequest.media.step", { step: 5 })}
      value={I18n.t("permissionRequest.media.steps.android.5")}
      icon="systemToggleInstructions"
    />
  </>
);

const IOSMediaPermissionSteps = () => (
  <>
    <ListItemInfo
      label={I18n.t("permissionRequest.media.step", { step: 1 })}
      value={I18n.t("permissionRequest.media.steps.ios.1")}
      icon="systemSettingsiOS"
    />
    <Divider />
    <ListItemInfo
      label={I18n.t("permissionRequest.media.step", { step: 2 })}
      value={I18n.t("permissionRequest.media.steps.ios.2")}
      icon="productIOAppBlueBg"
    />
    <Divider />
    <ListItemInfo
      label={I18n.t("permissionRequest.media.step", { step: 3 })}
      value={I18n.t("permissionRequest.media.steps.ios.3")}
      // TODO add missing pictogram
    />
  </>
);

export { MediaPermissionInstructionsScreen };
