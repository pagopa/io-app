import { Icon, IconButton, VSpacer } from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Address } from "../../../../../../definitions/cgn/merchants/Address";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { isLoading, isReady } from "../../../../../common/model/RemoteValue";
import { LoadingErrorComponent } from "../../../../../components/LoadingErrorComponent";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { H1 } from "../../../../../components/core/typography/H1";
import { H2 } from "../../../../../components/core/typography/H2";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { showToast } from "../../../../../utils/showToast";
import { openWebUrl } from "../../../../../utils/url";
import CgnMerchantDiscountItem from "../../components/merchants/CgnMerchantsDiscountItem";
import { CgnMerchantDetailScreenNavigationParams } from "../../navigation/params";
import { cgnSelectedMerchant } from "../../store/actions/merchants";
import { cgnSelectedMerchantSelector } from "../../store/reducers/merchants";

const CgnMerchantDetailScreen = () => {
  // -------    hooks
  const insets = useSafeAreaInsets();
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

  // -------    render

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={
        isReady(merchantDetail) ? merchantDetail.value.name : undefined
      }
      contextualHelp={emptyContextualHelp}
    >
      {isReady(merchantDetail) ? (
        <ScrollView
          scrollIndicatorInsets={{ right: 1 }}
          contentContainerStyle={[
            styles.scrollViewContainer,
            { paddingBottom: insets.bottom }
          ]}
          bounces={true}
        >
          <SafeAreaView style={IOStyles.flex}>
            {merchantDetail.value.imageUrl !== undefined && (
              <Image
                source={{ uri: merchantDetail.value.imageUrl }}
                style={styles.merchantImage}
              />
            )}
            <VSpacer size={24} />
            <H1>{merchantDetail.value.name}</H1>
            <VSpacer size={16} />
            <H2>{I18n.t("bonus.cgn.merchantDetail.title.deals")}</H2>
            <VSpacer size={8} />
            {renderDiscountsList(merchantDetail.value.discounts)}
            <VSpacer size={8} />
            <H2>{I18n.t("bonus.cgn.merchantDetail.title.description")}</H2>
            <H4 weight={"Regular"}>{merchantDetail.value.description}</H4>
            <VSpacer size={16} />
            <H2>{I18n.t("bonus.cgn.merchantDetail.title.addresses")}</H2>
            {pipe(
              merchantDetail.value.websiteUrl,
              O.fromNullable,
              O.fold(
                () => undefined,
                url => (
                  <TouchableDefaultOpacity
                    style={[
                      IOStyles.row,
                      styles.spaced,
                      { paddingVertical: 10 }
                    ]}
                    onPress={() =>
                      openWebUrl(url, () =>
                        showToast(I18n.t("bonus.cgn.generic.linkError"))
                      )
                    }
                  >
                    <H4 weight={"Regular"} style={IOStyles.flex}>
                      {url}
                    </H4>
                    <Icon
                      name="externalLink"
                      size={EXTERNAL_LINK_ICON_SIZE}
                      color="blue"
                    />
                  </TouchableDefaultOpacity>
                )
              )
            )}
            {renderAddressesList(
              merchantDetail.value.addresses,
              merchantDetail.value.allNationalAddresses
            )}
            <VSpacer size={24} />
          </SafeAreaView>
        </ScrollView>
      ) : (
        <SafeAreaView style={IOStyles.flex}>
          <LoadingErrorComponent
            isLoading={isLoading(merchantDetail)}
            loadingCaption={I18n.t("global.remoteStates.loading")}
            onRetry={loadMerchantDetail}
          />
        </SafeAreaView>
      )}
    </BaseScreenComponent>
  );
};

// ------------------------ render utils

type AddressesListItemProps = {
  item: Address;
  isAllNationalAddress: boolean;
};

const AddressesListItem = ({
  item,
  isAllNationalAddress
}: AddressesListItemProps) => (
  <TouchableDefaultOpacity
    style={[IOStyles.row, styles.spaced, { paddingVertical: 10 }]}
  >
    <H4 weight={"Regular"} style={IOStyles.flex}>
      {item.full_address}
    </H4>
    {!isAllNationalAddress && (
      <View style={styles.flexEnd}>
        <IconButton
          accessibilityLabel={I18n.t("global.buttons.copy")}
          icon="copy"
          onPress={() => clipboardSetStringWithFeedback(item.full_address)}
        />
      </View>
    )}
  </TouchableDefaultOpacity>
);

const renderAddressesList = (
  addresses: ReadonlyArray<Address> | undefined,
  isAllNationalAddressMerchant: boolean
) =>
  addresses !== undefined && addresses.length > 0
    ? addresses.map((address, index) => (
        <AddressesListItem
          item={address}
          key={index}
          isAllNationalAddress={isAllNationalAddressMerchant}
        />
      ))
    : null;

// ------------------------ styles - consts - export

const styles = StyleSheet.create({
  merchantImage: {
    width: "100%",
    height: 230,
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

const EXTERNAL_LINK_ICON_SIZE = 20;

export default CgnMerchantDetailScreen;
