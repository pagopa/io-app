import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { navigateToCgnMerchantLandingWebview } from "../../navigation/actions";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { DiscountCodeType } from "../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { useCgnDiscountDetailBottomSheet } from "../../hooks/useCgnDiscountDetailBottomSheet";
import { Label } from "../../../../../components/core/typography/Label";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import IconFont from "../../../../../components/ui/IconFont";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";

type Props = {
  discount: Discount;
  merchantType?: DiscountCodeType;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  container: { justifyContent: "space-between", alignItems: "center" },
  listItem: {
    paddingHorizontal: 16,
    flex: 1,
    paddingVertical: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderColor: IOColors.bluegreyLight,
    borderStyle: "solid",
    borderWidth: 1
  }
});

const CgnMerchantDiscountItem: React.FunctionComponent<Props> = ({
  discount,
  merchantType,
  navigateToLandingWebview
}: Props) => {
  const { present, bottomSheet: cgnDiscountDetail } =
    useCgnDiscountDetailBottomSheet(
      discount,
      merchantType,
      navigateToLandingWebview
    );
  return (
    <TouchableDefaultOpacity style={[styles.listItem]} onPress={present}>
      <View style={[IOStyles.row, styles.container]}>
        <View style={IOStyles.flex}>
          <Label weight={"SemiBold"} color={"bluegreyDark"}>
            {discount.name}
          </Label>
        </View>
        <IconFont name={"io-right"} color={IOColors.blue} size={24} />
      </View>
      {cgnDiscountDetail}
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
