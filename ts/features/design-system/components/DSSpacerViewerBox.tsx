import * as React from "react";
import { View, Text } from "react-native";
import {
  VSpacer,
  HSpacer,
  SpacerOrientation
} from "../../../components/core/spacer/Spacer";
import {
  IOColors,
  IOThemeContext
} from "../../../components/core/variables/IOColors";
import type { IOSpacer } from "../../../components/core/variables/IOSpacing";

type DSSpacerViewerBoxProps = {
  size: IOSpacer;
  orientation?: SpacerOrientation;
};

type DSSpacerLabelProps = {
  value: IOSpacer;
};

const DSSpacerLabel = ({ value }: DSSpacerLabelProps) => (
  <IOThemeContext.Consumer>
    {theme => (
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{ fontSize: 9, color: IOColors[theme["textBody-tertiary"]] }}
      >
        {value}
      </Text>
    )}
  </IOThemeContext.Consumer>
);

export const DSSpacerViewerBox = ({
  size,
  orientation = "vertical"
}: DSSpacerViewerBoxProps) => (
  <IOThemeContext.Consumer>
    {theme => (
      <>
        {orientation === "vertical" ? (
          <View style={{ flexDirection: "column" }}>
            <View
              style={{
                backgroundColor: IOColors[theme["appBackground-tertiary"]]
              }}
            >
              <VSpacer size={size} />
            </View>
            {size && (
              <View style={{ flexDirection: "row", marginTop: 4 }}>
                <DSSpacerLabel value={size} />
              </View>
            )}
          </View>
        ) : (
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                backgroundColor: IOColors[theme["appBackground-tertiary"]],
                height: 75
              }}
            >
              <HSpacer size={size} />
            </View>
            {size && (
              <View style={{ flexDirection: "column", marginLeft: 4 }}>
                <DSSpacerLabel value={size} />
              </View>
            )}
          </View>
        )}
      </>
    )}
  </IOThemeContext.Consumer>
);
