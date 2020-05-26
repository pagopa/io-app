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
  activated_at: new Date("2020-06-04T12:20:00.000Z")
};
