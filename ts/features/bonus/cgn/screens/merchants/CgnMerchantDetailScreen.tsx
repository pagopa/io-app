import {
  GradientScrollView,
  H1,
  IOToast,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import { Image, SafeAreaView, StyleSheet } from "react-native";
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
import Placeholder from "rn-placeholder";

export type CgnMerchantDetailScreenNavigationParams = Readonly<{
  merchantID: Merchant["id"];
}>;

const CgnMerchantDetailScreen = () => {
  // -------    hooks
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
  // -------    render

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  return (
    <>
      {isReady(merchantDetail) ? (
        <GradientScrollView
          primaryActionProps={
            merchantDetail.value.websiteUrl
              ? {
                  label: "Vali al sito dell'esercente",
                  accessibilityLabel: I18n.t(
                    "wallet.payment.psp.continueButton"
                  ),
                  onPress: () =>
                    handlePressMerchantWebsite(merchantDetail.value.websiteUrl)
                }
              : undefined
          }
        >
          {merchantDetail.value.imageUrl !== undefined && (
            <>
              <Image
                accessibilityIgnoresInvertColors
                source={{ uri: merchantDetail.value.imageUrl }}
                style={styles.merchantImage}
              />
              <VSpacer size={24} />
            </>
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
        </GradientScrollView>
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
  },
  scrollViewContainer: {
    flexGrow: 1,
    ...IOStyles.horizontalContentPadding
  },
  spaced: { justifyContent: "space-between" },
  flexEnd: { alignSelf: "flex-end" }
});

export default CgnMerchantDetailScreen;
