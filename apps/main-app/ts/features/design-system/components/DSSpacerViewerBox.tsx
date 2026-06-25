import {
  HSpacer,
  IOColors,
  IOSpacer,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Text, View } from "react-native";

type DSSpacerLabelProps = {
  value: IOSpacer;
};

type DSSpacerViewerBoxProps = {
  orientation?: "horizontal" | "vertical";
  size: IOSpacer;
};

const DSSpacerLabel = ({ value }: DSSpacerLabelProps) => {
  const theme = useIOTheme();
  return (
    <Text
      ellipsizeMode="tail"
      numberOfLines={1}
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
