import * as React from "react";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { DiscountCodeType } from "../../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
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
      <VSpacer size={8} />
      {renderProperCodeVisualization(discount)}
      <VSpacer size={16} />
    </>
  );
};

export default CgnDiscountCodeComponent;
