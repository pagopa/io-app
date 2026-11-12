import { HSpacer, IOSpace, useIOColors, VSpacer } from "@io-app/design-system";
import { Text, View } from "react-native";

type DSSpacerLabelProps = {
  value: IOSpace;
};

type DSSpacerViewerBoxProps = {
  orientation?: "horizontal" | "vertical";
  size: IOSpace;
};

const DSSpacerLabel = ({ value }: DSSpacerLabelProps) => {
  const colors = useIOColors();
  return (
    <Text
      ellipsizeMode="tail"
      numberOfLines={1}
      style={{ fontSize: 9, color: colors.text.content.tertiary }}
    >
      {value}
    </Text>
  );
};

export const DSSpacerViewerBox = ({
  size,
  orientation = "vertical"
}: DSSpacerViewerBoxProps) => {
  const colors = useIOColors();
  return (
    <>
      {orientation === "vertical" ? (
        <View style={{ flexDirection: "column" }}>
          <View
            style={{
              backgroundColor: colors.surface.tertiary
            }}
          >
            <VSpacer size={size} />
          </View>
          <View style={{ flexDirection: "row", marginTop: 4 }}>
            <DSSpacerLabel value={size} />
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              backgroundColor: colors.surface.tertiary,
              height: 75
            }}
          >
            <HSpacer size={size} />
          </View>
          <View style={{ flexDirection: "column", marginLeft: 4 }}>
            <DSSpacerLabel value={size} />
          </View>
        </View>
      )}
    </>
  );
};
