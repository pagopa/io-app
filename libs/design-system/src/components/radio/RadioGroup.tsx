import { ComponentProps, Fragment, ReactNode } from "react";

import { Divider } from "../layout";
import { ListItemRadio, ListItemRadioWithAmount } from "../listitems";

export type RadioItem<T> = {
  accessibilityLabel?: string;
  description?: ReactNode | string;
  disabled?: boolean;
  id: T;
  loadingProps?: ComponentProps<typeof ListItemRadio>["loadingProps"];
  startImage?: ComponentProps<typeof ListItemRadio>["startImage"];
  value: string;
};

export type RadioItemWithAmount<T> = {
  formattedAmountString: string;
  id: T;
  label: string;
} & (
  | {
      isSuggested: true;
      suggestReason: string;
    }
  | {
      isSuggested?: false;
    }
);
type CommonProps<T> = {
  onPress: (selected: T) => void;
  selectedItem?: T;
};

type Props<T> = RadioListItemProps<T> | RadioListItemWithAmountProps<T>;

type RadioListItemProps<T> = CommonProps<T> & {
  items: ReadonlyArray<RadioItem<T>>;
  type: "radioListItem";
};

type RadioListItemWithAmountProps<T> = CommonProps<T> & {
  items: ReadonlyArray<RadioItemWithAmount<T>>;
  type: "radioListItemWithAmount";
};

/**
 * A list of radio buttons.
 * The management of the selection is demanded and derived by the `selectedItem` prop.
 * The item with the `id` equal to the `selectedItem` is the active one.
 */

const RadioListItem = <T,>(props: RadioListItemProps<T>) => (
  <>
    {props.items.map((item, index) => (
      <Fragment key={`radio_item_${item.id}`}>
        <ListItemRadio
          accessibilityLabel={item.accessibilityLabel}
          description={item.description}
          disabled={item.disabled}
          loadingProps={item.loadingProps}
          onValueChange={() => props.onPress(item.id)}
          selected={props.selectedItem === item.id}
          startImage={item.startImage}
          testID={`RadioItemTestID_${item.id}`}
          value={item.value}
        />
        {index < props.items.length - 1 && <Divider />}
      </Fragment>
    ))}
  </>
);

const RadioListItemWithAmount = <T,>(
  props: RadioListItemWithAmountProps<T>
) => (
  <>
    {props.items.map((item, index) => (
      <Fragment key={`radio_item_${item.id}`}>
        {item.isSuggested ? (
          <ListItemRadioWithAmount
            formattedAmountString={item.formattedAmountString}
            isSuggested={item.isSuggested}
            label={item.label}
            onValueChange={() => props.onPress(item.id)}
            selected={props.selectedItem === item.id}
            suggestReason={item.suggestReason}
          />
        ) : (
          <ListItemRadioWithAmount
            formattedAmountString={item.formattedAmountString}
            label={item.label}
            onValueChange={() => props.onPress(item.id)}
            selected={props.selectedItem === item.id}
          />
        )}

        {index < props.items.length - 1 && <Divider />}
      </Fragment>
    ))}
  </>
);
export const RadioGroup = <T,>(props: Props<T>) => (
  <>
    {props.type === "radioListItem" && RadioListItem(props)}
    {props.type === "radioListItemWithAmount" && RadioListItemWithAmount(props)}
  </>
);
