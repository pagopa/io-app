import {
  Alert,
  BodySmall,
  H6,
  HeaderSecondLevel,
  IOButton,
  IOColors,
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
import { ItwBrandedBox } from "../../../common/components/ItwBrandedBox.tsx";
import { itwIsBannerHiddenSelector } from "../../../common/store/selectors/banners.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { trackItwStartReissuingPID } from "../analytics/index";
import { ItwProximityQrCode as ItwProximityQrCodeTracking } from "../analytics/types.ts";
import { ItwProximityQrCodeImage } from "../components/ItwProximityQrCodeImage.tsx";
import { ItwProximityQrCodeInfoBanner } from "../components/ItwProximityQrCodeInfoBanner.tsx";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import { selectFailure, selectIsLoading } from "../machine/selectors.ts";
import { ItwProximityParamsList } from "../navigation/ItwProximityParamsList.ts";
import { shouldBlockProximityQrCodeSelector } from "../store/selectors/credentials.ts";

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

  const navigation = useIONavigation();

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

  const handleContactlessPress = () => {
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
    <IOScrollView>
      <View style={styles.boxShadow}>
        <ItwBrandedBox
          variant={isFailure ? "error" : "default"}
          backgroundVariant={"gradient"}
        >
          <VStack space={16}>
            {!showStatusContent && (
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
      </View>

      <View
        style={{ alignSelf: "center", marginTop: 32, marginBottom: 24, gap: 8 }}
      >
        <BodySmall style={{ textAlign: "center" }}>
          {I18n.t("features.itWallet.presentation.proximity.engagement.nfc.or")}
        </BodySmall>
        <IOButton
          variant="link"
          label={I18n.t(
            "features.itWallet.presentation.proximity.engagement.nfc.action"
          )}
          onPress={handleContactlessPress}
          icon="contactless"
          iconPosition="end"
        />
      </View>

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
              "features.itWallet.presentation.proximity.engagement.invalidBanner.content"
            )}
            action={I18n.t(
              "features.itWallet.presentation.proximity.engagement.invalidBanner.action"
            )}
            onPress={handleReissuePress}
          />
        </Animated.View>
      )}
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  boxShadow: {
    shadowRadius: 8,
    shadowColor: IOColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    elevation: 8
  }
});
