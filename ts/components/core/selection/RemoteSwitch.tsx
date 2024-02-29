import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { View, ActivityIndicator } from "react-native";
import { Icon, NativeSwitch } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { TestID } from "../../../types/WithTestID";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import { calculateSlop } from "../accessibility";
import { IOStyleVariables } from "../variables/IOStyleVariables";

type Props<E> = {
  value: pot.Pot<boolean, E>;
  onRetry?: () => void;
} & TestID &
  Pick<
    React.ComponentProps<typeof NativeSwitch>,
    "onValueChange" | "accessibilityLabel"
  >;

const iconSize = 24;
const slop = calculateSlop(iconSize);

const LoadingVersion = (props: TestID) => (
  <View style={{ width: IOStyleVariables.switchWidth }}>
    <ActivityIndicator
      testID={props.testID}
      color={"black"}
      accessibilityLabel={I18n.t("global.remoteStates.loading")}
    />
  </View>
);

type SwitchProps = Pick<
  React.ComponentProps<typeof NativeSwitch>,
  "value" | "onValueChange" | "accessibilityLabel"
> & {
  testID?: string;
  disabled?: boolean;
};

const SwitchVersion = (props: SwitchProps) => (
  <NativeSwitch
    // testID={props.testID}
    value={props.value}
    // disabled={props.disabled}
    onValueChange={props.onValueChange}
    accessibilityLabel={props.accessibilityLabel}
  />
);

type NoneErrorProps<E> = TestID & Pick<Props<E>, "onRetry">;

const NoneErrorVersion = <E, _>(props: NoneErrorProps<E>) => (
  <TouchableDefaultOpacity
    accessibilityRole={"button"}
    accessibilityLabel={I18n.t("global.genericRetry")}
    hitSlop={{ bottom: slop, left: slop, right: slop, top: slop }}
    onPress={props.onRetry}
    style={{ width: IOStyleVariables.switchWidth, alignItems: "center" }}
  >
    <Icon testID={props.testID} name="reload" size={iconSize} color="blue" />
  </TouchableDefaultOpacity>
);

/**
 * A Switch that handles the graphical states of a pot, used to represent a remote information.
 * none or some loading -> loading spinner
 * noneError -> no value to display -> show a reload icon
 * some, some error -> the switch with the value
 * someUpdating -> the switch with the new value, disabled (cannot change value during the upsert)
 * @param props
 * @constructor
 *
 * @deprecated Use `NativeSwitch` if you just need the switch alone, use `ListItemSwitch` if you need the
 * corresponding list item. All these components are available through the
 * external `io-app-design-system` package
 */
export const RemoteSwitch = <E, _>(props: Props<E>): React.ReactElement => {
  const loadingComponent = <LoadingVersion testID={props.testID} />;
  const switchComponent = (value: boolean) => (
    <SwitchVersion
      testID={props.testID}
      value={value}
      onValueChange={props.onValueChange}
      accessibilityLabel={props.accessibilityLabel}
    />
  );

  return pot.fold(
    props.value,
    () => loadingComponent,
    () => loadingComponent,
    _ => loadingComponent,
    _ => <NoneErrorVersion testID={props.testID} onRetry={props.onRetry} />,
    value => switchComponent(value),
    _ => loadingComponent,
    (_, newValue) => (
      <SwitchVersion testID={props.testID} value={newValue} disabled={true} />
    ),
    value => switchComponent(value)
  );
};
