import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import { Showroom } from "../Showroom";
import { ColorsShowroom } from "../core/ColorsShowroom";
import { TypographyShowroom } from "../core/TypographyShowRoom";
import { IconsShowroom } from "../core/IconsShowroom";
import { ButtonsShowroom } from "../core/ButtonsShowroom";
import { TextFieldsShowroom } from "../core/TextFieldsShowroom";
import { LegacyPictogramsShowroom } from "../core/LegacyPictogramsShowroom";
import { LegacyIllustrationsShowroom } from "../core/LegacyIllustrationsShowroom";
import { PictogramsShowroom } from "../core/PictogramsShowroom";
import { LogosShowroom } from "../core/LogosShowroom";
import { ToastNotificationsShowroom } from "../core/ToastNotificationsShowroom";
import { SelectionShowroom } from "../core/SelectionShowroom";
import { AdviceShowroom } from "../core/AdviceShowroom";
import { AccordionShowroom } from "../core/AccordionShowroom";
import { ListItemsShowroom } from "../core/ListItemsShowroom";
import { ShowroomParamsList } from "./params";
import SHOWROOM_ROUTES from "./routes";

const Stack = createStackNavigator<ShowroomParamsList>();

export const ShowroomNavigator = () => (
  <Stack.Navigator
    initialRouteName={SHOWROOM_ROUTES.MAIN}
    headerMode="none"
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen name={SHOWROOM_ROUTES.MAIN} component={Showroom} />
    <Stack.Screen
      name={SHOWROOM_ROUTES.FOUNDATION.COLOR.route}
      component={ColorsShowroom}
    />
    <Stack.Screen
      name={SHOWROOM_ROUTES.FOUNDATION.TYPOGRAPHY.route}
      component={TypographyShowroom}
    />
    <Stack.Screen
      name={SHOWROOM_ROUTES.FOUNDATION.ICONS.route}
      component={IconsShowroom}
    />
    <Stack.Screen
      name={SHOWROOM_ROUTES.FOUNDATION.PICTOGRAMS.route}
      component={PictogramsShowroom}
    />
    <Stack.Screen
      name={SHOWROOM_ROUTES.FOUNDATION.LOGOS.route}
      component={LogosShowroom}
    />

    {/* COMPONENTS */}
    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.BUTTONS.route}
      component={ButtonsShowroom}
    />

    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.SELECTION.route}
      component={SelectionShowroom}
    />

    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.TEXT_FIELDS.route}
      component={TextFieldsShowroom}
    />

    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.LIST_ITEMS.route}
      component={ListItemsShowroom}
    />

    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.TOASTS.route}
      component={ToastNotificationsShowroom}
    />

    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.ACCORDION.route}
      component={AccordionShowroom}
    />

    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.ADVICE.route}
      component={AdviceShowroom}
    />

    {/* LEGACY */}
    <Stack.Screen
      name={SHOWROOM_ROUTES.LEGACY.PICTOGRAMS.route}
      component={LegacyPictogramsShowroom}
    />
    <Stack.Screen
      name={SHOWROOM_ROUTES.LEGACY.ILLUSTRATIONS.route}
      component={LegacyIllustrationsShowroom}
    />
  </Stack.Navigator>
);
