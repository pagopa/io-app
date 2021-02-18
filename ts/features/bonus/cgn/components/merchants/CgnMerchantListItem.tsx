import * as React from "react";
import { View } from "native-base";
import { H5 } from "../../../../../components/core/typography/H5";
import { H2 } from "../../../../../components/core/typography/H2";
import { Label } from "../../../../../components/core/typography/Label";

type Props = {
  category: string;
  name: string;
  location: string;
};

const CgnMerchantListItem: React.FunctionComponent<Props> = (props: Props) => (
  <View>
    <H5 weight={"SemiBold"} color={"bluegrey"}>
      {props.category}
    </H5>
    <H2>{props.name}</H2>
    <Label weight={"Regular"} color={"bluegrey"}>
      {props.location}
    </Label>
  </View>
);

export default CgnMerchantListItem;
