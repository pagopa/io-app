import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { index } from "fp-ts/lib/Array";
import { connect } from "react-redux";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { H5 } from "../../../../../components/core/typography/H5";
import { H4 } from "../../../../../components/core/typography/H4";
import { ShadowBox } from "../../../bpd/screens/details/components/summary/base/ShadowBox";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { getCategorySpecs } from "../../utils/filters";
import I18n from "../../../../../i18n";
import { navigateToCgnMerchantLandingWebview } from "../../navigation/actions";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { useCgnDiscountDetailBottomSheet } from "./CgnDiscountDetail";
import CgnDiscountValueBox from "./CgnDiscountValueBox";

type Props = {
  discount: Discount;
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
  navigateToLandingWebview
}: Props) => {
  const { present } = useCgnDiscountDetailBottomSheet(
    discount,
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
            {index(0, [...discount.productCategories]).fold(
              undefined,
              categoryKey =>
                getCategorySpecs(categoryKey).fold(undefined, c => (
                  <View style={styles.row}>
                    {c.icon({ height: 22, width: 22, fill: IOColors.bluegrey })}
                    <View hspacer small />
                    <H5 weight={"SemiBold"} color={"bluegrey"}>
                      {I18n.t(c.nameKey).toLocaleUpperCase()}
                    </H5>
                  </View>
                ))
            )}
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToLandingWebview: (url: string, referer: string) =>
    dispatch(
      navigateToCgnMerchantLandingWebview({
        landingPageUrl: url,
        landingPageReferrer: referer
      })
    )
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnMerchantDiscountItem);
