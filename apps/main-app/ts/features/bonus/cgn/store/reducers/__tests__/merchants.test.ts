import { Discount } from "@io-app/api-types/generated/definitions/cgn/merchants/Discount";
import { Merchant } from "@io-app/api-types/generated/definitions/cgn/merchants/Merchant";

import { remoteReady } from "../../../../../../common/model/RemoteValue";
import {
  resetMerchantDiscountCode,
  selectFeaturedOpportunity,
  selectMerchantDiscount,
  setMerchantDiscountCode
} from "../../actions/merchants";
import reducer, { CgnMerchantsState } from "../merchants";

const merchant = { id: "merchant-id" } as Merchant;
const discount = { id: "discount-id" } as Discount;

const initialState = reducer(undefined, { type: "@@INIT" } as never);

describe("cgn merchants reducer", () => {
  it("selects merchant and discount in one step and resets the discount code", () => {
    const stateWithCode: CgnMerchantsState = {
      ...initialState,
      selectedDiscountCode: "OLD_CODE"
    };

    const state = reducer(
      stateWithCode,
      selectFeaturedOpportunity({ merchant, discount })
    );

    expect(state.selectedMerchant).toEqual(remoteReady(merchant));
    expect(state.selectedDiscount).toEqual(remoteReady(discount));
    expect(state.selectedDiscountCode).toBeUndefined();
  });

  it("keeps the selected merchant unchanged on discount-only selection", () => {
    const state = reducer(
      { ...initialState, selectedMerchant: remoteReady(merchant) },
      selectMerchantDiscount(discount)
    );

    expect(state.selectedMerchant).toEqual(remoteReady(merchant));
    expect(state.selectedDiscount).toEqual(remoteReady(discount));
  });

  it("sets and resets the discount code", () => {
    const withCode = reducer(initialState, setMerchantDiscountCode("CODE"));
    expect(withCode.selectedDiscountCode).toBe("CODE");

    const reset = reducer(withCode, resetMerchantDiscountCode());
    expect(reset.selectedDiscountCode).toBeUndefined();
  });
});
