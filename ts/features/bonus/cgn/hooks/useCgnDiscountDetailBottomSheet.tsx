import * as React from "react";
import { Discount } from "../../../../../definitions/cgn/merchants/Discount";
import { DiscountCodeType } from "../../../../../definitions/cgn/merchants/DiscountCodeType";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import {
  CgnDiscountDetail,
  CgnDiscountDetailHeader
} from "../components/merchants/CgnDiscountDetail";

export const useCgnDiscountDetailBottomSheet = (
  discount: Discount,
  operatorName: string,
  merchantType?: DiscountCodeType,
  landingPageHandler?: (url: string, referer: string) => void
) => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal({
    component: (
      <CgnDiscountDetail
        discount={discount}
        merchantType={merchantType}
        operatorName={operatorName}
        onLandingCtaPress={(url: string, referer: string) => {
          landingPageHandler?.(url, referer);
          dismiss();
        }}
      />
    ),
    title: <CgnDiscountDetailHeader discount={discount} />
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};
