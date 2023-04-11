import * as React from "react";
import { ActivityIndicator } from "react-native";
import Switch from "../../../../../../components/ui/Switch";
import ButtonDefaultOpacity from "../../../../../../components/ButtonDefaultOpacity";
import { Icon } from "../../../../../../components/core/icons/Icon";
import { GraphicalValue } from "./PaymentMethodBpdToggle";

type Props = {
  graphicalValue: GraphicalValue;
  // The use choose to change the value of the toggle
  onValueChanged?: (b: boolean) => void;
  // The user tap the "notice" icon when the graphical state is "notActivable"
  onPress?: () => void;
};

const iconSize = 24;

/**
 * The toggle used in {@link PaymentMethodBpdToggle}.
 * @param props
 * @constructor
 */
export const BpdToggle: React.FunctionComponent<Props> = props => {
  switch (props.graphicalValue.state) {
    case "loading":
      return (
        <ActivityIndicator
          color={"black"}
          accessible={false}
          importantForAccessibility={"no-hide-descendants"}
          accessibilityElementsHidden={true}
        />
      );
    case "ready":
    case "update":
      return props.graphicalValue.value === "notActivable" ? (
        <ButtonDefaultOpacity onPress={props.onPress} transparent={true}>
          <Icon
            testID={"infoIconBpdPaymentActivationTestID"}
            name="notice"
            size={iconSize}
            color="blue"
          />
        </ButtonDefaultOpacity>
      ) : (
        <Switch
          testID={"switchPaymentActivationTestID"}
          value={props.graphicalValue.value === "active"}
          disabled={props.graphicalValue.state === "update"}
          onValueChange={props.onValueChanged}
        />
      );
  }
};
