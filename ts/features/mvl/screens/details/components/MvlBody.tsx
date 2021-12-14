import { View } from "native-base";
import * as React from "react";
import { Body } from "../../../../../components/core/typography/Body";
import { Label } from "../../../../../components/core/typography/Label";
import { MvlData } from "../../../types/mvlData";

type Props = {
  body: MvlData["body"];
};

/**
 * Render the body of a legal message, allows the user to choose between plain text or html representation
 * TODO: this is a placeholder, will be implemented in https://pagopa.atlassian.net/browse/IAMVL-23
 * @param _
 * @constructor
 */
export const MvlBody = (_: Props): React.ReactElement => (
  <View>
    <Body>
      <Label>{"Body Placeholder\n"}</Label>
      {
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
      }
    </Body>
  </View>
);
