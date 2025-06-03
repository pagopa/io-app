import {
  ContentWrapper,
  HStack,
  IconButton,
  IOVisualCostants,
  ListItemInfo,
  VStack
} from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { constNull } from "fp-ts/lib/function";
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
        label: "Step 1",
        value: 'Vai su "Impostazioni"',
        icon:
          Platform.OS === "ios" ? "systemSettingsiOS" : "systemSettingsAndroid"
      },
      {
        label: "Step 2",
        value: 'Seleziona "App"',
        icon: "systemAppsAndroid"
      },
      {
        label: "Step 3",
        value: 'Seleziona "IO"',
        icon: "productIOAppBlueBg"
      },
      {
        label: "Step 4",
        value: "Consenti l’accesso a Bluetooth",
        icon: "systemToggleInstructions"
      }
    ],
    []
  );

  const actions: IOScrollViewActions = {
    type: "TwoButtons",
    primary: {
      label: "Apri impostazioni",
      onPress: openAppSettings
    },
    secondary: {
      label: I18n.t("global.buttons.continue"),
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
        title={"Consenti a IO di accedere al Bluetooth"}
        subtitle={
          "Per farlo, devi modificare le preferenze nelle impostazioni di sistema del tuo dispositivo."
        }
        listItemHeaderLabel={"Ecco come fare:"}
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
