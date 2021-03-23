import { View } from "native-base";
import * as React from "react";
import { ShadowBox } from "./ShadowBox";

type Props = {
  row1: React.ReactNode;
  row2: React.ReactNode;
  row3: React.ReactNode;
};

/**
 * Define a base layout for a bpd infobox, using a {@link ShadowBox}
 * @param props
 * @constructor
 */
export const BpdBaseShadowBoxLayout: React.FunctionComponent<Props> = props => (
  <ShadowBox>
    {props.row1}
    <View spacer={true} xsmall={true} />
    {props.row2}
    {props.row3}
  </ShadowBox>
);
