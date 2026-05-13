import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { Alert, Platform } from "react-native";
import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { openAppSettings } from "../../../../../utils/appSettings";
import {
  trackItwProximityBluetoothAccess,
  trackItwProximityBluetoothAccessClose,
  trackItwProximityBluetoothAccessDenied,
  trackItwProximityBluetoothAccessGoToSettings
} from "../analytics";
import { ItwProximityMachineContext } from "../machine/provider";

export const ItwBluetoothPermissionsScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();

  useHeaderSecondLevel({
    title: "",
    goBack: () => {
      trackItwProximityBluetoothAccessClose();
      machineRef.send({ type: "close" });
    }
  });

  useFocusEffect(
    useCallback(() => {
      trackItwProximityBluetoothAccess();
    }, [])
  );

  const handleContinue = async () => {
    if (false) {
      machineRef.send({ type: "continue" });
      return;
    }

    trackItwProximityBluetoothAccessDenied();
    Alert.alert(
      I18n.t(
        "features.itWallet.presentation.proximity.permissionsRequired.alert.title"
      ),
      I18n.t(
        "features.itWallet.presentation.proximity.permissionsRequired.alert.message"
      ),
      [
        {
          text: I18n.t(
            "features.itWallet.presentation.proximity.permissionsRequired.alert.text"
          ),
          onPress: () => {
            machineRef.send({ type: "close" });
          }
        }
      ]
    );
  };

  return (
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
      renderItems={[
        {
          label: I18n.t(
            "features.itWallet.presentation.proximity.grantPermissions.listItems.step1.label"
          ),
          value: I18n.t(
            "features.itWallet.presentation.proximity.grantPermissions.listItems.step1.value"
          ),
          icon:
            Platform.OS === "ios"
              ? "systemSettingsiOS"
              : "systemSettingsAndroid"
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
      ]}
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t(
            "features.itWallet.presentation.proximity.grantPermissions.actions.primary"
          ),
          onPress: () => {
            trackItwProximityBluetoothAccessGoToSettings();
            openAppSettings();
          }
        },
        secondary: {
          label: I18n.t(
            "features.itWallet.presentation.proximity.grantPermissions.actions.secondary"
          ),
          onPress: handleContinue
        }
      }}
    />
  );
};
