import * as React from "react";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  emptyListWrapper: {
    marginTop: 40,
    marginBottom: 40,
    height: 40
  }
});

/*
Dimensions of this component should be set
without magic numbers. Instead, we should:
- Calculate the height of the footer
- Add the page margin to the previous value
- Assign the obtained value to this component.

Component height = Dynamic footer height + Page margin

The following solution with a fixed height and vertical margins
is inherited by the previous developments (there was
a smile image instead of a blank space).
It should be considered a temporary trade-off
and not a definitive solution.
*/

export const EdgeBorderComponent = () => (
  <View style={styles.emptyListWrapper} />
);
