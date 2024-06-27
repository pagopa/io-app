/**
 * This screen is needed to wrap the CieCardReaderScreen to leave
 * this screen as a class component.
 *
 * TODO: remove this screen and refactor the CieCardReaderScreen to a functional component.
 * https://pagopa.atlassian.net/browse/IOPID-1857
 */
import React from "react";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useInteractiveElementDefaultColorName } from "../../../../../utils/hooks/theme";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import ItwCieCardReaderScreen from "./ItwCieCardReaderScreen";

export const ItwCieCardReaderScreenWrapper = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<
        ItwParamsList,
        "ITW_ISSUANCE_EID_CIE_CARD_READER_SCREEN"
      >
    >();
  const route =
    useRoute<
      RouteProp<ItwParamsList, "ITW_ISSUANCE_EID_CIE_CARD_READER_SCREEN">
    >();

  const blueColorName = useInteractiveElementDefaultColorName();

  return (
    <ItwCieCardReaderScreen
      blueColorName={blueColorName}
      navigation={navigation}
      route={route}
      headerHeight={0}
    />
  );
};
