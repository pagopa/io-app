import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { Alert, Platform } from "react-native";

import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import { useHardwareBackButtonWhenFocused } from "../../../../../hooks/useHardwareBackButton";
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

  const handleClose = () => {
    trackItwProximityBluetoothActivationClose();
    machineRef.send({ type: "close" });
  };

  useHeaderSecondLevel({
    title: "",
    goBack: handleClose
  });

  // On Android the back gesture/button would otherwise pop this screen and
  // land on the presentment screen with an empty QR code
  useHardwareBackButtonWhenFocused(() => {
    handleClose();
    return true;
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
          onPress: () => void handleContinue()
        }
      }}
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
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.bluetooth.activation.subtitle"
      )}
      title={I18n.t(
        "features.itWallet.presentation.proximity.bluetooth.activation.title"
      )}
    />
  );
};
