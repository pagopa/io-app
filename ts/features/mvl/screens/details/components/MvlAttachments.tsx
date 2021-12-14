import { View } from "native-base";
import * as React from "react";
import { H2 } from "../../../../../components/core/typography/H2";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { MvlData } from "../../../types/mvlData";

type Props = {
  attachments: MvlData["attachments"];
};

/**
 * Render all the attachments of a legal message as listItem that can have different representation based on the contentType
 * TODO: this is a placeholder, will be implemented in https://pagopa.atlassian.net/browse/IAMVL-19
 * @constructor
 * @param _
 */
export const MvlAttachments = (_: Props): React.ReactElement => (
  <View style={{ height: 80, backgroundColor: IOColors.aqua }}>
    <H2>{"Attachments placeholder"}</H2>
  </View>
);
