import { ListItemSwitch, TextInput } from "@io-app/design-system";

import { PocFieldDefinition } from "./pocFormDefinition";

type PocFieldViewProps = {
  definition: PocFieldDefinition;
  errorMessage?: string;
  onBlur: () => void;
  onChange: (value: boolean | string) => void;
  value: unknown;
};

// Parte presentazionale condivisa: ogni libreria fornisce solo il binding
export const PocFieldView = ({
  definition,
  errorMessage,
  onBlur,
  onChange,
  value
}: PocFieldViewProps) => {
  switch (definition.type) {
    case "boolean":
      return (
        <ListItemSwitch
          label={definition.label}
          onSwitchValueChange={onChange}
          value={value === true}
        />
      );
    case "text":
      return (
        <TextInput
          accessibilityHint={`Inserisci ${definition.label}`}
          accessibilityLabel={definition.label}
          bottomMessage={errorMessage}
          onBlur={onBlur}
          onChangeText={onChange}
          placeholder={definition.label}
          value={typeof value === "string" ? value : ""}
        />
      );
    default:
      throw new Error(
        `Tipo di campo non supportato: ${String(definition.type)}`
      );
  }
};
