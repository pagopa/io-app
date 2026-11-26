import { Body, VSpacer, VStack } from "@io-app/design-system";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { IOScrollView } from "../../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { PocFieldView } from "./PocFieldView";
import {
  pocDefaultValues,
  pocFormDefinition,
  pocFormSchema,
  PocFormValues
} from "./pocFormDefinition";

type FieldError = undefined | { message: string };

export const TanStackFormPlayground = () => {
  useHeaderSecondLevel({ title: "TanStack Form + zod" });

  const [submitted, setSubmitted] = useState<PocFormValues>();

  const form = useForm({
    defaultValues: pocDefaultValues,
    // zod è usato direttamente come Standard Schema, senza resolver
    validators: { onChange: pocFormSchema, onSubmit: pocFormSchema },
    onSubmit: ({ value }) => setSubmitted(value)
  });

  return (
    <>
      <IOScrollView
        actions={{
          type: "SingleButton",
          primary: {
            label: "Invia",
            onPress: () => void form.handleSubmit()
          }
        }}
      >
        <VStack space={16}>
          {pocFormDefinition.map(definition => (
            // Ci si iscrive solo al valore da cui dipende la visibilità
            <form.Subscribe
              key={definition.id}
              selector={state =>
                definition.visibleWhen
                  ? state.values[definition.visibleWhen.fieldId] ===
                    definition.visibleWhen.equals
                  : true
              }
            >
              {isVisible =>
                isVisible && (
                  <form.Field name={definition.id}>
                    {field => (
                      <>
                        <PocFieldView
                          definition={definition}
                          errorMessage={
                            field.state.meta.isTouched
                              ? (field.state.meta.errors[0] as FieldError)
                                  ?.message
                              : undefined
                          }
                          onBlur={field.handleBlur}
                          onChange={field.handleChange}
                          value={field.state.value}
                        />
                      </>
                    )}
                  </form.Field>
                )
              }
            </form.Subscribe>
          ))}
        </VStack>
        <VSpacer size={24} />
        {submitted && <Body>{JSON.stringify(submitted, null, 2)}</Body>}
      </IOScrollView>
    </>
  );
};
