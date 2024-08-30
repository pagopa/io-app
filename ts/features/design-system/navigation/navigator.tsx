import {
  IOVisualCostants,
  IconButton,
  useIOExperimentalDesign,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { ThemeProvider, useNavigation } from "@react-navigation/native";
import {
  StackNavigationOptions,
  TransitionPresets,
  createStackNavigator
} from "@react-navigation/stack";
import * as React from "react";
import { Alert, Platform, View } from "react-native";
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
import { DSFooterActions } from "../core/DSFooterActions";
import { DSFooterActionsNotFixed } from "../core/DSFooterActionsNotFixed";
import { DSFooterActionsSticky } from "../core/DSFooterActionsSticky";
import { DSFullScreenModal } from "../core/DSFullScreenModal";
import { DSHapticFeedback } from "../core/DSHapticFeedback";
import { DSHeaderFirstLevel } from "../core/DSHeaderFirstLevel";
import { DSHeaderSecondLevel } from "../core/DSHeaderSecondLevel";
import { DSHeaderSecondLevelWithSectionTitle } from "../core/DSHeaderSecondLevelWithSectionTitle";
import { DSIOMarkdown } from "../core/DSIOMarkdown";
import { DSIOScrollView } from "../core/DSIOScrollView";
import { DSIOScrollViewScreenWithLargeHeader } from "../core/DSIOScrollViewWithLargeHeader";
import { DSIOScrollViewWithoutActions } from "../core/DSIOScrollViewWithoutActions";
import { DSIcons } from "../core/DSIcons";
import { DSLayout } from "../core/DSLayout";
import { DSLegacyAccordion } from "../core/DSLegacyAccordion";
import { DSLegacyAdvice } from "../core/DSLegacyAdvice";
import { DSLegacyAlert } from "../core/DSLegacyAlert";
import { DSLegacyBadges } from "../core/DSLegacyBadges";
import { DSLegacyButtons } from "../core/DSLegacyButtons";
import { DSLegacyListItems } from "../core/DSLegacyListItems";
import { DSLegacyPictograms } from "../core/DSLegacyPictograms";
import { DSLegacySelection } from "../core/DSLegacySelection";
import { DSLegacyTextFields } from "../core/DSLegacyTextFields";
import { DSLegacyTypography } from "../core/DSLegacyTypography";
import DSListItemScreen from "../core/DSListItemScreen";
import { DSListItems } from "../core/DSListItems";
import { DSLoaders } from "../core/DSLoaders";
import { DSLogos } from "../core/DSLogos";
import { DSModules } from "../core/DSModules";
import { DSNumberPad } from "../core/DSNumberPad";
import { DSOTPInput } from "../core/DSOTPInput";
import { DSPictograms } from "../core/DSPictograms";
import { DSSafeArea } from "../core/DSSafeArea";
import { DSSafeAreaCentered } from "../core/DSSafeAreaCentered";
import { DSScreenEndMargin } from "../core/DSScreenEndMargin";
import { DSScreenOperationResult } from "../core/DSScreenOperationResult";
import { DSSelection } from "../core/DSSelection";
import { DSStepper } from "../core/DSStepper";
import { DSTabNavigation } from "../core/DSTabNavigation";
import { DSTextFields } from "../core/DSTextFields";
import { DSToastNotifications } from "../core/DSToastNotifications";
import { DSTypography } from "../core/DSTypography";
import { DSWallet } from "../core/DSWallet";
import { DSWizardScreen } from "../core/DSWizardScreen";
import { DesignSystemParamsList } from "./params";
import DESIGN_SYSTEM_ROUTES from "./routes";

const Stack = createStackNavigator<DesignSystemParamsList>();

// BackButton managed through React Navigation
const RNNBackButton = () => {
  const navigation = useNavigation();
  const { themeType } = useIOThemeContext();
  return (
    <View style={{ marginLeft: IOVisualCostants.appMarginDefault }}>
      <IconButton
        icon={Platform.select({
          android: "backAndroid",
          default: "backiOS"
        })}
        color={themeType === "dark" ? "contrast" : "neutral"}
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
  const { isExperimental } = useIOExperimentalDesign();
  const { themeType } = useIOThemeContext();

  const customHeaderConf: StackNavigationOptions = {
    headerTitleStyle: {
      ...(isExperimental
        ? makeFontStyleObject("Regular", false, "ReadexPro")
        : makeFontStyleObject("Semibold", false, "TitilliumSansPro")),
      fontSize: 14
    },
    headerTitleAlign: "center",
    headerLeft: RNNBackButton
  };

  return (
    <ThemeProvider
      value={
        themeType === "dark" ? IONavigationDarkTheme : IONavigationLightTheme
      }
    >
      <Stack.Navigator
        initialRouteName={DESIGN_SYSTEM_ROUTES.MAIN.route}
        screenOptions={customHeaderConf}
      >
        <Stack.Screen
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
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.OTP_INPUT.route}
          component={DSOTPInput}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.OTP_INPUT.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.STEPPER.route}
          component={DSStepper}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.STEPPER.title
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

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.WALLET.route}
          component={DSWallet}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.WALLET.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.IO_MARKDOWN.route}
          component={DSIOMarkdown}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.IO_MARKDOWN.title
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
          name={DESIGN_SYSTEM_ROUTES.SCREENS.LIST_ITEM_SCREEN.route}
          component={DSListItemScreen}
          options={{ headerShown: true }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.BONUS_CARD_SCREEN.route}
          component={DSBonusCardScreen}
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

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.SCREEN_END_MARGIN.route}
          component={DSScreenEndMargin}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.DEBUG.SCREEN_END_MARGIN.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.IOSCROLLVIEW.route}
          component={DSIOScrollView}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.DEBUG.IOSCROLLVIEW.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.IOSCROLLVIEW_WO_ACTIONS.route}
          component={DSIOScrollViewWithoutActions}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.DEBUG.IOSCROLLVIEW_WO_ACTIONS.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.IOSCROLLVIEW_LARGEHEADER.route}
          component={DSIOScrollViewScreenWithLargeHeader}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.DEBUG.IOSCROLLVIEW_LARGEHEADER.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.FOOTER_ACTIONS.route}
          component={DSFooterActions}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.DEBUG.FOOTER_ACTIONS.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.FOOTER_ACTIONS_STICKY.route}
          component={DSFooterActionsSticky}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.DEBUG.FOOTER_ACTIONS_STICKY.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.FOOTER_ACTIONS_NOT_FIXED.route}
          component={DSFooterActionsNotFixed}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.DEBUG.FOOTER_ACTIONS_NOT_FIXED.title
          }}
        />

        <Stack.Group
          screenOptions={
            Platform.OS === "ios"
              ? {
                  gestureEnabled: isGestureEnabled,
                  cardOverlayEnabled: true,
                  headerMode: "screen",
                  presentation: "modal",
                  ...TransitionPresets.ModalPresentationIOS
                }
              : {
                  headerMode: "screen",
                  presentation: "modal"
                }
          }
        >
          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.DEBUG.FULL_SCREEN_MODAL.route}
            component={DSFullScreenModal}
            options={customModalHeaderConf}
          />
        </Stack.Group>

        {/* LEGACY */}
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.TYPOGRAPHY.route}
          component={DSLegacyTypography}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.TYPOGRAPHY.title
          }}
        />

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
          name={DESIGN_SYSTEM_ROUTES.LEGACY.TEXT_FIELDS.route}
          component={DSLegacyTextFields}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.TEXT_FIELDS.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.LIST_ITEMS.route}
          component={DSLegacyListItems}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.LIST_ITEMS.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.BADGES.route}
          component={DSLegacyBadges}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.BADGES.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.SELECTION.route}
          component={DSLegacySelection}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.SELECTION.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.ACCORDION.route}
          component={DSLegacyAccordion}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.ACCORDION.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.ALERT.route}
          component={DSLegacyAlert}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.ALERT.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.ADVICE.route}
          component={DSLegacyAdvice}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.ADVICE.title
          }}
        />
      </Stack.Navigator>
    </ThemeProvider>
  );
};
