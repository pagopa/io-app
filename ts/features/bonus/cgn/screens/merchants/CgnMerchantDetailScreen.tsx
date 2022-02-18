import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { useCallback, useEffect } from "react";
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import { Address } from "../../../../../../definitions/cgn/merchants/Address";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { H1 } from "../../../../../components/core/typography/H1";
import { H2 } from "../../../../../components/core/typography/H2";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import IconFont from "../../../../../components/ui/IconFont";
import I18n from "../../../../../i18n";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { showToast } from "../../../../../utils/showToast";

type NavigationParams = Readonly<{
  merchantID: Merchant["id"];
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  NavigationStackScreenProps<NavigationParams>;

const styles = StyleSheet.create({
  merchantImage: {
    width: "100%",
    height: 230,
    resizeMode: "cover",
    borderRadius: 12
  },
  spaced: { justifyContent: "space-between" },
  flexEnd: { alignSelf: "flex-end" }
});

const COPY_ICON_SIZE = 24;

const CgnMerchantDetailScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { merchantDetail, requestMerchantDetail } = props;
  const merchantID = props.navigation.getParam("merchantID");
  const renderDiscountListItem = ({ item }: ListRenderItemInfo<Discount>) =>
    isReady(merchantDetail) ? (
      <CgnMerchantDiscountItem
        discount={item}
        merchantType={merchantDetail.value.discountCodeType}
      />
    ) : null;

  const loadMerchantDetail = useCallback(() => {
    requestMerchantDetail(merchantID);
  }, [merchantID, requestMerchantDetail]);

  const renderAddressesListItem = ({ item }: ListRenderItemInfo<Address>) => (
    <TouchableDefaultOpacity
      style={[IOStyles.row, styles.spaced, { paddingVertical: 10 }]}
      onPress={() => clipboardSetStringWithFeedback(item.full_address)}
    >
      <H4 weight={"Regular"} style={IOStyles.flex}>
        {item.full_address}
      </H4>
      <IconFont
        name={"io-copy"}
        size={COPY_ICON_SIZE}
        color={IOColors.blue}
        style={styles.flexEnd}
      />
    </TouchableDefaultOpacity>
  );

  useEffect(loadMerchantDetail, [loadMerchantDetail]);

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={
        isReady(merchantDetail) ? merchantDetail.value.name : undefined
      }
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        {isReady(merchantDetail) ? (
          <>
            <ScrollView style={[IOStyles.flex]} bounces={false}>
              {merchantDetail.value.imageUrl && (
                <View style={{ paddingHorizontal: 16 }}>
                  <Image
                    source={{ uri: merchantDetail.value.imageUrl }}
                    style={styles.merchantImage}
                  />
                </View>
              )}
              <View style={IOStyles.horizontalContentPadding}>
                <View spacer large />
                <H1>{merchantDetail.value.name}</H1>
                <View spacer />
                <H2>{I18n.t("bonus.cgn.merchantDetail.title.deals")}</H2>
                <FlatList
                  data={merchantDetail.value.discounts}
                  renderItem={renderDiscountListItem}
                  keyExtractor={(item: Discount) => item.name}
                />
                <View spacer />
                <H2>{I18n.t("bonus.cgn.merchantDetail.title.description")}</H2>
                <H4 weight={"Regular"}>{merchantDetail.value.description}</H4>
                <View spacer />
                {merchantDetail.value.addresses &&
                  merchantDetail.value.addresses.length > 0 && (
                    <>
                      <H2>
                        {I18n.t("bonus.cgn.merchantDetail.title.addresses")}
                      </H2>
                      <FlatList
                        data={merchantDetail.value.addresses}
                        renderItem={renderAddressesListItem}
                        keyExtractor={(item: Address) => item.full_address}
                        ItemSeparatorComponent={() => (
                          <ItemSeparatorComponent noPadded />
                        )}
                      />
                    </>
                  )}
              </View>
            </ScrollView>
            {fromNullable(merchantDetail.value.websiteUrl).fold(
              undefined,
              url => (
                <FooterWithButtons
                  type={"SingleButton"}
                  leftButton={{
                    ...confirmButtonProps(
                      () =>
                        openWebUrl(url, () =>
                          showToast(I18n.t("bonus.cgn.generic.linkError"))
                        ),
                      I18n.t("bonus.cgn.merchantDetail.cta.label")
                    ),
                    bordered: true
                  }}
                />
              )
            )}
          </>
        ) : (
          <LoadingErrorComponent
            isLoading={isLoading(merchantDetail)}
            loadingCaption={I18n.t("global.remoteStates.loading")}
            onRetry={loadMerchantDetail}
          />
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  merchantDetail: cgnSelectedMerchantSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestMerchantDetail: (id: Merchant["id"]) =>
    dispatch(cgnSelectedMerchant.request(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnMerchantDetailScreen);
