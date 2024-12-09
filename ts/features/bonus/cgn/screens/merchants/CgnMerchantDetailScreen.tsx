import {
  ContentWrapper,
  Divider,
  GradientScrollView,
  H1,
  IOToast,
  IOVisualCostants,
  ListItemAction,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import Placeholder from "rn-placeholder";
import { Route, useRoute } from "@react-navigation/native";
import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Image,
  LayoutChangeEvent,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { isReady } from "../../../../../common/model/RemoteValue";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { CgnMerchantDiscountItem } from "../../components/merchants/CgnMerchantsDiscountItem";
import { cgnSelectedMerchant } from "../../store/actions/merchants";
import { cgnSelectedMerchantSelector } from "../../store/reducers/merchants";
import { CgnAddressListItem } from "../../components/merchants/CgnAddressListItem";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { openWebUrl } from "../../../../../utils/url";

export type CgnMerchantDetailScreenNavigationParams = Readonly<{
  merchantID: Merchant["id"];
}>;

const scrollTriggerOffsetValue: number = 88;

const CgnMerchantDetailScreen = () => {
  // -------    hooks
  const safeAreaInsets = useSafeAreaInsets();

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

  const paddingBottom: number = React.useMemo(
    () =>
      safeAreaInsets.bottom === 0
        ? IOVisualCostants.appMarginDefault
        : safeAreaInsets.bottom,
    [safeAreaInsets]
  );

  useEffect(loadMerchantDetail, [loadMerchantDetail]);

  // -------    utils/logic

  const DiscountListItem = ({ item }: { item: Discount }) =>
    isReady(merchantDetail) ? (
      <CgnMerchantDiscountItem discount={item} />
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

  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    // eslint-disable-next-line functional/immutable-data
    scrollTranslationY.value = contentOffset.y;
  });

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
    supportRequest: true,
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    }
  });

  const showAddresses =
    isReady(merchantDetail) &&
    merchantDetail.value.addresses !== undefined &&
    merchantDetail.value.addresses.length > 0;

  const showGotToWebsite =
    isReady(merchantDetail) && merchantDetail.value.websiteUrl !== undefined;

  if (isReady(merchantDetail)) {
    return (
      <Animated.ScrollView
        style={{ flexGrow: 1 }}
        onScroll={scrollHandler}
        scrollEventThrottle={8}
        scrollIndicatorInsets={{ right: 1 }}
        snapToOffsets={[0]}
        snapToEnd={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom
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
          {(showAddresses || showGotToWebsite) && (
            <ListItemHeader
              label={I18n.t("bonus.cgn.merchantDetail.title.contactInfo")}
            />
          )}
          {showGotToWebsite && (
            <ListItemAction
              variant="primary"
              icon="website"
              label={I18n.t("bonus.cgn.merchantDetail.cta.website")}
              onPress={() =>
                handlePressMerchantWebsite(merchantDetail.value.websiteUrl)
              }
            />
          )}
          {showGotToWebsite && showAddresses && <Divider />}
          {merchantDetail.value.addresses?.map((address, index) => (
            <CgnAddressListItem
              item={address}
              key={index}
              isAllNationalAddress={merchantDetail.value.allNationalAddresses}
            />
          ))}
          <VSpacer size={24} />
        </ContentWrapper>
      </Animated.ScrollView>
    );
  } else {
    return (
      <SafeAreaView style={IOStyles.flex}>
        <CgnMerchantDetailScreenSkeleton />
      </SafeAreaView>
    );
  }
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
