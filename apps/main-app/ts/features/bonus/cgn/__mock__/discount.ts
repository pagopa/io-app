import { Discount } from "../../../../../definitions/cgn/merchants/Discount";

export const mockDiscount: Discount = {
  id: "discountId" as Discount["id"],
  name: "a name" as Discount["name"],
  startDate: new Date("2022-02-07T08:43:38.000Z"),
  endDate: new Date("2022-02-20T08:43:38.000Z"),
  productCategories: []
};
