import {
  HeaderSecondLevel,
  IOColors,
  IOThemeContext,
  IOThemes,
  IconButton,
  makeFontStyleObject,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import { ThemeProvider, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import I18n from "i18n-js";
import * as React from "react";
import { Alert, Platform, useColorScheme } from "react-native";
import HeaderFirstLevel from "../../../components/ui/HeaderFirstLevel";
import {
  IONavigationDarkTheme,
  IONavigationLightTheme
} from "../../../theme/navigations";
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
import { DSIcons } from "../core/DSIcons";
import { DSLayout } from "../core/DSLayout";
import { DSLegacyButtons } from "../core/DSLegacyButtons";
import { DSLegacyIllustrations } from "../core/DSLegacyIllustrations";
import { DSLegacyPictograms } from "../core/DSLegacyPictograms";
import { DSListItems } from "../core/DSListItems";
import { DSLoaders } from "../core/DSLoaders";
import { DSLogos } from "../core/DSLogos";
import { DSModules } from "../core/DSModules";
import { DSNumberPad } from "../core/DSNumberPad";
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
import { DesignSystemParamsList } from "./params";
import DESIGN_SYSTEM_ROUTES from "./routes";

const Stack = createNativeStackNavigator<DesignSystemParamsList>();

// BackButton managed through React Navigation
const RNNBackButton = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  return (
    <IconButton
      icon={Platform.OS === "ios" ? "backiOS" : "backAndroid"}
      color={colorScheme === "dark" ? "contrast" : "neutral"}
      onPress={() => {
        navigation.goBack();
      }}
      accessibilityLabel={""}
    />
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

export const DesignSystemNavigator = () => {
  const { isExperimental } = useIOExperimentalDesign();
  const colorScheme = useColorScheme();

  const IODSNavigationLightTheme = {
    ...IONavigationLightTheme,
    colors: {
      ...IONavigationLightTheme.colors,
      primary: isExperimental ? IOColors["blueIO-500"] : IOColors.blue
    }
  };

  return (
    <ThemeProvider
      value={
        colorScheme === "dark"
          ? IONavigationDarkTheme
          : IODSNavigationLightTheme
      }
    >
      <IOThemeContext.Provider
        value={colorScheme === "dark" ? IOThemes.dark : IOThemes.light}
      >
        <Stack.Navigator
          initialRouteName={DESIGN_SYSTEM_ROUTES.MAIN.route}
          screenOptions={{
            headerTitleStyle: {
              ...makeFontStyleObject(
                "Regular",
                false,
                isExperimental ? "ReadexPro" : "TitilliumWeb"
              ),
              fontSize: 16
            },
            headerTitleAlign: "center",
            headerBackTitleVisible: false,
            headerShown: true,
            autoHideHomeIndicator: true
          }}
        >
          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.MAIN.route}
            component={DesignSystem}
            options={{
              title: DESIGN_SYSTEM_ROUTES.MAIN.title,
              headerLeft: RNNBackButton
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.FOUNDATION.COLOR.route}
            component={DSColors}
            options={{
              title: DESIGN_SYSTEM_ROUTES.FOUNDATION.COLOR.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.FOUNDATION.TYPOGRAPHY.route}
            component={DSTypography}
            options={{
              title: DESIGN_SYSTEM_ROUTES.FOUNDATION.TYPOGRAPHY.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LAYOUT.route}
            component={DSLayout}
            options={{
              title: DESIGN_SYSTEM_ROUTES.FOUNDATION.LAYOUT.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.FOUNDATION.ICONS.route}
            component={DSIcons}
            options={{
              title: DESIGN_SYSTEM_ROUTES.FOUNDATION.ICONS.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.FOUNDATION.PICTOGRAMS.route}
            component={DSPictograms}
            options={{
              title: DESIGN_SYSTEM_ROUTES.FOUNDATION.PICTOGRAMS.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LOGOS.route}
            component={DSLogos}
            options={{
              title: DESIGN_SYSTEM_ROUTES.FOUNDATION.LOGOS.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LOADERS.route}
            component={DSLoaders}
            options={{
              title: DESIGN_SYSTEM_ROUTES.FOUNDATION.LOADERS.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.FOUNDATION.HAPTIC_FEEDBACK.route}
            component={DSHapticFeedback}
            options={{
              title: DESIGN_SYSTEM_ROUTES.FOUNDATION.HAPTIC_FEEDBACK.title
            }}
          />

          {/* COMPONENTS */}
          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BUTTONS.route}
            component={DSButtons}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.BUTTONS.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.SELECTION.route}
            component={DSSelection}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.SELECTION.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.TEXT_FIELDS.route}
            component={DSTextFields}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.TEXT_FIELDS.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BADGE.route}
            component={DSBadges}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.BADGE.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.LIST_ITEMS.route}
            component={DSListItems}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.LIST_ITEMS.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.MODULES.route}
            component={DSModules}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.MODULES.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.CARDS.route}
            component={DSCards}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.CARDS.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.TOASTS.route}
            component={DSToastNotifications}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.TOASTS.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ACCORDION.route}
            component={DSAccordion}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.ACCORDION.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ALERT.route}
            component={DSAlert}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.ALERT.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ADVICE.route}
            component={DSAdvice}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.ADVICE.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BOTTOM_SHEET.route}
            component={DSBottomSheet}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.BOTTOM_SHEET.title
            }}
          />

          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.route}
            component={DSTabNavigation}
            options={{
              title: DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title
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
              title: DESIGN_SYSTEM_ROUTES.SCREENS.GRADIENT_SCROLL.title
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

          <Stack.Group
            screenOptions={{
              presentation: "formSheet"
            }}
          >
            <Stack.Screen
              name={DESIGN_SYSTEM_ROUTES.DEBUG.FULL_SCREEN_MODAL.route}
              component={DSFullScreenModal}
              options={{
                header: ({ navigation }) => (
                  <HeaderSecondLevel
                    title={DESIGN_SYSTEM_ROUTES.DEBUG.FULL_SCREEN_MODAL.title}
                    transparent
                    isModal
                    type="singleAction"
                    firstAction={{
                      icon: "closeMedium",
                      onPress: () => {
                        navigation.goBack();
                      },
                      accessibilityLabel: I18n.t("global.buttons.back")
                    }}
                  />
                )
              }}
            />
          </Stack.Group>

          {/* LEGACY */}
          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.LEGACY.PICTOGRAMS.route}
            component={DSLegacyPictograms}
            options={{
              title: DESIGN_SYSTEM_ROUTES.LEGACY.PICTOGRAMS.title
            }}
          />
          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.LEGACY.BUTTONS.route}
            component={DSLegacyButtons}
            options={{
              title: DESIGN_SYSTEM_ROUTES.LEGACY.BUTTONS.title
            }}
          />
          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.LEGACY.ILLUSTRATIONS.route}
            component={DSLegacyIllustrations}
            options={{
              title: DESIGN_SYSTEM_ROUTES.LEGACY.ILLUSTRATIONS.title
            }}
          />
        </Stack.Navigator>
      </IOThemeContext.Provider>
    </ThemeProvider>
  );
};
