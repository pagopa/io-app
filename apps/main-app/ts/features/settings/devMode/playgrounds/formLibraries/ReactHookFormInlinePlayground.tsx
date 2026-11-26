import { zodResolver } from "@hookform/resolvers/zod";
import { Body, VSpacer, VStack } from "@io-app/design-system";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { IOScrollView } from "../../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { PocFieldView } from "./PocFieldView";
import {
  isFieldVisible,
  pocDefaultValues,
  pocFormDefinition,
  pocFormSchema,
  PocFormValues
} from "./pocFormDefinition";

export const ReactHookFormInlinePlayground = () => {
  useHeaderSecondLevel({ title: "React Hook Form + zod (inline)" });

  const [submitted, setSubmitted] = useState<PocFormValues>();

  const { control, handleSubmit } = useForm<PocFormValues>({
    resolver: zodResolver(pocFormSchema),
    defaultValues: pocDefaultValues,
    mode: "onTouched",
    shouldUnregister: true
  });

  // Current values of the whole form, used to decide which fields are visible
  const values = useWatch({ control });

  return (
    <>
      <IOScrollView
        actions={{
          type: "SingleButton",
          primary: {
            label: "Invia",
            onPress: () => void handleSubmit(setSubmitted)()
          }
        }}
      >
        <VStack space={16}>
          {pocFormDefinition
            .filter(definition => isFieldVisible(definition, values))
            .map(definition => (
              <Controller
                control={control}
                key={definition.id}
                name={definition.id}
                render={({ field, fieldState }) => (
                  <>
                    <PocFieldView
                      definition={definition}
                      errorMessage={fieldState.error?.message}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </>
                )}
              />
            ))}
        </VStack>
        <VSpacer size={24} />
        {submitted && <Body>{JSON.stringify(submitted, null, 2)}</Body>}
      </IOScrollView>
    </>
  );
};
