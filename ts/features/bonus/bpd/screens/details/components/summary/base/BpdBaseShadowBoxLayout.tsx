import * as React from "react";
import { VSpacer } from "../../../../../../../../components/core/spacer/Spacer";
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
    <VSpacer size={4} />
    {props.row2}
    {props.row3}
  </ShadowBox>
);
