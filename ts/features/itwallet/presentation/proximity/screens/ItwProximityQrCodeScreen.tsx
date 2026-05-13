import {
  Alert,
  BodySmall,
  HeaderSecondLevel,
  Icon,
  useIOThemeContext,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect, useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { IOScrollView } from "../../../../../components/ui/IOScrollView.tsx";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { useMaxBrightness } from "../../../../../utils/brightness.ts";
import { ItWalletLogo } from "../../../common/components/ItWalletLogo.tsx";
import { ItwBrandedBox } from "../../../common/components/ItwBrandedBox.tsx";
import { itwIsBannerHiddenSelector } from "../../../common/store/selectors/banners";
import { ITW_ROUTES } from "../../../navigation/routes";
import { trackItwStartReissuingPID } from "../analytics/index";
import { ItwProximityQrCode as ItwProximityQrCodeTracking } from "../analytics/types";
import { ItwProximityQrCode } from "../components/ItwProximityQrCode.tsx";
import { ItwProximityQrCodeInfoBanner } from "../components/ItwProximityQrCodeInfoBanner";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import { selectFailure, selectIsLoading } from "../machine/selectors.ts";
import { ItwProximityParamsList } from "../navigation/ItwProximityParamsList";
import { shouldBlockProximityQrCodeSelector } from "../store/selectors/credentials";

export type ItwProximityQrCodeScreenNavigationParams = {
  source?: ItwProximityQrCodeTracking["source"];
};

type ItwProximityQrCodeScreenProps = IOStackNavigationRouteProps<
  ItwProximityParamsList,
  "ITW_PROXIMITY_QR_CODE"
>;

export const ItwProximityQrCodeScreen = ({
  route
}: ItwProximityQrCodeScreenProps) => {
  const { source } = route.params;

  const navigation = useIONavigation();
  const { theme } = useIOThemeContext();

  const machineRef = ItwProximityMachineContext.useActorRef();
  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);
  const failure = ItwProximityMachineContext.useSelector(selectFailure);

  const shouldBlockProximityPresentation = useIOSelector(
    shouldBlockProximityQrCodeSelector
  );
  const isQrCodeInfoBannerHidden = useIOSelector(
    itwIsBannerHiddenSelector("proximity_qr_code_info")
  );

  const isFailure = !!failure || shouldBlockProximityPresentation;
  const showStatusContent = !!isLoading || isFailure;

  useDebugInfo({
    isLoading,
    failure,
    // isPermissionsRequired,
    // isBluetoothRequired,
    shouldBlockProximityPresentation
  });

  // Auto-start machine on mount.
  useEffect(() => {
    machineRef.send({
      type: "start"
    });
  }, [machineRef]);

  useMaxBrightness({ useSmoothTransition: true });

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title={""}
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: () => machineRef.send({ type: "close" })
          }}
        />
      )
    });
  }, [navigation, machineRef]);

  const handleReissuePress = () => {
    trackItwStartReissuingPID({
      position: "ITW_QR_CODE"
    });
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: {
        eidReissuing: true,
        level: "l3"
      }
    });
  };

  return (
    <IOScrollView>
      <ItwBrandedBox
        variant={isFailure ? "error" : "default"}
        backgroundVariant={"gradient"}
      >
        <VStack space={16}>
          <View style={styles.logoContainer}>
            <ItWalletLogo width={134} height={28} />
            {shouldBlockProximityPresentation && (
              <Icon name="errorFilled" size={20} color={theme.errorIcon} />
            )}
          </View>

          {!showStatusContent && (
            <BodySmall style={styles.centeredText}>
              {I18n.t("features.itWallet.presentation.qrCode.instruction")}
            </BodySmall>
          )}

          <ItwProximityQrCode source={source} />
        </VStack>
      </ItwBrandedBox>
      {!isQrCodeInfoBannerHidden && (
        <Animated.View layout={LinearTransition.duration(200)}>
          <VSpacer size={24} />
          <ItwProximityQrCodeInfoBanner />
        </Animated.View>
      )}
      {shouldBlockProximityPresentation && (
        <Animated.View layout={LinearTransition.duration(200)}>
          <VSpacer size={24} />
          <Alert
            testID="itwExpiredBannerTestID"
            variant="error"
            content={I18n.t(
              "features.itWallet.presentation.qrCode.banner.invalid"
            )}
            action={I18n.t("features.itWallet.presentation.qrCode.reissue.cta")}
            onPress={handleReissuePress}
          />
        </Animated.View>
      )}
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  centeredText: {
    textAlign: "center"
  }
});
