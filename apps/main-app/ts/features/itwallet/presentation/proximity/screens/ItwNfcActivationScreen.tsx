import I18n from "i18next";
import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";

import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import {
  trackItwProximityNfcActivation,
  trackItwProximityNfcActivationClose,
  trackItwProximityNfcGoToSettings
} from "../analytics";
import { ItwProximityMachineContext } from "../machine/provider";
import { selectIsLoading } from "../machine/selectors";
import { checkNfcActivation, openNfcPreferences } from "../utils/nfc";

export const ItwNfcActivationScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();
  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);
  const nfcStartupPending = useRef(false);

  useEffect(() => {
    trackItwProximityNfcActivation();
  }, []);

  useEffect(() => {
    const subscription = machineRef.subscribe(snapshot => {
      if (!nfcStartupPending.current) {
        return;
      }
      if (
        snapshot.context.engagementMode === "nfc" &&
        (snapshot.matches({ Presentment: "Starting" }) ||
          snapshot.matches({ Presentment: "AwaitingNfcStart" }))
      ) {
        return;
      }

      nfcStartupPending.current = false;
      if (snapshot.matches({ Nfc: "RequireActivation" })) {
        showNfcActivationAlert(() => machineRef.send({ type: "close" }));
      }
    });
    return () => subscription.unsubscribe();
  }, [machineRef]);

  useHeaderSecondLevel({
    title: "",
    goBack: () => {
      trackItwProximityNfcActivationClose();
      machineRef.send({ type: "close" });
    }
  });

  const handleContinue = async () => {
    // iOS contactless consent is confirmed by the machine's nfc-started event.
    if (Platform.OS === "ios") {
      nfcStartupPending.current = true;
      machineRef.send({ type: "continue" });
      return;
    }
    if (await checkNfcActivation()) {
      machineRef.send({ type: "continue" });
      return;
    }

    showNfcActivationAlert(() => machineRef.send({ type: "close" }));
  };

  return (
    <IOScrollViewWithListItems
      actions={{
        type: "TwoButtons",
        primary: {
          disabled: isLoading,
          label: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.actions.primary"
          ),
          onPress: () => {
            trackItwProximityNfcGoToSettings();
            void openNfcPreferences();
          }
        },
        secondary: {
          disabled: isLoading,
          label: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.actions.secondary"
          ),
          onPress: () => void handleContinue()
        }
      }}
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
            Platform.OS === "ios"
              ? "features.itWallet.presentation.proximity.nfc.activation.listItems.step2.value_ios"
              : "features.itWallet.presentation.proximity.nfc.activation.listItems.step2.value"
          ),
          icon: "systemAppsAndroid"
        },
        {
          label: I18n.t(
            "features.itWallet.presentation.proximity.nfc.activation.listItems.step3.label"
          ),
          value: I18n.t(
            Platform.OS === "ios"
              ? "features.itWallet.presentation.proximity.nfc.activation.listItems.step3.value_ios"
              : "features.itWallet.presentation.proximity.nfc.activation.listItems.step3.value"
          ),
          icon: "systemToggleInstructions"
        }
      ]}
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.nfc.activation.subtitle"
      )}
      title={I18n.t(
        "features.itWallet.presentation.proximity.nfc.activation.title"
      )}
    />
  );
};

const showNfcActivationAlert = (onClose: () => void) =>
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
          trackItwProximityNfcGoToSettings();
          void openNfcPreferences();
        }
      },
      {
        text: I18n.t(
          "features.itWallet.presentation.proximity.nfc.activation.alert.close"
        ),
        onPress: () => {
          trackItwProximityNfcActivationClose();
          onClose();
        },
        style: "cancel"
      }
    ]
  );
