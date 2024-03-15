import React from "react";
import { View } from "react-native";
import { Icon, HSpacer, ButtonOutline } from "@pagopa/io-app-design-system";
import { H5 } from "../../../components/core/typography/H5";
import i18n from "../../../i18n";
import { handleItemOnPress } from "../../../utils/url";
import { trackPNTimelineExternal } from "../analytics";

export const MessageTimelineCTA = (props: { url: string }) => (
  <View
    style={{
      flexDirection: "column",
      marginBottom: 40
    }}
  >
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8
      }}
    >
      <Icon name="info" size={24} color="bluegrey" />
      <HSpacer size={16} />
      <H5
        weight="Regular"
        color="bluegreyDark"
        style={{ marginRight: 46, marginVertical: 14 }}
      >
        {i18n.t("features.pn.details.timeline.info")}
      </H5>
    </View>
    <ButtonOutline
      label={i18n.t("features.pn.details.timeline.cta")}
      accessibilityLabel={i18n.t("features.pn.details.timeline.cta")}
      fullWidth
      onPress={() => {
        trackPNTimelineExternal();
        handleItemOnPress(props.url)();
      }}
    />
  </View>
);
