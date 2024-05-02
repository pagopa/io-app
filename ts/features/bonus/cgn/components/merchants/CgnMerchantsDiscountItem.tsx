import * as React from "react";
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { navigateToCgnMerchantLandingWebview } from "../../navigation/actions";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { DiscountCodeType } from "../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { useCgnDiscountDetailBottomSheet } from "../../hooks/useCgnDiscountDetailBottomSheet";
import { CgnModuleDiscount } from "./CgnModuleDiscount";

type Props = {
  discount: Discount;
  operatorName: string;
  merchantType?: DiscountCodeType;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8
  }
});

const CgnMerchantDiscountItem: React.FunctionComponent<Props> = ({
  discount,
  operatorName,
  merchantType,
  navigateToLandingWebview
}: Props) => {
  const { present, bottomSheet: cgnDiscountDetail } =
    useCgnDiscountDetailBottomSheet(
      discount,
      operatorName,
      merchantType,
      navigateToLandingWebview
    );
  return (
    <View style={styles.container}>
      <CgnModuleDiscount onPress={present} discount={discount} />
      {cgnDiscountDetail}
    </View>
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
