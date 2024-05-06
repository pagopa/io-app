import {
  ContentWrapper,
  ListItemHeader,
  ModuleNavigation,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { Alert } from "react-native";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isCieSupportedSelector } from "../../../../store/reducers/cie";
import { cieFlowForDevServerEnabled } from "../../../cieLogin/utils";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwNfcIsEnabled } from "../store/actions";
import { itwIsNfcEnabledSelector } from "../store/selectors";

export const ItwAuthModeSelectionScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const isCieSupportedPot = useIOSelector(isCieSupportedSelector);
  const isNfcEnabledPot = useIOSelector(itwIsNfcEnabledSelector);
  const isLoading =
    pot.isLoading(isCieSupportedPot) || pot.isLoading(isNfcEnabledPot);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(itwNfcIsEnabled.request());
    }, [dispatch])
  );

  const isCieSupported = React.useMemo(
    () => cieFlowForDevServerEnabled || pot.getOrElse(isCieSupportedPot, false),
    [isCieSupportedPot]
  );

  const isNfcEnabled = React.useMemo(
    () => pot.getOrElse(isNfcEnabledPot, false),
    [isNfcEnabledPot]
  );

  const handleSpidPress = () => {
    Alert.alert("Not implemented");
  };

  const handleCiePinPress = () => {
    if (isNfcEnabled) {
      Alert.alert("Not implemented");
    } else {
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.AUTH.NFC_INSTRUCTIONS
      });
    }
  };

  const handleCieIdPress = () => {
    Alert.alert("Not implemented");
  };

  const methodList = React.useMemo(
    () => (
      <>
        <ModuleNavigation
          title={I18n.t(
            "features.itWallet.authentication.mode.method.spid.title"
          )}
          subtitle={I18n.t(
            "features.itWallet.authentication.mode.method.spid.subtitle"
          )}
          icon="spid"
          onPress={handleSpidPress}
        />
        <VSpacer size={8} />
        {isCieSupported && (
          <>
            <ModuleNavigation
              title={I18n.t(
                "features.itWallet.authentication.mode.method.ciePin.title"
              )}
              subtitle={I18n.t(
                "features.itWallet.authentication.mode.method.ciePin.subtitle"
              )}
              icon="fiscalCodeIndividual"
              onPress={handleCiePinPress}
            />
            <VSpacer size={8} />
          </>
        )}
        <ModuleNavigation
          title={I18n.t(
            "features.itWallet.authentication.mode.method.cieId.title"
          )}
          subtitle={I18n.t(
            "features.itWallet.authentication.mode.method.cieId.subtitle"
          )}
          icon="device"
          onPress={handleCieIdPress}
        />
      </>
    ),
    [isCieSupported]
  );

  return (
    <RNavScreenWithLargeHeader
      title={{ label: I18n.t("features.itWallet.authentication.mode.title") }}
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t("features.itWallet.authentication.mode.header")}
        />
        {isLoading ? <MethodListSkeleton /> : methodList}
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};

const MethodListSkeleton = () => (
  <>
    {Array.from({ length: 3 }).map((_, index) => (
      <React.Fragment key={`method_item_skeleton_${index}`}>
        {index !== 0 && <VSpacer size={8} />}
        <ModuleNavigation isLoading={true} />
      </React.Fragment>
    ))}
  </>
);
