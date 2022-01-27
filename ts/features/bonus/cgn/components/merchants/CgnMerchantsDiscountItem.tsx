import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { lookup } from "fp-ts/lib/Array";
import { connect } from "react-redux";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { H5 } from "../../../../../components/core/typography/H5";
import { H4 } from "../../../../../components/core/typography/H4";
import { ShadowBox } from "../../../bpd/screens/details/components/summary/base/ShadowBox";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import I18n from "../../../../../i18n";
import { navigateToCgnMerchantLandingWebview } from "../../navigation/actions";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { DiscountCodeType } from "../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { useCgnDiscountDetailBottomSheet } from "../../hooks/useCgnDiscountDetailBottomSheet";
import CgnDiscountValueBox from "./CgnDiscountValueBox";
import { renderCategoryElement } from "./CgnMerchantListItem";

type Props = {
  discount: Discount;
  merchantType?: DiscountCodeType;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  container: { justifyContent: "space-between", alignItems: "center" },
  row: {
    flexDirection: "row"
  },
  verticalPadding: {
    flex: 1,
    paddingVertical: 7
  }
});

const CgnMerchantDiscountItem: React.FunctionComponent<Props> = ({
  discount,
  merchantType,
  navigateToLandingWebview
}: Props) => {
  const { present } = useCgnDiscountDetailBottomSheet(
    discount,
    merchantType,
    navigateToLandingWebview
  );
  return (
    <TouchableDefaultOpacity style={styles.verticalPadding} onPress={present}>
      <ShadowBox>
        <View style={[styles.row, styles.container]}>
          <View style={IOStyles.flex}>
            <View style={IOStyles.flex}>
              <H4 weight={"SemiBold"} color={"blue"}>
                {discount.name}
              </H4>
            </View>
            <View spacer xsmall />
            {discount.productCategories.length > 2
              ? lookup(0, [...discount.productCategories]).fold(
                  undefined,
                  c => (
                    <>
                      {renderCategoryElement(c)}
                      <View
                        hspacer
                        small
                        style={{
                          borderRightColor: IOColors.bluegrey,
                          borderRightWidth: 1
                        }}
                      />
                      <View hspacer small />
                      <H5 color={"bluegrey"} weight={"SemiBold"}>
                        {I18n.t(
                          "bonus.cgn.merchantDetail.categories.counting",
                          {
                            count: discount.productCategories.length - 1
                          }
                        ).toLocaleUpperCase()}
                      </H5>
                    </>
                  )
                )
              : discount.productCategories.map(category => (
                  <>
                    {renderCategoryElement(category)}
                    {discount.productCategories.indexOf(category) !==
                      discount.productCategories.length - 1 && (
                      <>
                        <View
                          hspacer
                          small
                          style={{
                            borderRightColor: IOColors.bluegrey,
                            borderRightWidth: 1
                          }}
                        />
                        <View hspacer small />
                      </>
                    )}
                  </>
                ))}
          </View>
          {discount.discount && (
            <CgnDiscountValueBox value={discount.discount} small={true} />
          )}
        </View>
      </ShadowBox>
    </TouchableDefaultOpacity>
  );
};

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToLandingWebview: (url: string, referer: string) =>
    navigateToCgnMerchantLandingWebview({
      landingPageUrl: url,
      landingPageReferrer: referer
    })
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnMerchantDiscountItem);
