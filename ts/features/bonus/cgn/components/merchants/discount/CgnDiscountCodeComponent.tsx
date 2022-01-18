import { View } from "native-base";
import * as React from "react";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { DiscountCodeType } from "../../../../../../../definitions/cgn/merchants/DiscountCodeType";
import CgnStaticCodeComponent from "./CgnStaticCodeComponent";
import CgnOTPCodeComponent from "./CgnOTPCodeComponent";
import CgnBucketCodeComponent from "./CgnBucketCodeComponent";

type Props = {
  discount: Discount;
  merchantType?: DiscountCodeType;
};

const CgnDiscountCodeComponent = ({ discount, merchantType }: Props) => {
  const shouldNotRender =
    merchantType === "landingpage" || merchantType === undefined;
  const renderProperCodeVisualization = (discount: Discount) => {
    switch (merchantType) {
      case "api":
        return <CgnOTPCodeComponent />;
      case "static":
        return <CgnStaticCodeComponent staticCode={discount.staticCode} />;
      case "bucket":
        return <CgnBucketCodeComponent discountId={discount.id} />;
      case "landingpage":
      default:
        return null;
    }
  };

  return shouldNotRender ? null : (
    <>
      <View spacer small />
      {renderProperCodeVisualization(discount)}
    </>
  );
};

export default CgnDiscountCodeComponent;
