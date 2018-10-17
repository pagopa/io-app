import * as React from "react";
import { SectionList as RNSectionList, StyleSheet } from "react-native";

import variables from "../../theme/variables";
import { ComponentProps } from "../../types/react";

interface Props extends ComponentProps<RNSectionList<any>> {
  withContentLateralPadding: boolean;
}

const styles = StyleSheet.create({
  padded: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  }
});

export const SectionList: React.SFC<Props> = ({
  withContentLateralPadding,
  ...props
}) => (
  <RNSectionList
    style={withContentLateralPadding ? styles.padded : undefined}
    {...props}
  />
);
