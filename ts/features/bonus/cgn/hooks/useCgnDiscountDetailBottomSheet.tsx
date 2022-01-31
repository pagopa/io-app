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
  const calculateBottomSheetHeight = (): number =>
    510 +
    (discount.description === undefined ? -100 : 0) +
    (discount.condition === undefined ? -100 : 0) +
    (merchantType === undefined ? -50 : 0);

  const { present: openBottomSheet, dismiss } = useIOBottomSheetRaw(
    calculateBottomSheetHeight(),
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
