import { ListItemCheckbox } from "@pagopa/io-app-design-system";
import React from "react";

type Props = {
  title: string;
  subtitle: string;
  checked: boolean;
  onValueChange?: (newValue: boolean) => void;
};

const UnsubscriptionCheckListItem = (props: Props) => (
  <ListItemCheckbox
    value={props.title}
    description={props.subtitle}
    {...props}
  />
);

export { UnsubscriptionCheckListItem };
