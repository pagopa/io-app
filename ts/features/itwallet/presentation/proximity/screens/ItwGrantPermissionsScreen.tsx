import {
  IconButton,
  IOVisualCostants,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { openSettings } from "react-native-permissions";
import I18n from "../../../../../i18n";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import { openAppSettings } from "../../../../../utils/appSettings";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { ItwProximityMachineContext } from "../machine/provider";

export const ItwGrantPermissionsScreen = () => {
  const navigation = useIONavigation();
  const machineRef = ItwProximityMachineContext.useActorRef();
  useHardwareBackButton(() => true);

  const listItems = useMemo<Array<ListItemInfo>>(
    () => [
      {
        label: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step1.label"
        ),
        value: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step1.value"
        ),
        icon:
          Platform.OS === "ios" ? "systemSettingsiOS" : "systemSettingsAndroid"
      },
      {
        label: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step2.label"
        ),
        value: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step2.value"
        ),
        icon: "systemAppsAndroid"
      },
      {
        label: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step3.label"
        ),
        value: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step3.value"
        ),
        icon: "productIOAppBlueBg"
      },
      {
        label: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step4.label"
        ),
        value: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step4.value"
        ),
        icon: "systemToggleInstructions"
      }
    ],
    []
  );

  const actions: IOScrollViewActions = {
    type: "TwoButtons",
    primary: {
      label: I18n.t(
        "features.itWallet.presentation.proximity.grantPermissions.actions.primary"
      ),
      onPress: openAppSettings
    },
    secondary: {
      label: I18n.t(
        "features.itWallet.presentation.proximity.grantPermissions.actions.secondary"
      ),
      onPress: openSettings
    }
  };

  return (
    <>
      <View style={styles.header}>
        <IconButton
          color="neutral"
          icon="closeLarge"
          onPress={navigation.goBack}
          accessibilityLabel="close"
        />
      </View>
      <IOScrollViewWithListItems
        title={I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.title"
        )}
        subtitle={I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.subtitle"
        )}
        listItemHeaderLabel={I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.title"
        )}
        renderItems={listItems}
        actions={actions}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingVertical: 16
  }
});
