import { View } from "native-base";
import * as React from "react";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { DiscountCodeType } from "../../../../../../../definitions/cgn/merchants/DiscountCodeType";
import CgnStaticCodeComponent from "./CgnStaticCodeComponent";
import CgnOTPCodeComponent from "./CgnOTPCodeComponent";
import CgnBucketCodeComponent from "./CgnBucketCodeComponent";

type Props = {
  discount: Discount;
  onCodePress: (eventName: string) => void;
  merchantType?: DiscountCodeType;
};

const CgnDiscountCodeComponent = ({
  discount,
  merchantType,
  onCodePress
}: Props) => {
  const shouldNotRender =
    merchantType === "landingpage" || merchantType === undefined;
  const renderProperCodeVisualization = (discount: Discount) => {
    switch (merchantType) {
      case "api":
        return <CgnOTPCodeComponent onCodePress={onCodePress} />;
      case "static":
        return (
          <CgnStaticCodeComponent
            staticCode={discount.staticCode}
            onCodePress={onCodePress}
          />
        );
      case "bucket":
        return (
          <CgnBucketCodeComponent
            discountId={discount.id}
            onCodePress={onCodePress}
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
