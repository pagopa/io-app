import {
  ContentWrapper,
  GradientBottomActions,
  GradientScrollView,
  H1,
  IOSpacer,
  IOSpacingScale,
  IOToast,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfo,
  VSpacer,
  buttonSolidHeight
} from "@pagopa/io-app-design-system";
import Placeholder from "rn-placeholder";
import { Route, useRoute } from "@react-navigation/native";
import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import Animated, {
  Easing,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Image,
  LayoutChangeEvent,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import { Address } from "../../../../../../definitions/cgn/merchants/Address";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { isReady } from "../../../../../common/model/RemoteValue";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import CgnMerchantDiscountItem from "../../components/merchants/CgnMerchantsDiscountItem";
import { cgnSelectedMerchant } from "../../store/actions/merchants";
import { cgnSelectedMerchantSelector } from "../../store/reducers/merchants";
import { CgnAddressListItem } from "../../components/merchants/CgnAddressListItem";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { openWebUrl } from "../../../../../utils/url";

export type CgnMerchantDetailScreenNavigationParams = Readonly<{
  merchantID: Merchant["id"];
}>;

const scrollTriggerOffsetValue: number = 88;

const gradientSafeArea: IOSpacingScale = 80;
const contentEndMargin: IOSpacingScale = 32;
const spaceBetweenActions: IOSpacer = 24;

const CgnMerchantDetailScreen = () => {
  // -------    hooks
  const safeAreaInsets = useSafeAreaInsets();

  const gradientOpacity = useSharedValue(1);
  const scrollTranslationY = useSharedValue(0);

  const [titleHeight, setTitleHeight] = React.useState(0);

  const dispatch = useIODispatch();
  const route =
    useRoute<
      Route<"CGN_MERCHANTS_DETAIL", CgnMerchantDetailScreenNavigationParams>
    >();
  const merchantID = useMemo(() => route.params.merchantID, [route]);
  const merchantDetail = useIOSelector(cgnSelectedMerchantSelector);

  const loadMerchantDetail = useCallback(() => {
    dispatch(cgnSelectedMerchant.request(merchantID));
  }, [merchantID, dispatch]);

  const bottomMargin: number = React.useMemo(
    () =>
      safeAreaInsets.bottom === 0
        ? IOVisualCostants.appMarginDefault
        : safeAreaInsets.bottom,
    [safeAreaInsets]
  );

  const safeBottomAreaHeight: number = React.useMemo(
    () => bottomMargin + buttonSolidHeight + contentEndMargin,
    [bottomMargin]
  );

  const gradientAreaHeight: number = React.useMemo(
    () => bottomMargin + buttonSolidHeight + gradientSafeArea,
    [bottomMargin]
  );

  useEffect(loadMerchantDetail, [loadMerchantDetail]);
  // -------    utils/logic

  const DiscountListItem = ({ item }: { item: Discount }) =>
    isReady(merchantDetail) ? (
      <CgnMerchantDiscountItem
        discount={item}
        operatorName={merchantDetail.value.name}
        merchantType={merchantDetail.value.discountCodeType}
      />
    ) : null;
  const renderDiscountsList = (discounts: ReadonlyArray<Discount>) =>
    discounts.map((discount, index) => (
      <DiscountListItem item={discount} key={index} />
    ));

  const handlePressMerchantWebsite = (websiteUrl?: string) => {
    if (websiteUrl !== undefined) {
      openWebUrl(websiteUrl, () =>
        IOToast.error(I18n.t("bonus.cgn.generic.linkError"))
      );
    }
  };

  const scrollHandler = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      // eslint-disable-next-line functional/immutable-data
      scrollTranslationY.value = contentOffset.y;

      const isEndReached =
        Math.floor(layoutMeasurement.height + contentOffset.y) >=
        Math.floor(contentSize.height);

      // eslint-disable-next-line functional/immutable-data
      gradientOpacity.value = isEndReached ? 0 : 1;
    }
  );
  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (titleHeight === 0) {
      setTitleHeight(
        height - safeAreaInsets.top - IOVisualCostants.headerHeight
      );
    }
  };
  // -------    render

  useHeaderSecondLevel({
    title: isReady(merchantDetail) ? merchantDetail.value.name : "",
    canGoBack: true,
    supportRequest: true,
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    }
  });

  const footerCta = (url: string) => ({
    label: I18n.t("bonus.cgn.merchantDetail.cta.website"),
    onPress: () => handlePressMerchantWebsite(url)
  });

  const footerGradientOpacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(gradientOpacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  const footerComponent = isReady(merchantDetail) &&
    merchantDetail.value.websiteUrl && (
      <GradientBottomActions
        primaryActionProps={footerCta(merchantDetail.value.websiteUrl)}
        transitionAnimStyle={footerGradientOpacityTransition}
        dimensions={{
          bottomMargin,
          extraBottomMargin: 0,
          gradientAreaHeight,
          spaceBetweenActions,
          safeBackgroundHeight: bottomMargin
        }}
      />
    );

  return (
    <>
      {isReady(merchantDetail) ? (
        <>
          <Animated.ScrollView
            style={{ flexGrow: 1 }}
            onScroll={scrollHandler}
            scrollEventThrottle={8}
            scrollIndicatorInsets={{ right: 1 }}
            snapToOffsets={[0]}
            snapToEnd={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: safeBottomAreaHeight
            }}
          >
            <ContentWrapper>
              {merchantDetail.value.imageUrl !== undefined && (
                <View onLayout={getTitleHeight}>
                  <Image
                    accessibilityIgnoresInvertColors
                    source={{ uri: merchantDetail.value.imageUrl }}
                    style={styles.merchantImage}
                  />
                  <VSpacer size={24} />
                </View>
              )}
              <H1>{merchantDetail.value.name}</H1>
              <VSpacer size={24} />
              <ListItemHeader
                label={I18n.t("bonus.cgn.merchantDetail.title.deals")}
              />
              {renderDiscountsList(merchantDetail.value.discounts)}
              <VSpacer size={24} />
              <ListItemInfo
                numberOfLines={0}
                label={I18n.t("bonus.cgn.merchantDetail.title.description")}
                value={merchantDetail.value.description}
              />
              <VSpacer size={24} />
              {renderMerchantAddressesList(
                merchantDetail.value.addresses,
                merchantDetail.value.allNationalAddresses
              )}
              <VSpacer size={24} />
            </ContentWrapper>
          </Animated.ScrollView>
          {footerComponent}
        </>
      ) : (
        <SafeAreaView style={IOStyles.flex}>
          <CgnMerchantDetailScreenSkeleton />
        </SafeAreaView>
      )}
    </>
  );
};

// ------------------------ render utils

const CgnMerchantDetailScreenSkeleton = () => (
  <GradientScrollView primaryActionProps={undefined}>
    <Placeholder.Box
      animate="fade"
      radius={styles.merchantImage.borderRadius}
      width="100%"
      height={210}
    />
    <VSpacer size={24} />
    <Placeholder.Line animate="fade" textSize={24} />
    <VSpacer size={16} />
    <Placeholder.Line animate="fade" textSize={24} width="50%" />
    <VSpacer size={48} />
    <Placeholder.Box animate="fade" width={100} height={16} radius={4} />
    <VSpacer size={24} />
    <Placeholder.Box animate="fade" width="100%" height={170} radius={8} />
    <VSpacer size={8} />
    <Placeholder.Box animate="fade" width="100%" height={170} radius={8} />
    <VSpacer size={24} />
    <ListItemHeader label="" />
  </GradientScrollView>
);

const renderMerchantAddressesList = (
  addresses: ReadonlyArray<Address> | undefined,
  isAllNationalAddressMerchant: boolean
) =>
  addresses !== undefined && addresses.length > 0 ? (
    <>
      <ListItemHeader
        label={I18n.t("bonus.cgn.merchantDetail.title.contactInfo")}
      />
      {addresses.map((address, index) => (
        <CgnAddressListItem
          item={address}
          key={index}
          isAllNationalAddress={isAllNationalAddressMerchant}
        />
      ))}
    </>
  ) : null;

// ------------------------ styles - consts - export

const styles = StyleSheet.create({
  merchantImage: {
    width: "100%",
    height: 210,
    resizeMode: "cover",
    borderRadius: 12
  }
});

export default CgnMerchantDetailScreen;
