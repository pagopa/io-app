import { ComponentProps, Fragment, ReactNode } from "react";
import { Divider } from "../layout";
import { ListItemRadio, ListItemRadioWithAmount } from "../listitems";

export type RadioItem<T> = {
  id: T;
  value: string;
  accessibilityLabel?: string;
  description?: string | ReactNode;
  disabled?: boolean;
  startImage?: ComponentProps<typeof ListItemRadio>["startImage"];
  loadingProps?: ComponentProps<typeof ListItemRadio>["loadingProps"];
};

export type RadioItemWithAmount<T> = {
  id: T;
  label: string;
  formattedAmountString: string;
} & (
  | {
      isSuggested?: false;
    }
  | {
      isSuggested: true;
      suggestReason: string;
    }
);
type CommonProps<T> = {
  selectedItem?: T;
  onPress: (selected: T) => void;
};

type RadioListItemProps<T> = {
  type: "radioListItem";
  items: ReadonlyArray<RadioItem<T>>;
} & CommonProps<T>;

type RadioListItemWithAmountProps<T> = {
  type: "radioListItemWithAmount";
  items: ReadonlyArray<RadioItemWithAmount<T>>;
} & CommonProps<T>;

type Props<T> = RadioListItemProps<T> | RadioListItemWithAmountProps<T>;

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
          testID={`RadioItemTestID_${item.id}`}
          value={item.value}
          description={item.description}
          accessibilityLabel={item.accessibilityLabel}
          startImage={item.startImage}
          disabled={item.disabled}
          loadingProps={item.loadingProps}
          onValueChange={() => props.onPress(item.id)}
          selected={props.selectedItem === item.id}
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
            label={item.label}
            formattedAmountString={item.formattedAmountString}
            suggestReason={item.suggestReason}
            isSuggested={item.isSuggested}
            onValueChange={() => props.onPress(item.id)}
            selected={props.selectedItem === item.id}
          />
        ) : (
          <ListItemRadioWithAmount
            label={item.label}
            formattedAmountString={item.formattedAmountString}
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
