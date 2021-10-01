import * as React from "react";
import { LabelledItem } from "../LabelledItem";
import { useContext, useState } from "react";
import SelectCalendarModal from "../SelectCalendarModal";
import { LightModalContext } from "./LightModal";

type Props = {
  label?: string;
  minimumDate?: Date;
  blocked?: boolean;
};

const TextboxAutocomplete: React.FunctionComponent<Props> = (props: Props) => {
  const { showModal, hideModal } = useContext(LightModalContext);
  return (
    <LabelledItem
      label={props.label}
      inputProps={{
        onFocus: _ =>
          showModal(
            <SelectCalendarModal
              onCancel={hideModal}
              onCalendarSelected={() => true}
            />
          ),
        value: "",
        onChangeText: () => true,
        placeholder: "Inserisci un comune"
      }}
    />
  );
};

export default TextboxAutocomplete;
