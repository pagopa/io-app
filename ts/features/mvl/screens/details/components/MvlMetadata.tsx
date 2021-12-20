import { View } from "native-base";
import * as React from "react";
import { H2 } from "../../../../../components/core/typography/H2";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { MvlMetadata } from "../../../types/mvlData";

type Props = {
  metadata: MvlMetadata;
};

/**
 * An accordion that allows the user to navigate and see all the legal message related metadata
 * TODO: this is a placeholder, will be implemented in https://pagopa.atlassian.net/browse/IAMVL-20
 * @constructor
 * @param _
 */
export const MvlMetadataComponent = (_: Props): React.ReactElement => (
  <View style={{ height: 80, backgroundColor: IOColors.orange }}>
    <H2>{"Metadata placeholder"}</H2>
  </View>
);
