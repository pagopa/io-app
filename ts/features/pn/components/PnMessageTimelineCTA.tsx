import React from "react";
import { View } from "react-native";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import BlockButtons from "../../../components/ui/BlockButtons";
import IconFont from "../../../components/ui/IconFont";
import i18n from "../../../i18n";
import { handleItemOnPress } from "../../../utils/url";

export const PnMessageTimelineCTA = (props: { url: string }) => (
  <View
    style={{
      flexDirection: "column",
      marginBottom: 40
    }}>
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8
      }}>
      <IconFont
        name={"io-info"}
        size={24}
        color={IOColors.bluegrey}
        style={{ marginRight: 18 }}
      />
      <H5
        weight="Regular"
        color="bluegreyDark"
        style={{ marginRight: 46, marginVertical: 14 }}>
        {i18n.t("features.pn.details.timeline.info")}
      </H5>
    </View>
    <BlockButtons
      type="SingleButton"
      leftButton={{
        bordered: true,
        onPress: handleItemOnPress(props.url),
        title: i18n.t("features.pn.details.timeline.cta")
      }}
    />
  </View>
);
