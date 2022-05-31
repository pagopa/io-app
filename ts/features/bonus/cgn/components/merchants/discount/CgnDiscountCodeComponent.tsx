import { View } from "native-base";
import * as React from "react";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { DiscountCodeType } from "../../../../../../../definitions/cgn/merchants/DiscountCodeType";
import CgnStaticCodeComponent from "./CgnStaticCodeComponent";
import CgnOTPCodeComponent from "./CgnOTPCodeComponent";
import CgnBucketCodeComponent from "./CgnBucketCodeComponent";

type Props = {
  discount: Discount;
  userAgeRange: string;
  operatorName: string;
  merchantType?: DiscountCodeType;
};

const CgnDiscountCodeComponent = ({
  discount,
  merchantType,
  operatorName,
  userAgeRange
}: Props) => {
  const shouldNotRender =
    merchantType === "landingpage" || merchantType === undefined;
  const renderProperCodeVisualization = (discount: Discount) => {
    switch (merchantType) {
      case "api":
        return (
          <CgnOTPCodeComponent
            operatorName={operatorName}
            userAgeRange={userAgeRange}
            categories={discount.productCategories}
          />
        );
      case "static":
        return (
          <CgnStaticCodeComponent
            staticCode={discount.staticCode}
            userAgeRange={userAgeRange}
            categories={discount.productCategories}
            operatorName={operatorName}
          />
        );
      case "bucket":
        return (
          <CgnBucketCodeComponent
            discountId={discount.id}
            userAgeRange={userAgeRange}
            categories={discount.productCategories}
            operatorName={operatorName}
          />
        );
      case "landingpage":
      default:
        return null;
    }
  };

  return shouldNotRender ? null : (
    <>
      <View spacer small />
      {renderProperCodeVisualization(discount)}
      <View spacer />
    </>
  );
};

export default CgnDiscountCodeComponent;
