import {
  buttonSolidHeight,
  GradientBottomActions,
  IOColors,
  IOSpacingScale,
  IOToast,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { useState, useMemo, useCallback, useEffect } from "react";
import { LayoutChangeEvent, Platform, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DiscountCodeTypeEnum } from "../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { isLoading, isReady } from "../../../../../common/model/RemoteValue";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useScreenEndMargin } from "../../../../../hooks/useScreenEndMargin";
import I18n from "../../../../../i18n";
import { mixpanelTrack } from "../../../../../mixpanel";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { profileSelector } from "../../../../../store/reducers/profile";
import { openWebUrl } from "../../../../../utils/url";
import { CgnDiscountContent } from "../../components/merchants/discount/CgnDiscountContent";
import { CgnDiscountHeader } from "../../components/merchants/discount/CgnDiscountHeader";
import { CgnDetailsParamsList } from "../../navigation/params";
import CGN_ROUTES from "../../navigation/routes";
import { cgnCodeFromBucket } from "../../store/actions/bucket";
import {
  resetMerchantDiscountCode,
  setMerchantDiscountCode
} from "../../store/actions/merchants";
import { cgnGenerateOtp, resetOtpState } from "../../store/actions/otp";
import { cgnBucketSelector } from "../../store/reducers/bucket";
import {
  cgnSelectedDiscountCodeSelector,
  cgnSelectedDiscountSelector,
  cgnSelectedMerchantSelector
} from "../../store/reducers/merchants";
import { cgnOtpDataSelector } from "../../store/reducers/otp";
import { getCgnUserAgeRange } from "../../utils/dates";

const gradientSafeAreaHeight: IOSpacingScale = 96;

const CgnDiscountDetailScreen = () => {
  const dispatch = useIODispatch();
  const navigation =
    useNavigation<
      IOStackNavigationProp<CgnDetailsParamsList, "CGN_MERCHANTS_DISCOUNT_CODE">
    >();
  const discountDetailsRemoteValue = useIOSelector(cgnSelectedDiscountSelector);
  const merchantDetailsRemoteValue = useIOSelector(cgnSelectedMerchantSelector);
  const discountDetails = isReady(discountDetailsRemoteValue)
    ? discountDetailsRemoteValue.value
    : undefined;
  const merchantDetails = isReady(merchantDetailsRemoteValue)
    ? merchantDetailsRemoteValue.value
    : undefined;

  const [titleHeight, setTitleHeight] = useState(0);
  const translationY = useSharedValue(0);
  const gradientOpacity = useSharedValue(1);
  const insets = useSafeAreaInsets();
  const endMargins = useScreenEndMargin();

  const bucketResponse = useIOSelector(cgnBucketSelector);
  const discountOtp = useIOSelector(cgnOtpDataSelector);
  const discountCode = useIOSelector(cgnSelectedDiscountCodeSelector);
  const profile = pot.toUndefined(useIOSelector(profileSelector));
  const cgnUserAgeRange = useMemo(
    () => getCgnUserAgeRange(profile?.date_of_birth),
    [profile]
  );

  const loading = isLoading(bucketResponse) || isLoading(discountOtp);

  const mixpanelCgnEvent = useCallback(
    (eventName: string) =>
      void mixpanelTrack(eventName, {
        userAge: cgnUserAgeRange,
        categories: discountDetails?.productCategories,
        operator_name: merchantDetails?.name
      }),
    [cgnUserAgeRange, discountDetails, merchantDetails]
  );

  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (titleHeight === 0) {
      setTitleHeight(height - insets.top - IOVisualCostants.headerHeight);
    }
  };

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  const footerGradientOpacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(gradientOpacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  const gradientAreaHeight: number = useMemo(
    () =>
      endMargins.screenEndSafeArea + buttonSolidHeight + gradientSafeAreaHeight,
    [endMargins]
  );

  const onNavigateToDiscountUrl = () => {
    mixpanelCgnEvent("CGN_DISCOUNT_URL_REQUEST");
    openWebUrl(discountDetails?.discountUrl, () =>
      IOToast.error(I18n.t("bonus.cgn.generic.linkError"))
    );
  };

  const navigateToDiscountCode = () => {
    navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT_CODE);
  };

  const showErrorToast = () => {
    IOToast.error(I18n.t("global.genericError"));
  };

  const onPressDiscountCode = () => {
    if (!discountDetails) {
      return;
    }
    if (discountCode) {
      navigateToDiscountCode();
      return;
    }
    switch (merchantDetails?.discountCodeType) {
      case DiscountCodeTypeEnum.landingpage: {
        const landingPageUrl = discountDetails?.landingPageUrl;
        const referer = discountDetails?.landingPageReferrer;
        if (!landingPageUrl) {
          return;
        }
        mixpanelCgnEvent("CGN_LANDING_PAGE_REQUEST");
        navigation.navigate(CGN_ROUTES.DETAILS.MAIN, {
          screen: CGN_ROUTES.DETAILS.MERCHANTS.LANDING_WEBVIEW,
          params: {
            landingPageUrl,
            landingPageReferrer: referer as string
          }
        });
        break;
      }
      case DiscountCodeTypeEnum.api:
        mixpanelCgnEvent("CGN_OTP_START_REQUEST");
        dispatch(
          cgnGenerateOtp.request({
            onSuccess: navigateToDiscountCode,
            onError: () =>
              navigation.navigate(CGN_ROUTES.DETAILS.MAIN, {
                screen: CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT_CODE_FAILURE
              })
          })
        );
        break;
      case DiscountCodeTypeEnum.bucket:
        mixpanelCgnEvent("CGN_BUCKET_CODE_START_REQUEST");
        dispatch(
          cgnCodeFromBucket.request({
            discountId: discountDetails.id,
            onSuccess: navigateToDiscountCode,
            onError: showErrorToast
          })
        );
        break;
      case DiscountCodeTypeEnum.static:
        if (!discountDetails?.staticCode) {
          return;
        }
        mixpanelCgnEvent("CGN_STATIC_CODE_REQUEST");
        dispatch(setMerchantDiscountCode(discountDetails.staticCode));
        navigateToDiscountCode();
        break;
      default:
        break;
    }
  };

  const { backgroundColor } = discountDetails?.isNew
    ? styles.backgroundNewItem
    : styles.backgroundDefault;

  useHeaderSecondLevel({
    title: discountDetails?.name || "",
    scrollValues: {
      contentOffsetY: translationY,
      triggerOffset: titleHeight
    },
    backgroundColor,
    canGoBack: true,
    supportRequest: true
  });

  useEffect(() => {
    dispatch(resetMerchantDiscountCode());
    dispatch(resetOtpState());
  }, [dispatch]);

  const FooterButtonActions = () => {
    const primaryAction: GradientBottomActions["primaryActionProps"] =
      merchantDetails?.discountCodeType
        ? {
            label: I18n.t(
              `bonus.cgn.merchantDetail.discount.cta.${merchantDetails.discountCodeType}`
            ),
            onPress: onPressDiscountCode,
            disabled: loading,
            loading,
            testID: "discount-code-button"
          }
        : undefined;
    const secondaryAction: GradientBottomActions["secondaryActionProps"] =
      discountDetails?.discountUrl &&
      merchantDetails?.discountCodeType !== DiscountCodeTypeEnum.landingpage
        ? {
            label: I18n.t(`bonus.cgn.merchantDetail.discount.secondaryCta`),
            onPress: onNavigateToDiscountUrl,
            testID: "discount-url-button"
          }
        : undefined;

    if (!primaryAction && !secondaryAction) {
      return null;
    }
    return (
      <GradientBottomActions
        primaryActionProps={primaryAction}
        secondaryActionProps={secondaryAction}
        transitionAnimStyle={footerGradientOpacityTransition}
        dimensions={{
          bottomMargin: endMargins.screenEndSafeArea,
          extraBottomMargin: 0,
          gradientAreaHeight,
          spaceBetweenActions: 24,
          safeBackgroundHeight: endMargins.screenEndMargin
        }}
      />
    );
  };

  if (discountDetails && merchantDetails) {
    return (
      <>
        <Animated.ScrollView
          style={{ flexGrow: 1 }}
          onScroll={scrollHandler}
          scrollEventThrottle={8}
          snapToOffsets={[0, titleHeight]}
          snapToEnd={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: gradientAreaHeight
          }}
        >
          {Platform.OS === "ios" && (
            <View
              style={{
                position: "absolute",
                height: 1000,
                backgroundColor,
                top: -1000,
                right: 0,
                left: 0
              }}
            />
          )}
          <CgnDiscountHeader
            onLayout={getTitleHeight}
            discountDetails={discountDetails}
          />
          <CgnDiscountContent discountDetails={discountDetails} />
        </Animated.ScrollView>
        <FooterButtonActions />
      </>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  backgroundDefault: {
    backgroundColor: IOColors["grey-50"],
    borderColor: IOColors["grey-100"]
  },
  backgroundNewItem: {
    backgroundColor: IOColors["hanPurple-50"],
    borderColor: IOColors["hanPurple-250"]
  }
});

export default CgnDiscountDetailScreen;
