import {
  IOColors,
  IOToast,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, Platform, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedRef,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DiscountCodeTypeEnum } from "../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { isLoading, isReady } from "../../../../../common/model/RemoteValue";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../../i18n";
import { mixpanelTrack } from "../../../../../mixpanel";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { profileSelector } from "../../../../../store/reducers/profile";
import { buildEventProperties } from "../../../../../utils/analytics";
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
  const insets = useSafeAreaInsets();

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
      mixpanelTrack(
        eventName,
        buildEventProperties("UX", "action", {
          userAge: cgnUserAgeRange,
          categories: discountDetails?.productCategories,
          operator_name: merchantDetails?.name,
          merchant_business_name: merchantDetails?.fullName
        })
      ),
    [cgnUserAgeRange, discountDetails, merchantDetails]
  );

  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (titleHeight === 0) {
      setTitleHeight(height - insets.top - IOVisualCostants.headerHeight);
    }
  };

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

  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    title: discountDetails?.name ?? "",
    scrollValues: {
      contentOffsetY: translationY,
      triggerOffset: titleHeight
    },
    backgroundColor,
    canGoBack: true,
    supportRequest: true,
    variant: "neutral",
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef
  });

  useEffect(() => {
    dispatch(resetMerchantDiscountCode());
    dispatch(resetOtpState());
  }, [dispatch]);

  const renderActions = (): IOScrollViewActions | undefined => {
    const primary = merchantDetails?.discountCodeType && {
      label: I18n.t(
        `bonus.cgn.merchantDetail.discount.cta.${merchantDetails.discountCodeType}`
      ),
      onPress: onPressDiscountCode,
      disabled: loading,
      loading,
      testID: "discount-code-button"
    };

    const secondary = discountDetails?.discountUrl &&
      merchantDetails?.discountCodeType !==
        DiscountCodeTypeEnum.landingpage && {
        label: I18n.t(`bonus.cgn.merchantDetail.discount.secondaryCta`),
        onPress: onNavigateToDiscountUrl,
        testID: "discount-url-button"
      };

    if (!primary && !secondary) {
      return undefined;
    }
    if (primary && secondary) {
      return {
        type: "TwoButtons",
        primary,
        secondary
      };
    }
    if (primary) {
      return {
        type: "SingleButton",
        primary
      };
    }
    if (secondary) {
      return {
        type: "SingleButton",
        primary: secondary
      };
    }
    return undefined;
  };

  if (discountDetails && merchantDetails) {
    return (
      <>
        <FocusAwareStatusBar
          backgroundColor={backgroundColor}
          barStyle={"dark-content"}
        />
        <IOScrollView
          animatedRef={animatedScrollViewRef}
          snapOffset={titleHeight}
          includeContentMargins={false}
          actions={renderActions()}
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
        </IOScrollView>
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
