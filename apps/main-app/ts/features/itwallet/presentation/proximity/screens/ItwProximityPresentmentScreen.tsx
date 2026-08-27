import {
  Alert,
  BodySmall,
  H6,
  HeaderSecondLevel,
  hexToRgba,
  IOButton,
  IOColors,
  IOVisualCostants,
  VSpacer,
  VStack
} from "@io-app/design-system";
import I18n from "i18next";
import { useEffect, useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  LinearTransition,
  useAnimatedRef
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IOScrollView } from "../../../../../components/ui/IOScrollView.tsx";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { useMaxBrightness } from "../../../../../utils/brightness.ts";
import { ItwBrandedBox } from "../../../common/components/ItwBrandedBox.tsx";
import { itwIsBannerVisibleSelector } from "../../../common/store/selectors/banners.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import {
  trackItwProximityNfcStart,
  trackItwStartReissuingPID
} from "../analytics";
import { ItwProximityQrCode as ItwProximityQrCodeTracking } from "../analytics/types.ts";
import { ItwProximityQrCodeImage } from "../components/ItwProximityQrCodeImage.tsx";
import { ItwProximityQrCodeInfoBanner } from "../components/ItwProximityQrCodeInfoBanner.tsx";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import { selectFailure, selectIsLoading } from "../machine/selectors.ts";
import { ItwProximityParamsList } from "../navigation/ItwProximityParamsList.ts";
import { shouldShowExpiredProximityCredentialsBannerSelector } from "../store/selectors/credentials.ts";

export type ItwProximityPresentmentScreenNavigationParams = {
  source?: ItwProximityQrCodeTracking["source"];
};

type ItwProximityPresentmentScreenProps = IOStackNavigationRouteProps<
  ItwProximityParamsList,
  "ITW_PROXIMITY_PRESENTMENT"
>;

export const ItwProximityPresentmentScreen = ({
  route
}: ItwProximityPresentmentScreenProps) => {
  const { source } = route.params;

  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  const navigation = useIONavigation();
  const safeAreaInsets = useSafeAreaInsets();

  const machineRef = ItwProximityMachineContext.useActorRef();
  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);
  const failure = ItwProximityMachineContext.useSelector(selectFailure);

  const shouldShowExpiredCredentialsBanner = useIOSelector(
    shouldShowExpiredProximityCredentialsBannerSelector
  );
  const isQrCodeInfoBannerVisible = useIOSelector(
    itwIsBannerVisibleSelector("proximity_qr_code_info")
  );

  const isFailure = !!failure;

  useDebugInfo({
    isLoading,
    failure,
    // isPermissionsRequired,
    // isBluetoothRequired,
    shouldShowExpiredCredentialsBanner
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
          animatedRef={animatedScrollViewRef}
          enableDiscreteTransition={true}
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: () => machineRef.send({ type: "close" })
          }}
          title={""}
          transparent={true}
          type="singleAction"
        />
      ),
      headerTransparent: true
    });
  }, [navigation, machineRef, animatedScrollViewRef]);

  const handleContactlessPress = () => {
    trackItwProximityNfcStart();
    machineRef.send({ type: "start-nfc-presentment" });
  };

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
    <IOScrollView
      animatedRef={animatedScrollViewRef}
      contentContainerStyle={{
        marginTop: safeAreaInsets.top + IOVisualCostants.headerHeight
      }}
    >
      {shouldShowExpiredCredentialsBanner && (
        <Animated.View
          layout={LinearTransition.duration(200)}
          style={styles.expiredBanner}
        >
          <Alert
            action={I18n.t(
              "features.itWallet.presentation.proximity.engagement.invalidBanner.action"
            )}
            content={I18n.t(
              "features.itWallet.presentation.proximity.engagement.invalidBanner.content"
            )}
            onPress={handleReissuePress}
            testID="itwExpiredBannerTestID"
            variant="error"
          />
        </Animated.View>
      )}

      <ItwBrandedBox
        backgroundVariant={"gradient"}
        style={styles.qrCodeShadow}
        variant={isFailure ? "error" : "default"}
      >
        <VStack space={16}>
          {!isFailure && (
            <VStack space={8} style={{ marginHorizontal: 16 }}>
              <H6 style={{ textAlign: "center" }}>
                {I18n.t(
                  "features.itWallet.presentation.proximity.engagement.title"
                )}
              </H6>
              <BodySmall style={{ textAlign: "center" }}>
                {I18n.t(
                  "features.itWallet.presentation.proximity.engagement.instruction"
                )}
              </BodySmall>
            </VStack>
          )}

          <ItwProximityQrCodeImage source={source} />
        </VStack>
      </ItwBrandedBox>

      <View
        style={{ alignSelf: "center", marginTop: 32, marginBottom: 24, gap: 8 }}
      >
        <BodySmall style={{ textAlign: "center" }}>
          {I18n.t("features.itWallet.presentation.proximity.engagement.nfc.or")}
        </BodySmall>
        <IOButton
          icon="contactless"
          iconPosition="end"
          label={I18n.t(
            "features.itWallet.presentation.proximity.engagement.nfc.action"
          )}
          onPress={handleContactlessPress}
          variant="link"
        />
      </View>

      {isQrCodeInfoBannerVisible && (
        <Animated.View layout={LinearTransition.duration(200)}>
          <VSpacer size={24} />
          <ItwProximityQrCodeInfoBanner />
        </Animated.View>
      )}
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  expiredBanner: {
    marginBottom: 24
  },
  qrCodeShadow: {
    boxShadow: `0px 4px 32px ${hexToRgba(IOColors.black, 0.1)}`
  }
});
