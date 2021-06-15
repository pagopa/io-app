type AllowedCategories = "disabled" | "worker" | "student" | "sick";

export type Beneficiary = {
  id: number;
  category: AllowedCategories;
};
