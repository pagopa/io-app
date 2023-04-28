import React from "react";
import { GestureResponderEvent, View } from "react-native";
import { IOIcons, Icon } from "../core/icons";
import { IOPictograms, Pictogram } from "../core/pictograms";
import { LabelSmall } from "../core/typography/LabelSmall";
import { IOStyles } from "../core/variables/IOStyles";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { Link } from "../core/typography/Link";

export type SpacerOrientation = "vertical" | "horizontal";

type FeatureInfo = {
  iconName?: IOIcons;
  pictogramName?: IOPictograms;
  // Necessary to render main body with different formatting
  body?: string | React.ReactNode;
  actionLabel?: string;
  actionOnPress?: (event: GestureResponderEvent) => void;
};

const DEFAULT_ICON_SIZE: number = 24;
const DEFAULT_PICTOGRAM_SIZE: number = 48;

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
  body,
  actionLabel,
  actionOnPress
}: FeatureInfo) => (
  <View style={[IOStyles.flex, IOStyles.row, IOStyles.alignCenter]}>
    {iconName && !pictogramName && (
      <Icon name={iconName} size={DEFAULT_ICON_SIZE} color="grey-300" />
    )}
    {pictogramName && (
      <Pictogram name={pictogramName} size={DEFAULT_PICTOGRAM_SIZE} />
    )}
    <HSpacer size={24} />
    <View style={{ flexShrink: 1 }}>
      {renderNode(body)}

      {actionLabel && actionOnPress && (
        <>
          <VSpacer size={8} />
          <Link onPress={actionOnPress}>{actionLabel}</Link>
        </>
      )}
    </View>
  </View>
);
