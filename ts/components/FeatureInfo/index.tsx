import React from "react";
import { View } from "react-native";
import { IOIcons, Icon } from "../core/icons";
import type { IOPictograms } from "../core/pictograms";
import { LabelSmall } from "../core/typography/LabelSmall";
import { IOStyles } from "../core/variables/IOStyles";
import { HSpacer } from "../core/spacer/Spacer";

export type SpacerOrientation = "vertical" | "horizontal";

type FeatureInfo = {
  iconName?: IOIcons;
  pictogramName?: IOPictograms;
  // Necessary to render text with different formatting
  body?: string | React.ReactNode;
};

const DEFAULT_ICON_SIZE: number = 24;
const DEFAULT_PICTOGRAM_SIZE = 48;

const renderNode = (body: FeatureInfo["body"]) => {
  if (typeof body === "string") {
    return (
      <LabelSmall weight="Regular" color="grey-700" testID="infoScreenBody">
        {body}
      </LabelSmall>
    );
  }

  return body;
};

export const FeatureInfo = ({
  iconName = "info",
  pictogramName,
  body
}: FeatureInfo) => (
  <View style={[IOStyles.flex, IOStyles.row, IOStyles.alignCenter]}>
    {iconName && !pictogramName && (
      <Icon name={iconName} size={DEFAULT_ICON_SIZE} color="grey-300" />
    )}
    <HSpacer size={24} />
    <View style={{ flexShrink: 1 }}>{renderNode(body)}</View>
  </View>
);
