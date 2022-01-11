import { View } from "native-base";
import * as React from "react";
import { H3 } from "../../../../../../components/core/typography/H3";
import I18n from "../../../../../../i18n";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { DiscountCodeType } from "../../../../../../../definitions/cgn/merchants/DiscountCodeType";
import CgnStaticCodeComponent from "./CgnStaticCodeComponent";
import CgnOTPCodeComponent from "./CgnOTPCodeComponent";

type Props = {
  discount: Discount;
  merchantType?: DiscountCodeType;
};

const CgnDiscountCodeComponent = ({ discount, merchantType }: Props) => {
  const shouldNotRender =
    merchantType === "bucket" ||
    merchantType === "landingpage" ||
    merchantType === undefined;
  const renderProperCodeVisualization = (discount: Discount) => {
    switch (merchantType) {
      case "api":
        return <CgnOTPCodeComponent />;
      case "static":
        return <CgnStaticCodeComponent staticCode={discount.staticCode} />;
      case "bucket":
      case "landingpage":
      default:
        return <></>;
    }
  };

  return shouldNotRender ? (
    <></>
  ) : (
    <>
      <View spacer small />
      <H3 accessible={true} accessibilityRole={"header"}>
        {I18n.t("bonus.cgn.merchantDetail.title.discountCode")}
      </H3>
      {renderProperCodeVisualization(discount)}
    </>
  );
};

export default CgnDiscountCodeComponent;
