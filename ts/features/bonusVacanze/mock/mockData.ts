/**
 * This is just a temporary file to define utility types to develop Bonus section
 */
export type Bonus = {
  type: string;
  code: string;
  max_amount: number;
  tax_benefit: number;
  activated_at: Date;
};

export const mockedBonus: Bonus = {
  type: "Bonus Vacanze",
  code: "ABCDE123XYZ",
  max_amount: 500,
  tax_benefit: 300,
  activated_at: new Date("2020-07-04T12:20:00.000Z")
};

export const mockedAvailableBonusItem = {
  id: 1,
  name: "Bonus Vacanze",
  description: "descrizione bonus vacanze",
  valid_from: new Date("2020-07-01T00:00:00.000Z"),
  valid_to: new Date("2020-12-31T23:59:59.000Z"),
  cover:
    "https://gdsit.cdn-immedia.net/2018/08/fff810d2e44464312e70071340fd92fc.jpg"
};
