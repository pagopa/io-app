import { z } from "zod";

export type PocFieldDefinition = {
  id: string;
  label: string;
  required?: boolean;
  type: "boolean" | "text";
  visibleWhen?: { equals: boolean; fieldId: string };
};

export type PocFormValues = Record<string, unknown>;

// Definition example as it could come from the BE (generic fields)
export const pocFormDefinition: ReadonlyArray<PocFieldDefinition> = [
  { id: "name", label: "Nome", type: "text", required: true },
  { id: "hasItem", label: "Ho un oggetto", type: "boolean" },
  {
    id: "itemCode",
    label: "Codice oggetto",
    type: "text",
    required: true,
    visibleWhen: { fieldId: "hasItem", equals: true }
  }
];

export const isFieldVisible = (
  def: PocFieldDefinition,
  values: PocFormValues
) =>
  !def.visibleWhen ||
  values[def.visibleWhen.fieldId] === def.visibleWhen.equals;

export const pocDefaultValues: PocFormValues = Object.fromEntries(
  pocFormDefinition.map(def => [def.id, def.type === "boolean" ? false : ""])
);

// Schema built from the definition: a field is required only if visible
export const pocFormSchema = z
  .record(z.string(), z.unknown())
  .superRefine((values, ctx) => {
    pocFormDefinition.forEach(def => {
      if (def.required && isFieldVisible(def, values) && !values[def.id]) {
        ctx.addIssue({
          code: "custom",
          path: [def.id],
          message: "Campo obbligatorio"
        });
      }
    });
  });
