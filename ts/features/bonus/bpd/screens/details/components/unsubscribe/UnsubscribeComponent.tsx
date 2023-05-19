import { View } from "react-native";
import * as React from "react";
import { VSpacer } from "../../../../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../../../../components/core/typography/H3";
import Markdown from "../../../../../../../components/ui/Markdown";
import I18n from "../../../../../../../i18n";
import { Icon } from "../../../../../../../components/core/icons";

const iconSize = 64;

/**
 * Informs the user about the consequences of the cashback unsubscription
 * @constructor
 */
export const UnsubscribeComponent = (): React.ReactElement => (
  <View style={{ justifyContent: "space-between" }}>
    <VSpacer size={16} />
    <Icon name="notice" size={iconSize} color="red" />
    <VSpacer size={16} />
    <H3 color={"red"}>{I18n.t("bonus.bpd.unsubscribe.body1")}</H3>
    <VSpacer size={16} />
    <Markdown>{I18n.t("bonus.bpd.unsubscribe.body2")}</Markdown>
  </View>
);
