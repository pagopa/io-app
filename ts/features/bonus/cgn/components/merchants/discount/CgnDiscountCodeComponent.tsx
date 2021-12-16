import { View } from "native-base";
import * as React from "react";
import { H3 } from "../../../../../../components/core/typography/H3";
import I18n from "../../../../../../i18n";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import CgnStaticCodeComponent from "./CgnStaticCodeComponent";
import CgnOTPCodeComponent from "./CgnOTPCodeComponent";

type Props = {
  discount: Discount;
  merchantType: "online" | "offline";
};

const CgnDiscountCodeComponent = ({ discount, merchantType }: Props) => {
  const renderProperCodeVisualization = (discount: Discount) => {
    if (discount.staticCode) {
      return <CgnStaticCodeComponent staticCode={discount.staticCode} />;
    }
    if (
      discount.staticCode === undefined &&
      discount.landingPageUrl === undefined
    ) {
      return <CgnOTPCodeComponent />;
    }
    return <></>;
  };

  return merchantType === "offline" ? (
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
