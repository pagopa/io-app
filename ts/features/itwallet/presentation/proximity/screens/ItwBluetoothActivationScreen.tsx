import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { Alert, Platform } from "react-native";
import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import {
  trackItwProximityBluetoothActivation,
  trackItwProximityBluetoothActivationClose,
  trackItwProximityBluetoothActivationGoToSettings,
  trackItwProximityBluetoothNotActivated
} from "../analytics";
import { ItwProximityMachineContext } from "../machine/provider";
import {
  checkBluetoothActivation,
  openBluetoothPreferences
} from "../utils/ble";

export const ItwBluetoothActivationScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();

  useHeaderSecondLevel({
    title: "",
    goBack: () => {
      trackItwProximityBluetoothActivationClose();
      machineRef.send({ type: "close" });
    }
  });

  useFocusEffect(
    useCallback(() => {
      trackItwProximityBluetoothActivation();
    }, [])
  );

  const handleContinue = async () => {
    const isBleActive = await checkBluetoothActivation();
    if (isBleActive) {
      machineRef.send({ type: "continue" });
      return;
    }

    trackItwProximityBluetoothNotActivated();
    Alert.alert(
      I18n.t(
        "features.itWallet.presentation.proximity.bluetooth.activation.alert.title"
      ),
      I18n.t(
        "features.itWallet.presentation.proximity.bluetooth.activation.alert.message"
      ),
      [
        {
          text: I18n.t(
            "features.itWallet.presentation.proximity.bluetooth.activation.alert.text"
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
        "features.itWallet.presentation.proximity.bluetooth.activation.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.bluetooth.activation.subtitle"
      )}
      listItemHeaderLabel={I18n.t(
        "features.itWallet.presentation.proximity.bluetooth.activation.listItems.title"
      )}
      renderItems={[
        {
          label: I18n.t(
            "features.itWallet.presentation.proximity.bluetooth.activation.listItems.step1.label"
          ),
          value: I18n.t(
            "features.itWallet.presentation.proximity.bluetooth.activation.listItems.step1.value"
          ),
          icon:
            Platform.OS === "ios"
              ? "systemSettingsiOS"
              : "systemSettingsAndroid"
        },
        {
          label: I18n.t(
            "features.itWallet.presentation.proximity.bluetooth.activation.listItems.step2.label"
          ),
          value: I18n.t(
            "features.itWallet.presentation.proximity.bluetooth.activation.listItems.step2.value"
          ),
          icon: "systemAppsAndroid"
        },
        {
          label: I18n.t(
            "features.itWallet.presentation.proximity.bluetooth.activation.listItems.step3.label"
          ),
          value: I18n.t(
            "features.itWallet.presentation.proximity.bluetooth.activation.listItems.step3.value"
          ),
          icon: "systemToggleInstructions"
        }
      ]}
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t(
            "features.itWallet.presentation.proximity.bluetooth.activation.actions.primary"
          ),
          onPress: () => {
            trackItwProximityBluetoothActivationGoToSettings();
            openBluetoothPreferences();
          }
        },
        secondary: {
          label: I18n.t(
            "features.itWallet.presentation.proximity.bluetooth.activation.actions.secondary"
          ),
          onPress: handleContinue
        }
      }}
    />
  );
};
