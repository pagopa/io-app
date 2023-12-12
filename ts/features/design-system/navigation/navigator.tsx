import {
  IOThemeContext,
  IOThemes,
  IOVisualCostants,
  IconButton
} from "@pagopa/io-app-design-system";
import { ThemeProvider, useNavigation } from "@react-navigation/native";
import {
  StackNavigationOptions,
  TransitionPresets,
  createStackNavigator
} from "@react-navigation/stack";
import * as React from "react";
import { useMemo } from "react";
import { Alert, Platform, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeFontStyleObject } from "../../../components/core/fonts";
import HeaderFirstLevel from "../../../components/ui/HeaderFirstLevel";
import {
  IONavigationDarkTheme,
  IONavigationLightTheme
} from "../../../theme/navigations";
import { isGestureEnabled } from "../../../utils/navigation";
import { DesignSystem } from "../DesignSystem";
import { DSAccordion } from "../core/DSAccordion";
import { DSAdvice } from "../core/DSAdvice";
import { DSAlert } from "../core/DSAlert";
import { DSBadges } from "../core/DSBadges";
import { DSBonusCardScreen } from "../core/DSBonusCardScreen";
import { DSBottomSheet } from "../core/DSBottomSheet";
import { DSButtons } from "../core/DSButtons";
import { DSCards } from "../core/DSCards";
import { DSColors } from "../core/DSColors";
import { DSEdgeToEdgeArea } from "../core/DSEdgeToEdgeArea";
import { DSFullScreenModal } from "../core/DSFullScreenModal";
import { DSGradientScroll } from "../core/DSGradientScroll";
import { DSHapticFeedback } from "../core/DSHapticFeedback";
import { DSHeaderFirstLevel } from "../core/DSHeaderFirstLevel";
import { DSHeaderSecondLevel } from "../core/DSHeaderSecondLevel";
import { DSHeaderSecondLevelWithSectionTitle } from "../core/DSHeaderSecondLevelWithSectionTitle";
import { DSNumberPad } from "../core/DSNumberPad";
import { DSIcons } from "../core/DSIcons";
import { DSLayout } from "../core/DSLayout";
import { DSLegacyButtons } from "../core/DSLegacyButtons";
import { DSLegacyIllustrations } from "../core/DSLegacyIllustrations";
import { DSLegacyPictograms } from "../core/DSLegacyPictograms";
import { DSListItems } from "../core/DSListItems";
import { DSLoaders } from "../core/DSLoaders";
import { DSLogos } from "../core/DSLogos";
import { DSModules } from "../core/DSModules";
import { DSPictograms } from "../core/DSPictograms";
import { DSSafeArea } from "../core/DSSafeArea";
import { DSSafeAreaCentered } from "../core/DSSafeAreaCentered";
import { DSScreenOperationResult } from "../core/DSScreenOperationResult";
import { DSSelection } from "../core/DSSelection";
import { DSTabNavigation } from "../core/DSTabNavigation";
import { DSTextFields } from "../core/DSTextFields";
import { DSToastNotifications } from "../core/DSToastNotifications";
import { DSTypography } from "../core/DSTypography";
import { DSWizardScreen } from "../core/DSWizardScreen";
import { DesignSystemModalParamsList, DesignSystemParamsList } from "./params";
import DESIGN_SYSTEM_ROUTES from "./routes";

const Stack = createStackNavigator<DesignSystemParamsList>();
const ModalStack = createStackNavigator<DesignSystemModalParamsList>();

// BackButton managed through React Navigation
const RNNBackButton = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  return (
    <View style={{ marginLeft: IOVisualCostants.appMarginDefault }}>
      <IconButton
        icon="backiOS"
        color={colorScheme === "dark" ? "contrast" : "neutral"}
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

const HeaderFirstLevelComponent = () => (
  <HeaderFirstLevel
    title="Portafoglio"
    firstAction={
      <IconButton
        accessibilityLabel="Tap to trigger test alert"
        icon="coggle"
        onPress={() => {
          Alert.alert("Settings");
        }}
      />
    }
    secondAction={
      <IconButton
        accessibilityLabel="Tap to trigger test alert"
        icon="help"
        onPress={() => {
          Alert.alert("Assistance");
        }}
      />
    }
  />
);

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
    <ThemeProvider
      value={
        colorScheme === "dark" ? IONavigationDarkTheme : IONavigationLightTheme
      }
    >
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
          screenOptions={
            Platform.OS === "ios"
              ? {
                  gestureEnabled: isGestureEnabled,
                  cardOverlayEnabled: true,
                  ...TransitionPresets.ModalPresentationIOS
                }
              : {}
          }
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
    </ThemeProvider>
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
      headerTitleAlign: "center",
      headerStyle: { height: insets.top + IOVisualCostants.headerHeight },
      headerLeft: RNNBackButton
    }),
    [insets]
  );

  return (
    <Stack.Navigator
      initialRouteName={DESIGN_SYSTEM_ROUTES.MAIN.route}
      headerMode="screen"
      screenOptions={customHeaderConf}
    >
      <ModalStack.Screen
        name={DESIGN_SYSTEM_ROUTES.MAIN.route}
        component={DesignSystem}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.MAIN.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.COLOR.route}
        component={DSColors}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.COLOR.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.TYPOGRAPHY.route}
        component={DSTypography}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.TYPOGRAPHY.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LAYOUT.route}
        component={DSLayout}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.LAYOUT.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.ICONS.route}
        component={DSIcons}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.ICONS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.PICTOGRAMS.route}
        component={DSPictograms}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.PICTOGRAMS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LOGOS.route}
        component={DSLogos}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.LOGOS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LOADERS.route}
        component={DSLoaders}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.LOADERS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.FOUNDATION.HAPTIC_FEEDBACK.route}
        component={DSHapticFeedback}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.FOUNDATION.HAPTIC_FEEDBACK.title
        }}
      />

      {/* COMPONENTS */}
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BUTTONS.route}
        component={DSButtons}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.BUTTONS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.SELECTION.route}
        component={DSSelection}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.SELECTION.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.TEXT_FIELDS.route}
        component={DSTextFields}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.TEXT_FIELDS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BADGE.route}
        component={DSBadges}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.BADGE.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.LIST_ITEMS.route}
        component={DSListItems}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.LIST_ITEMS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.MODULES.route}
        component={DSModules}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.MODULES.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.CARDS.route}
        component={DSCards}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.CARDS.title
        }}
      />
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.TOASTS.route}
        component={DSToastNotifications}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.TOASTS.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ACCORDION.route}
        component={DSAccordion}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.ACCORDION.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ALERT.route}
        component={DSAlert}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.ALERT.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ADVICE.route}
        component={DSAdvice}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.ADVICE.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BOTTOM_SHEET.route}
        component={DSBottomSheet}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.BOTTOM_SHEET.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.route}
        component={DSTabNavigation}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title
        }}
      />

      {/* HEADERS */}
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.HEADERS.FIRST_LEVEL.route}
        component={DSHeaderFirstLevel}
        options={{
          header: HeaderFirstLevelComponent
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.HEADERS.SECOND_LEVEL.route}
        component={DSHeaderSecondLevel}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.HEADERS.SECOND_LEVEL_SECTION_TITLE.route}
        component={DSHeaderSecondLevelWithSectionTitle}
        options={{
          header: HeaderFirstLevelComponent
        }}
      />

      {/* SCREENS */}
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.SCREENS.GRADIENT_SCROLL.route}
        component={DSGradientScroll}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.SCREENS.GRADIENT_SCROLL.title
        }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.SCREENS.OPERATION_RESULT.route}
        component={DSScreenOperationResult}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.SCREENS.WIZARD_SCREEN.route}
        component={DSWizardScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.SCREENS.BONUS_CARD_SCREEN.route}
        component={DSBonusCardScreen}
        options={{ headerShown: true }}
      />

      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.SCREENS.NUMBERPAD.route}
        component={DSNumberPad}
        options={{ headerShown: false }}
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
          headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.PICTOGRAMS.title
        }}
      />
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.LEGACY.BUTTONS.route}
        component={DSLegacyButtons}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.BUTTONS.title
        }}
      />
      <Stack.Screen
        name={DESIGN_SYSTEM_ROUTES.LEGACY.ILLUSTRATIONS.route}
        component={DSLegacyIllustrations}
        options={{
          headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.ILLUSTRATIONS.title
        }}
      />
    </Stack.Navigator>
  );
};
