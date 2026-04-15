import { IOToast } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo } from "react";
import { Platform, View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import I18n from "i18next";
import { DiscountCodeTypeEnum } from "../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { isLoading, isReady } from "../../../../../common/model/RemoteValue";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { mixpanelTrack } from "../../../../../mixpanel";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { profileSelector } from "../../../../settings/common/store/selectors";
import { openWebUrl } from "../../../../../utils/url";
import { CgnDiscountContent } from "../../components/merchants/discount/CgnDiscountContent";
import { CgnDiscountHeader } from "../../components/merchants/discount/CgnDiscountHeader";
import { useCgnStyle } from "../../hooks/useCgnStyle";
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
import { buildEventProperties } from "../../../../../utils/analytics";

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

  const {
    header: { default: defaultHeaderStyle, new: newHeaderStyle }
  } = useCgnStyle();

  const { backgroundColor } = discountDetails?.isNew
    ? newHeaderStyle
    : defaultHeaderStyle;

  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    title: discountDetails?.name ?? "",
    backgroundColor,
    canGoBack: true,
    supportRequest: true,
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
        <FocusAwareStatusBar backgroundColor={backgroundColor} />
        <IOScrollView
          animatedRef={animatedScrollViewRef}
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
          <CgnDiscountHeader discountDetails={discountDetails} />
          <CgnDiscountContent discountDetails={discountDetails} />
        </IOScrollView>
      </>
    );
  }

  return null;
};

export default CgnDiscountDetailScreen;
