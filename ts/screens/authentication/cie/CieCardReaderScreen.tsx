import React from "react";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../navigation/params/AuthenticationParamsList";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { withTrailingPoliceCarLightEmojii } from "../../../utils/strings";
import { useIOSelector } from "../../../store/hooks";
import { isCieLoginUatEnabledSelector } from "../../../features/cieLogin/store/selectors";
import CieCardReaderComponent from "./CieCardReaderComponent";

export const CieCardReaderScreen = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<AuthenticationParamsList, "CIE_CARD_READER_SCREEN">
    >();
  const route =
    useRoute<RouteProp<AuthenticationParamsList, "CIE_CARD_READER_SCREEN">>();

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
