import { Route, useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import {
  View,
  FlatList,
  Image,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { Address } from "../../../../../../definitions/cgn/merchants/Address";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../components/core/typography/H1";
import { H2 } from "../../../../../components/core/typography/H2";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import I18n from "../../../../../i18n";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { showToast } from "../../../../../utils/showToast";
import { openWebUrl } from "../../../../../utils/url";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { isLoading, isReady } from "../../../bpd/model/RemoteValue";
import CgnMerchantDiscountItem from "../../components/merchants/CgnMerchantsDiscountItem";
import { cgnSelectedMerchant } from "../../store/actions/merchants";
import { cgnSelectedMerchantSelector } from "../../store/reducers/merchants";
import { Icon } from "../../../../../components/core/icons/Icon";
import CgnContactSection, {
  MerchantContactTypeEnum
} from "../../components/merchants/CgnContactSection";

export type CgnMerchantDetailScreenNavigationParams = Readonly<{
  merchantID: Merchant["id"];
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

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
const EXTERNAL_LINK_ICON_SIZE = 20;

const CgnMerchantDetailScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { merchantDetail, requestMerchantDetail } = props;
  const route =
    useRoute<
      Route<"CGN_MERCHANTS_DETAIL", CgnMerchantDetailScreenNavigationParams>
    >();
  const merchantID = useMemo(() => route.params.merchantID, [route]);

  const renderDiscountListItem = ({ item }: ListRenderItemInfo<Discount>) =>
    isReady(merchantDetail) ? (
      <CgnMerchantDiscountItem
        discount={item}
        operatorName={merchantDetail.value.name}
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
      <View style={styles.flexEnd}>
        <Icon name="copy" size={COPY_ICON_SIZE} color="blue" />
      </View>
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
            <ScrollView style={IOStyles.flex} bounces={false}>
              {merchantDetail.value.imageUrl && (
                <View style={{ paddingHorizontal: 16 }}>
                  <Image
                    source={{ uri: merchantDetail.value.imageUrl }}
                    style={styles.merchantImage}
                  />
                </View>
              )}
              <View style={IOStyles.horizontalContentPadding}>
                <VSpacer size={24} />
                <H1>{merchantDetail.value.name}</H1>
                <VSpacer size={16} />
                <H2>{I18n.t("bonus.cgn.merchantDetail.title.deals")}</H2>
                <VSpacer size={8} />
                <FlatList
                  data={merchantDetail.value.discounts}
                  renderItem={renderDiscountListItem}
                  keyExtractor={(item: Discount) => item.name}
                />
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
                {merchantDetail.value.addresses &&
                  merchantDetail.value.addresses.length > 0 && (
                    <>
                      <FlatList
                        data={merchantDetail.value.addresses}
                        renderItem={renderAddressesListItem}
                        keyExtractor={(item: Address) => item.full_address}
                      />
                    </>
                  )}
                {/* {merchantDetail.value.contacts && ( */}
                <>
                  <VSpacer size={16} />
                  {/* <H2>{I18n.t("bonus.cgn.merchantDetail.title.contacts")}</H2> */}
                  {/* <CgnContactSection contact={merchantDetail.value.contacts} /> */}
                  <CgnContactSection
                    contact={{
                      text: "test@test.it",
                      type: MerchantContactTypeEnum.EMAIL
                    }}
                  />
                </>
                {/* )} */}
              </View>
            </ScrollView>
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
