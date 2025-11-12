import {
  IOColors,
  IconButton,
  makeFontStyleObject,
  useIOExperimentalDesign,
  useIOTheme,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { ThemeProvider, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import {
  IONavigationDarkTheme,
  IONavigationLightTheme
} from "../../../theme/navigations";
import { isGestureEnabled } from "../../../utils/navigation";
import { DesignSystem } from "../DesignSystem";
import { DSAdvice } from "../core/DSAdvice";
import { DSAlert } from "../core/DSAlert";
import { DSAnimatedPictograms } from "../core/DSAnimatedPictograms";
import { DSBadges } from "../core/DSBadges";
import { DSBonusCardScreen } from "../core/DSBonusCardScreen";
import { DSBottomSheet } from "../core/DSBottomSheet";
import { DSButtons } from "../core/DSButtons";
import { DSCards } from "../core/DSCards";
import { DSCollapsible } from "../core/DSCollapsible";
import { DSColors } from "../core/DSColors";
import { DSDynamicBackground } from "../core/DSDynamicBackground";
import { DSDynamicCardRotation } from "../core/DSDynamicCardRotation";
import { DSEdgeToEdgeArea } from "../core/DSEdgeToEdgeArea";
import { DSFooterActions } from "../core/DSFooterActions";
import { DSFooterActionsInline } from "../core/DSFooterActionsInline";
import { DSFooterActionsInlineNotFixed } from "../core/DSFooterActionsInlineNotFixed";
import { DSFooterActionsNotFixed } from "../core/DSFooterActionsNotFixed";
import { DSFooterActionsSticky } from "../core/DSFooterActionsSticky";
import { DSForceScrollDownView } from "../core/DSForceScrollDownView";
import { DSForceScrollDownViewCustomSlot } from "../core/DSForceScrollDownViewCustomSlot";
import { DSFullScreenModal } from "../core/DSFullScreenModal";
import { DSHapticFeedback } from "../core/DSHapticFeedback";
import { DSHeaderFirstLevel } from "../core/DSHeaderFirstLevel";
import { DSHeaderSecondLevel } from "../core/DSHeaderSecondLevel";
import { DSHeaderSecondLevelWithSectionTitle } from "../core/DSHeaderSecondLevelWithSectionTitle";
import { DSIOListViewWithLargeHeader } from "../core/DSIOListViewWithLargeHeader";
import { DSIOMarkdown } from "../core/DSIOMarkdown";
import { DSIOScrollView } from "../core/DSIOScrollView";
import { DSIOScrollViewCentredContent } from "../core/DSIOScrollViewCentredContent";
import { DSIOScrollViewScreenWithLargeHeader } from "../core/DSIOScrollViewWithLargeHeader";
import { DSIOScrollViewWithListItems } from "../core/DSIOScrollViewWithListItems";
import { DSIOScrollViewWithoutActions } from "../core/DSIOScrollViewWithoutActions";
import { DSItwBrandExploration_1 } from "../core/DSItwBrandExploration_1";
import { DSIcons } from "../core/DSIcons";
import { DSIridescentTrustmark } from "../core/DSIridescentTrustmark";
import { DSLayout } from "../core/DSLayout";
import { DSLegacyAdvice } from "../core/DSLegacyAdvice";
import { DSLegacyButtons } from "../core/DSLegacyButtons";
import { DSListItems } from "../core/DSListItems";
import { DSLoaders } from "../core/DSLoaders";
import { DSLoadingScreen } from "../core/DSLoadingScreen";
import { DSLogos } from "../core/DSLogos";
import { DSModules } from "../core/DSModules";
import { DSNumberPad } from "../core/DSNumberPad";
import { DSOTPInput } from "../core/DSOTPInput";
import { DSPictograms } from "../core/DSPictograms";
import { DSSafeArea } from "../core/DSSafeArea";
import { DSSafeAreaCentered } from "../core/DSSafeAreaCentered";
import { DSScreenEndMargin } from "../core/DSScreenEndMargin";
import { DSScreenOperationResult } from "../core/DSScreenOperationResult";
import { DSScreenOperationResultAnimated } from "../core/DSScreenOperationResultAnimated";
import { DSSelection } from "../core/DSSelection";
import { DSStepper } from "../core/DSStepper";
import { DSTabNavigation } from "../core/DSTabNavigation";
import { DSTextFields } from "../core/DSTextFields";
import { DSToastNotifications } from "../core/DSToastNotifications";
import { DSTypography } from "../core/DSTypography";
import { DSWallet } from "../core/DSWallet";
import { DesignSystemParamsList } from "./params";
import DESIGN_SYSTEM_ROUTES from "./routes";

const Stack = createNativeStackNavigator<DesignSystemParamsList>();

const RNNCloseButton = () => {
  const navigation = useNavigation();
  const { themeType } = useIOThemeContext();

  return (
    <IconButton
      icon="closeMedium"
      color={themeType === "dark" ? "contrast" : "neutral"}
      onPress={() => {
        navigation.goBack();
      }}
      accessibilityLabel={""}
    />
  );
};

export const DesignSystemNavigator = () => {
  const { isExperimental } = useIOExperimentalDesign();
  const { themeType } = useIOThemeContext();
  const theme = useIOTheme();

  const customModalHeaderConf = {
    headerRight: RNNCloseButton,
    title: DESIGN_SYSTEM_ROUTES.DEBUG.FULL_SCREEN_MODAL.title,
    sheetCornerRadius: 24,
    headerTitleStyle: {
      ...makeFontStyleObject(
        14,
        isExperimental ? "Titillio" : "TitilliumSansPro",
        18,
        isExperimental ? "Regular" : "Semibold",
        undefined
      ),
      color: IOColors[theme["textHeading-default"]]
    }
  };

  return (
    <ThemeProvider
      value={
        themeType === "dark" ? IONavigationDarkTheme : IONavigationLightTheme
      }
    >
      <Stack.Navigator
        initialRouteName={DESIGN_SYSTEM_ROUTES.MAIN.route}
        screenOptions={{
          headerTintColor: IOColors[theme["interactiveElem-default"]],
          headerTitleStyle: {
            ...makeFontStyleObject(
              14,
              isExperimental ? "Titillio" : "TitilliumSansPro",
              18,
              isExperimental ? "Regular" : "Semibold",
              undefined
            ),
            color: IOColors[theme["textHeading-default"]]
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
            title: DESIGN_SYSTEM_ROUTES.MAIN.title
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
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.COLLAPSIBLE.route}
          component={DSCollapsible}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.COMPONENTS.COLLAPSIBLE.title
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

        {/* EXPERIMENTAL LAB */}

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB.ANIMATED_PICTOGRAMS.route}
          component={DSAnimatedPictograms}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB.ANIMATED_PICTOGRAMS.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB.DYNAMIC_BACKGROUND.route}
          component={DSDynamicBackground}
          options={{
            headerShown: false,
            headerTitle:
              DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB.DYNAMIC_BACKGROUND.title
          }}
        />

        <Stack.Screen
          name={
            DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB.DYNAMIC_CARD_ROTATION.route
          }
          component={DSDynamicCardRotation}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB.DYNAMIC_CARD_ROTATION.title
          }}
        />

        <Stack.Screen
          name={
            DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB.IRIDESCENT_TRUSTMARK.route
          }
          component={DSIridescentTrustmark}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB.IRIDESCENT_TRUSTMARK.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB.ITWALLET_BRAND_1.route}
          component={DSItwBrandExploration_1}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB.ITWALLET_BRAND_1.title,
            headerShown: false
          }}
        />

        {/* HEADERS */}
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.HEADERS.FIRST_LEVEL.route}
          component={DSHeaderFirstLevel}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.HEADERS.SECOND_LEVEL.route}
          component={DSHeaderSecondLevel}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.HEADERS.SECOND_LEVEL_SECTION_TITLE.route}
          component={DSHeaderSecondLevelWithSectionTitle}
        />

        {/* SCREENS */}
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.OPERATION_RESULT.route}
          component={DSScreenOperationResult}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.OPERATION_RESULT_ANIMATED.route}
          component={DSScreenOperationResultAnimated}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.IOSCROLLVIEW.route}
          component={DSIOScrollView}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.SCREENS.IOSCROLLVIEW.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.IOSCROLLVIEW_WO_ACTIONS.route}
          component={DSIOScrollViewWithoutActions}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.SCREENS.IOSCROLLVIEW_WO_ACTIONS.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.IOSCROLLVIEW_LARGEHEADER.route}
          component={DSIOScrollViewScreenWithLargeHeader}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.SCREENS.IOSCROLLVIEW_LARGEHEADER.title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.IOSCROLLVIEW_CENTRED_CONTENT.route}
          component={DSIOScrollViewCentredContent}
          options={{ headerShown: true }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.IOSCROLLVIEW_WITH_LIST_ITEMS.route}
          component={DSIOScrollViewWithListItems}
          options={{ headerShown: true }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.IOLISTVIEW_LARGE_HEADER.route}
          component={DSIOListViewWithLargeHeader}
          options={{ headerShown: true }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.FORSCESCROLLDOWNVIEW_ACTIONS.route}
          component={DSForceScrollDownView}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.SCREENS.FORSCESCROLLDOWNVIEW_ACTIONS.title
          }}
        />

        <Stack.Screen
          name={
            DESIGN_SYSTEM_ROUTES.SCREENS.FORSCESCROLLDOWNVIEW_CUSTOM_SLOT.route
          }
          component={DSForceScrollDownViewCustomSlot}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.SCREENS.FORSCESCROLLDOWNVIEW_CUSTOM_SLOT
                .title
          }}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.BONUS_CARD_SCREEN.route}
          component={DSBonusCardScreen}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.SCREENS.LOADING_SCREEN.route}
          component={DSLoadingScreen}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.SCREENS.LOADING_SCREEN.title
          }}
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

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.FOOTER_ACTIONS_INLINE.route}
          component={DSFooterActionsInline}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.DEBUG.FOOTER_ACTIONS_INLINE.title
          }}
        />

        <Stack.Screen
          name={
            DESIGN_SYSTEM_ROUTES.DEBUG.FOOTER_ACTIONS_INLINE_NOT_FIXED.route
          }
          component={DSFooterActionsInlineNotFixed}
          options={{
            headerTitle:
              DESIGN_SYSTEM_ROUTES.DEBUG.FOOTER_ACTIONS_INLINE_NOT_FIXED.title
          }}
        />

        <Stack.Group
          screenOptions={{
            presentation: "formSheet",
            ...(Platform.OS === "ios"
              ? {
                  gestureEnabled: isGestureEnabled
                }
              : null)
          }}
        >
          <Stack.Screen
            name={DESIGN_SYSTEM_ROUTES.DEBUG.FULL_SCREEN_MODAL.route}
            component={DSFullScreenModal}
            options={customModalHeaderConf}
          />
        </Stack.Group>

        {/* LEGACY */}

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.BUTTONS.route}
          component={DSLegacyButtons}
          options={{
            headerTitle: DESIGN_SYSTEM_ROUTES.LEGACY.BUTTONS.title
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
