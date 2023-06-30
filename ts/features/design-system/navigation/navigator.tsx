import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { useColorScheme } from "react-native";
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
import { DSHeaderFirstLevel } from "../core/DSHeaderFirstLevel";
import { DesignSystemParamsList } from "./params";
import DESIGN_SYSTEM_ROUTES from "./routes";

const Stack = createStackNavigator<DesignSystemParamsList>();

export const DesignSystemNavigator = () => {
  const colorScheme = useColorScheme();

  return (
    <IOThemeContext.Provider
      value={colorScheme === "dark" ? IOThemes.dark : IOThemes.light}
    >
      <Stack.Navigator
        initialRouteName={DESIGN_SYSTEM_ROUTES.MAIN}
        headerMode="none"
        screenOptions={{ gestureEnabled: isGestureEnabled }}
      >
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.MAIN}
          component={DesignSystem}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.FOUNDATION.COLOR.route}
          component={DSColors}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.FOUNDATION.TYPOGRAPHY.route}
          component={DSTypography}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LAYOUT.route}
          component={DSLayout}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.FOUNDATION.ICONS.route}
          component={DSIcons}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.FOUNDATION.PICTOGRAMS.route}
          component={DSPictograms}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LOGOS.route}
          component={DSLogos}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.FOUNDATION.LOADERS.route}
          component={DSLoaders}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.FOUNDATION.HAPTIC_FEEDBACK.route}
          component={DSHapticFeedback}
        />

        {/* COMPONENTS */}
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BUTTONS.route}
          component={DSButtons}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.SELECTION.route}
          component={DSSelection}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.TEXT_FIELDS.route}
          component={DSTextFields}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BADGE.route}
          component={DSBadges}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.LIST_ITEMS.route}
          component={DSListItems}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.TOASTS.route}
          component={DSToastNotifications}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ACCORDION.route}
          component={DSAccordion}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ALERT.route}
          component={DSAlert}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.ADVICE.route}
          component={DSAdvice}
        />

        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.COMPONENTS.BOTTOM_SHEET.route}
          component={DSBottomSheet}
        />

        {/* DEBUG */}
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.HEADERS.FIRST_LEVEL.route}
          component={DSHeaderFirstLevel}
        />

        {/* DEBUG */}
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.SAFE_AREA.route}
          component={DSSafeArea}
        />
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.SAFE_AREA_CENTERED.route}
          component={DSSafeAreaCentered}
        />
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.DEBUG.EDGE_TO_EDGE_AREA.route}
          component={DSEdgeToEdgeArea}
        />

        {/* LEGACY */}
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.PICTOGRAMS.route}
          component={DSLegacyPictograms}
        />
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.BUTTONS.route}
          component={DSLegacyButtons}
        />
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.ILLUSTRATIONS.route}
          component={DSLegacyIllustrations}
        />
      </Stack.Navigator>
    </IOThemeContext.Provider>
  );
};
