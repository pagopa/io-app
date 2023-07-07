import {
  StackNavigationOptions,
  TransitionPresets,
  createStackNavigator
} from "@react-navigation/stack";
import * as React from "react";
import { View, useColorScheme } from "react-native";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { isGestureEnabled } from "../../../utils/navigation";
import { DesignSystem } from "../DesignSystem";
import { DSColors } from "../core/DSColors";
import { DSTypography } from "../core/DSTypography";
import { DSIcons } from "../core/DSIcons";
import { DSButtons } from "../core/DSButtons";
import { DSTextFields } from "../core/DSTextFields";
import { DSBadges } from "../core/DSBadges";
import { DSLegacyButtons } from "../core/DSLegacyButtons";
import { DSLegacyPictograms } from "../core/DSLegacyPictograms";
import { DSLegacyIllustrations } from "../core/DSLegacyIllustrations";
import { DSPictograms } from "../core/DSPictograms";
import { DSLogos } from "../core/DSLogos";
import { DSToastNotifications } from "../core/DSToastNotifications";
import { DSSelection } from "../core/DSSelection";
import { DSAdvice } from "../core/DSAdvice";
import { DSAccordion } from "../core/DSAccordion";
import { DSListItems } from "../core/DSListItems";
import { DSLayout } from "../core/DSLayout";
import { DSAlert } from "../core/DSAlert";
import { DSLoaders } from "../core/DSLoaders";
import { DSHapticFeedback } from "../core/DSHapticFeedback";
import { DSBottomSheet } from "../core/DSBottomSheet";
import { DSSafeArea } from "../core/DSSafeArea";
import { DSSafeAreaCentered } from "../core/DSSafeAreaCentered";
import { DSEdgeToEdgeArea } from "../core/DSEdgeToEdgeArea";
import {
  IOThemeContext,
  IOThemes
} from "../../../components/core/variables/IOColors";
import IconButton from "../../../components/ui/IconButton";
import { IOVisualCostants } from "../../../components/core/variables/IOStyles";
import { DSFullScreenModal } from "../core/DSFullScreenModal";
import { makeFontStyleObject } from "../../../components/core/fonts";
import { DesignSystemModalParamsList, DesignSystemParamsList } from "./params";
import DESIGN_SYSTEM_ROUTES from "./routes";

const Stack = createStackNavigator<DesignSystemParamsList>();
const ModalStack = createStackNavigator<DesignSystemModalParamsList>();

// BackButton managed through React Navigation
const RNNBackButton = () => {
  const navigation = useNavigation();

  return (
    <View style={{ marginLeft: IOVisualCostants.appMarginDefault }}>
      <IconButton
        icon="backiOS"
        color="neutral"
        onPress={() => {
          navigation.goBack();
        }}
        accessibilityLabel={""}
      />
    </View>
  );
};

const RNNCloseButton = () => {
  const navigation = useNavigation();

  return (
    <View style={{ marginRight: IOVisualCostants.appMarginDefault }}>
      <IconButton
        icon="closeMedium"
        color="neutral"
        onPress={() => {
          navigation.goBack();
        }}
        accessibilityLabel={""}
      />
    </View>
  );
};

const customModalHeaderConf: StackNavigationOptions = {
  headerLeft: () => null,
  headerTitle: () => null,
  headerRight: RNNCloseButton,
  headerStyle: { height: IOVisualCostants.headerHeight },
  headerStatusBarHeight: 0
};

export const DesignSystemNavigator = () => {
  const colorScheme = useColorScheme();

  return (
    <IOThemeContext.Provider
      value={colorScheme === "dark" ? IOThemes.dark : IOThemes.light}
    >
      {/* You need two nested navigators to apply the modal
      behavior only to the single screen and not to any other.
      Read documentation for reference:
      https://reactnavigation.org/docs/5.x/modal/#creating-a-modal-stack
      
      With RN Navigation 6.x it's much easier because you can
      use the Group function */}
      <ModalStack.Navigator
        mode="modal"
        headerMode="screen"
        screenOptions={{
          gestureEnabled: isGestureEnabled,
          cardOverlayEnabled: true,
          ...TransitionPresets.ModalPresentationIOS
        }}
      >
        <ModalStack.Screen
          name={DESIGN_SYSTEM_ROUTES.MAIN.route}
          component={DesignSystemMainStack}
          options={{ headerShown: false }}
        />
        <ModalStack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.FULL_SCREEN_MODAL.route}
          component={DSFullScreenModal}
          options={customModalHeaderConf}
        />
      </ModalStack.Navigator>
    </IOThemeContext.Provider>
  );
};

const DesignSystemMainStack = () => {
  const insets = useSafeAreaInsets();

  const customHeaderConf: StackNavigationOptions = useMemo(
    () => ({
      headerTitleStyle: {
        ...makeFontStyleObject("Regular", false, "ReadexPro"),
        fontSize: 14
      },
      headerStyle: { height: insets.top + IOVisualCostants.headerHeight },
      headerLeft: RNNBackButton
    }),
    [insets]
  );

  return (
    <Stack.Navigator
      initialRouteName={DESIGN_SYSTEM_ROUTES.MAIN.route}
      headerMode="screen"
    >
      <ModalStack.Screen
        name={DESIGN_SYSTEM_ROUTES.MAIN.route}
        component={DesignSystem}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.MAIN.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.COLOR.route}
        component={DSColors}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.COLOR.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.TYPOGRAPHY.route}
        component={DSTypography}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.TYPOGRAPHY.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LAYOUT.route}
        component={DSLayout}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.TYPOGRAPHY.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.ICONS.route}
        component={DSIcons}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.ICONS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.PICTOGRAMS.route}
        component={DSPictograms}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.PICTOGRAMS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LOGOS.route}
        component={DSLogos}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.LOGOS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LOADERS.route}
        component={DSLoaders}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.LOADERS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.HAPTIC_FEEDBACK.route}
        component={DSHapticFeedback}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.HAPTIC_FEEDBACK.title
        }}
      />

      {/* COMPONENTS */}
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BUTTONS.route}
        component={DSButtons}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.BUTTONS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.SELECTION.route}
        component={DSSelection}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.SELECTION.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.TEXT_FIELDS.route}
        component={DSTextFields}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.TEXT_FIELDS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BADGE.route}
        component={DSBadges}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.BADGE.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.LIST_ITEMS.route}
        component={DSListItems}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.LIST_ITEMS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.TOASTS.route}
        component={DSToastNotifications}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.TOASTS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ACCORDION.route}
        component={DSAccordion}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.ACCORDION.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ALERT.route}
        component={DSAlert}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.ALERT.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ADVICE.route}
        component={DSAdvice}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.ADVICE.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BOTTOM_SHEET.route}
        component={DSBottomSheet}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.BOTTOM_SHEET.title
        }}
      />

      {/* DEBUG */}
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.DEBUG.SAFE_AREA.route}
        component={DSSafeArea}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.DEBUG.SAFE_AREA_CENTERED.route}
        component={DSSafeAreaCentered}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.DEBUG.EDGE_TO_EDGE_AREA.route}
        component={DSEdgeToEdgeArea}
        options={{ headerShown: false }}
      />

      {/* LEGACY */}
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.LEGACY.PICTOGRAMS.route}
        component={DSLegacyPictograms}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.PICTOGRAMS.title
        }}
      />
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.LEGACY.BUTTONS.route}
        component={DSLegacyButtons}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.BUTTONS.title
        }}
      />
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.LEGACY.ILLUSTRATIONS.route}
        component={DSLegacyIllustrations}
        options={{
          ...customHeaderConf,
          headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.ILLUSTRATIONS.title
        }}
      />
    </Stack.Navigator>
  );
};
