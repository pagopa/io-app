import I18n from "i18next";
import { Alert, Platform } from "react-native";
import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { ItwProximityMachineContext } from "../machine/provider";
import { checkNfcActivation, openNfcPreferences } from "../utils/nfc";

export const ItwNfcActivationScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();

  useHeaderSecondLevel({
    title: "",
    goBack: () => {
      machineRef.send({ type: "close" });
    }
  });

  const handleContinue = async () => {
    const isNfcActive = await checkNfcActivation();
    if (isNfcActive) {
      machineRef.send({ type: "continue" });
      return;
    }

    Alert.alert(
      I18n.t(
        "features.itWallet.presentation.proximity.nfc.activation.alert.title"
      ),
      I18n.t(
        "features.itWallet.presentation.proximity.nfc.activation.alert.message"
      ),
      [
        {
          text: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.alert.action"
          ),
          onPress: () => {
            void openNfcPreferences();
          }
        },
        {
          text: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.alert.close"
          ),
          onPress: () => {
            machineRef.send({ type: "close" });
          },
          style: "cancel"
        }
      ]
    );
  };

  return (
    <IOScrollViewWithListItems
      title={I18n.t(
        "features.itWallet.presentation.proximity.nfc.activation.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.nfc.activation.subtitle"
      )}
      listItemHeaderLabel={I18n.t(
        "features.itWallet.presentation.proximity.nfc.activation.listItems.title"
      )}
      renderItems={[
        {
          label: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.listItems.step1.label"
          ),
          value: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.listItems.step1.value"
          ),
          icon:
            Platform.OS === "ios"
              ? "systemSettingsiOS"
              : "systemSettingsAndroid"
        },
        {
          label: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.listItems.step2.label"
          ),
          value: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.listItems.step2.value"
          ),
          icon: "systemAppsAndroid"
        },
        {
          label: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.listItems.step3.label"
          ),
          value: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.listItems.step3.value"
          ),
          icon: "systemToggleInstructions"
        }
      ]}
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.actions.primary"
          ),
          onPress: () => {
            void openNfcPreferences();
          }
        },
        secondary: {
          label: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.actions.secondary"
          ),
          onPress: handleContinue
        }
      }}
    />
  );
};
