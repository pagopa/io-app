import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IconViewerBox, iconItemGutter } from "../components/IconViewerBox";
import { ShowroomSection } from "../components/ShowroomSection";
import {
  Icon,
  IOIcons,
  IOIconType,
  IconNav,
  IONavIcons,
  IONavIconType
} from "../../../components/core/icons";
import { H2 } from "../../../components/core/typography/H2";
import {} from "../../../components/core/icons";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (iconItemGutter / 2) * -1,
    marginRight: (iconItemGutter / 2) * -1,
    marginBottom: 24
  }
});

export const IconsShowroom = () => (
  <ShowroomSection title={"Icons"}>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOIcons).map(([iconItemName]) => (
        <IconViewerBox
          key={iconItemName}
          name={iconItemName}
          image={<Icon name={iconItemName as IOIconType} size="100%" />}
        />
      ))}
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Navigation
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IONavIcons).map(([iconItemName]) => (
        <IconViewerBox
          key={iconItemName}
          name={iconItemName}
          size="medium"
          image={<IconNav name={iconItemName as IONavIconType} size="100%" />}
        />
      ))}
    </View>
  </ShowroomSection>
);
