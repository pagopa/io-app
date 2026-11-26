import { zodResolver } from "@hookform/resolvers/zod";
import { Body, VSpacer, VStack } from "@io-app/design-system";
import { useState } from "react";
import { Control, useController, useForm, useWatch } from "react-hook-form";

import { IOScrollView } from "../../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { PocFieldView } from "./PocFieldView";
import {
  pocDefaultValues,
  PocFieldDefinition,
  pocFormDefinition,
  pocFormSchema,
  PocFormValues
} from "./pocFormDefinition";

type RhfFieldProps = {
  control: Control<PocFormValues>;
  definition: PocFieldDefinition;
};

const RhfField = ({ control, definition }: RhfFieldProps) => {
  // Subscribes only to the field this one's visibility depends on, so only
  // this component re-renders when that value changes
  const dependency = useWatch({
    control,
    name: definition.visibleWhen?.fieldId ?? definition.id
  });
  // Connects the RN input to the form state (RN has no refs/DOM, so
  // `register` can't be used): gives value, onChange, onBlur and the error
  const { field, fieldState } = useController({
    control,
    name: definition.id
  });

  // Hidden fields render nothing; with shouldUnregister they are also removed
  // from the form values and skipped by validation
  if (definition.visibleWhen && dependency !== definition.visibleWhen.equals) {
    return null;
  }

  return (
    <>
      <PocFieldView
        definition={definition}
        errorMessage={fieldState.error?.message}
        onBlur={field.onBlur}
        onChange={field.onChange}
        value={field.value}
      />
    </>
  );
};

export const ReactHookFormPlayground = () => {
  useHeaderSecondLevel({ title: "React Hook Form + zod" });

  const [submitted, setSubmitted] = useState<PocFormValues>();

  const { control, handleSubmit } = useForm<PocFormValues>({
    // Validation is delegated to the zod schema
    resolver: zodResolver(pocFormSchema),
    defaultValues: pocDefaultValues,
    // Validates on first blur, then on every change
    mode: "onTouched",
    // Unmounted (hidden) fields are dropped from the submitted values
    shouldUnregister: true
  });

  return (
    <>
      <IOScrollView
        actions={{
          type: "SingleButton",
          primary: {
            label: "Invia",
            // handleSubmit runs validation and calls setSubmitted only if valid
            onPress: () => void handleSubmit(setSubmitted)()
          }
        }}
      >
        <VStack space={16}>
          {/* The form is generated from the (BE-like) definition, not hardcoded */}
          {pocFormDefinition.map(definition => (
            <RhfField
              control={control}
              definition={definition}
              key={definition.id}
            />
          ))}
        </VStack>
        <VSpacer size={24} />
        {submitted && <Body>{JSON.stringify(submitted, null, 2)}</Body>}
      </IOScrollView>
    </>
  );
};
