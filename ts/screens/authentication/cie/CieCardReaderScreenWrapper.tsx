import React from "react";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../navigation/params/AuthenticationParamsList";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { withTrailingPoliceCarLightEmojii } from "../../../utils/strings";
import { useIOSelector } from "../../../store/hooks";
import { isCieLoginUatEnabledSelector } from "../../../features/cieLogin/store/selectors";
import CieCardReaderScreen from "./CieCardReaderScreen";

export const CieCardReaderScreenWrapper = () => {
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

  return (
    <CieCardReaderScreen
      navigation={navigation}
      route={route}
      headerHeight={headerHeight}
    />
  );
};
