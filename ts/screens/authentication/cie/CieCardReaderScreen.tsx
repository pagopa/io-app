import React from "react";

import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { AuthenticationParamsList } from "../../../navigation/params/AuthenticationParamsList";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { withTrailingPoliceCarLightEmojii } from "../../../utils/strings";
import { useIOSelector } from "../../../store/hooks";
import { isCieLoginUatEnabledSelector } from "../../../features/cieLogin/store/selectors";
import CieCardReaderComponent, {
  CieCardReaderNavigationProps
} from "./CieCardReaderComponent";

export const CieCardReaderScreen = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<AuthenticationParamsList, "CIE_CARD_READER_SCREEN">
    >();
  const route =
    useRoute<
      Route<typeof ROUTES.CIE_CARD_READER_SCREEN, CieCardReaderNavigationProps>
    >();

  const isCieUatEnabled = useIOSelector(isCieLoginUatEnabledSelector);

  useHeaderSecondLevel({
    title: withTrailingPoliceCarLightEmojii("", isCieUatEnabled)
  });

  const headerHeight = useHeaderHeight();

  // eslint-disable-next-line no-console
  console.log("CieCardReaderScreen 🚀");

  return (
    <CieCardReaderComponent
      navigation={navigation}
      route={route}
      headerHeight={headerHeight}
    />
  );
};
