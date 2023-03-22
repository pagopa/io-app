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
import { DSLegacyPictograms } from "../core/DSLegacyPictograms";
import { DSLegacyIllustrations } from "../core/DSLegacyIllustrations";
import { DSPictograms } from "../core/DSPictograms";
import { DSLogos } from "../core/DSLogos";
import { DSToastNotifications } from "../core/DSToastNotifications";
import { DSSelection } from "../core/DSSelection";
import { DSAdvice } from "../core/DSAdvice";
import { DSAccordion } from "../core/DSAccordion";
import { DSListItems } from "../core/DSListItems";
import { DSSpacing } from "../core/DSSpacing";
import { DSAlert } from "../core/DSAlert";
import {
  IOThemeContext,
  IOThemes
} from "../../../components/core/variables/IOColors";
import { DesignSystemParamsList } from "./params";
import DESIGN_SYSTEM_ROUTES from "./routes";
import { DSLoaders } from "../core/DSLoaders";

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
          name={DESIGN_SYSTEM_ROUTES.FOUNDATION.SPACING.route}
          component={DSSpacing}
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

        {/* LEGACY */}
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.PICTOGRAMS.route}
          component={DSLegacyPictograms}
        />
        <Stack.Screen
          name={DESIGN_SYSTEM_ROUTES.LEGACY.ILLUSTRATIONS.route}
          component={DSLegacyIllustrations}
        />
      </Stack.Navigator>
    </IOThemeContext.Provider>
  );
};
