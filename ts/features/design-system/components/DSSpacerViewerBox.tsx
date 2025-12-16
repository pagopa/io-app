import { View, Text } from "react-native";
import {
  IOColors,
  VSpacer,
  HSpacer,
  IOSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";

type DSSpacerViewerBoxProps = {
  size: IOSpacer;
  orientation?: "horizontal" | "vertical";
};

type DSSpacerLabelProps = {
  value: IOSpacer;
};

const DSSpacerLabel = ({ value }: DSSpacerLabelProps) => {
  const theme = useIOTheme();
  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={{ fontSize: 9, color: IOColors[theme["textBody-tertiary"]] }}
    >
      {value}
    </Text>
  );
};

export const DSSpacerViewerBox = ({
  size,
  orientation = "vertical"
}: DSSpacerViewerBoxProps) => {
  const theme = useIOTheme();
  return (
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
  );
};
