import * as React from "react";
import { StyleSheet } from "react-native";
import themeVariables from "../../../theme/variables";
import { H3 } from "../typography/H3";
import { IOStyles } from "../variables/IOStyles";
import { RawAccordion } from "./RawAccordion";

type Props = Omit<React.ComponentProps<typeof RawAccordion>, "header"> & {
  title: string;
};

const styles = StyleSheet.create({
  header: {
    marginVertical: themeVariables.contentPadding
  }
});

/**
 * A simplified accordion that accepts a title and one child and uses {@link RawAccordion}
 * @param props
 * @constructor
 */
export const IOAccordion = (props: Props): React.ReactElement => (
  <RawAccordion
    animated={props.animated}
    headerStyle={styles.header}
    accessibilityLabel={props.title}
    header={
      <H3 numberOfLines={1} style={IOStyles.flex}>
        {props.title}
      </H3>
    }
  >
    {props.children}
  </RawAccordion>
);
