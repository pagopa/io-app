import * as React from "react";
import { useMemo } from "react";
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

const calculateBottomSheetHeight = (
  discount: Discount,
  merchantType?: DiscountCodeType
): number =>
  310 +
  (discount.description === undefined
    ? 0
    : discount.description.length * 0.65) +
  (discount.condition === undefined ? 0 : discount.condition.length * 0.65) +
  (merchantType === undefined ? -50 : 0);

export const useCgnDiscountDetailBottomSheet = (
  discount: Discount,
  merchantType?: DiscountCodeType,
  landingPageHandler?: (url: string, referer: string) => void
) => {
  const height = useMemo(
    () => calculateBottomSheetHeight(discount, merchantType),
    [discount, merchantType]
  );

  const { present: openBottomSheet, dismiss } = useIOBottomSheetRaw(
    height,
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
