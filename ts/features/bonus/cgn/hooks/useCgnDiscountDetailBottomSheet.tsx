import * as React from "react";
import { Discount } from "../../../../../definitions/cgn/merchants/Discount";
import { DiscountCodeType } from "../../../../../definitions/cgn/merchants/DiscountCodeType";
import {
  bottomSheetContent,
  useIOBottomSheetRaw
} from "../../../../utils/bottomSheet";
import {
  CgnDiscountDetail,
  CgnDiscountDetailHeader
} from "../components/merchants/CgnDiscountDetail";

export const useCgnDiscountDetailBottomSheet = (
  discount: Discount,
  merchantType?: DiscountCodeType,
  landingPageHandler?: (url: string, referer: string) => void
) => {
  const { present: openBottomSheet, dismiss } = useIOBottomSheetRaw(
    440,
    bottomSheetContent
  );

  return {
    dismiss,
    present: () =>
      openBottomSheet(
        <CgnDiscountDetail
          discount={discount}
          merchantType={merchantType}
          onLandingCtaPress={(url: string, referer: string) => {
            landingPageHandler?.(url, referer);
            dismiss();
          }}
        />,
        <CgnDiscountDetailHeader discount={discount} />
      )
  };
};
