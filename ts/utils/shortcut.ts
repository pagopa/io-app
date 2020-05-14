import { DeviceEventEmitter, Platform } from "react-native";
import QuickActions from "react-native-quick-actions";
import { NavigationNavigateActionPayload } from "react-navigation";
import I18n from "../i18n";
import { getNavigateActionFromDeepLink } from "./deepLink";

// Create an action from the deep link
const shortcutAction = (
  data: any,
  setDeepLink: (
    navigationPayload: NavigationNavigateActionPayload,
    immediate: boolean
  ) => void
) => {
  if (data !== null && data.userInfo !== null) {
    const action = getNavigateActionFromDeepLink(data.userInfo.url);
    // immediately navigate to the resolved action
    setDeepLink(action, true);
  }
};

const isSupportedVersion = Platform.OS === "android" && Platform.Version > 24;

// Listener for app in background
const addListener = (
  setDeepLink: (
    navigationPayload: NavigationNavigateActionPayload,
    immediate: boolean
  ) => void
) => {
  if (isSupportedVersion) {
    // Shortcut listener app foreground/background
    DeviceEventEmitter.addListener("quickActionShortcut", data =>
      shortcutAction(data, setDeepLink)
    );
  }
};

// Get any actions sent when the app is cold-launched
const popInitialAction = (
  setDeepLink: (
    navigationPayload: NavigationNavigateActionPayload,
    immediate: boolean
  ) => void
) => {
  if (isSupportedVersion) {
    // Get shortcuts
    QuickActions.popInitialAction()
      .then(data => shortcutAction(data, setDeepLink))
      .catch();
  }
};

const clearShortcutItems = () => {
  // Remove the shortcuts
  if (isSupportedVersion) {
    DeviceEventEmitter.removeAllListeners();
    QuickActions.clearShortcutItems();
  }
};

// Create the shortcuts
const setShortcutItems = () => {
  QuickActions.setShortcutItems([
    {
      type: "QRSCREEN",
      title: I18n.t("wallet.payNotice"),
      subtitle: I18n.t("wallet.payNoticeLong"),
      icon: "qrcode_shortcuts",
      userInfo: {
        url: "ioit://ioit/PAYMENT_SCAN_QR_CODE"
      }
    }
  ]);
};

const Shortcut = {
  addListener: (
    setDeepLink: (
      navigationPayload: NavigationNavigateActionPayload,
      immediate: boolean
    ) => void
  ) => addListener(setDeepLink),

  popInitialAction: (
    setDeepLink: (
      navigationPayload: NavigationNavigateActionPayload,
      immediate: boolean
    ) => void
  ) => popInitialAction(setDeepLink),

  clearShortcutItems: () => clearShortcutItems(),

  setShortcutItems: () => setShortcutItems()
};

export default Shortcut;
