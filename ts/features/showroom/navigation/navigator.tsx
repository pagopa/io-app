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
      name={SHOWROOM_ROUTES.FOUNDATION.COLOR.id}
      component={ColorsShowroom}
      initialParams={{ title: "Colors" }}
    />
    <Stack.Screen
      name={SHOWROOM_ROUTES.FOUNDATION.TYPOGRAPHY.id}
      component={TypographyShowroom}
    />
    <Stack.Screen
      name={SHOWROOM_ROUTES.FOUNDATION.ICONS.id}
      component={IconsShowroom}
    />
    <Stack.Screen
      name={SHOWROOM_ROUTES.FOUNDATION.PICTOGRAMS.id}
      component={PictogramsShowroom}
    />
    <Stack.Screen
      name={SHOWROOM_ROUTES.FOUNDATION.LOGOS.id}
      component={LogosShowroom}
    />

    {/* COMPONENTS */}
    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.BUTTONS.id}
      component={ButtonsShowroom}
    />

    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.SELECTION.id}
      component={SelectionShowroom}
    />

    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.TEXT_FIELDS.id}
      component={TextFieldsShowroom}
    />

    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.TOASTS.id}
      component={ToastNotificationsShowroom}
    />

    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.ACCORDION.id}
      component={AccordionShowroom}
    />

    <Stack.Screen
      name={SHOWROOM_ROUTES.COMPONENTS.ADVICE.id}
      component={AdviceShowroom}
    />

    {/* LEGACY */}
    <Stack.Screen
      name={SHOWROOM_ROUTES.LEGACY.PICTOGRAMS.id}
      component={LegacyPictogramsShowroom}
    />
    <Stack.Screen
      name={SHOWROOM_ROUTES.LEGACY.ILLUSTRATIONS.id}
      component={LegacyIllustrationsShowroom}
    />
  </Stack.Navigator>
);
