import { View } from "native-base";
import * as React from "react";
import { H3 } from "../../../../../../../components/core/typography/H3";
import { IOColors } from "../../../../../../../components/core/variables/IOColors";
import IconFont from "../../../../../../../components/ui/IconFont";
import Markdown from "../../../../../../../components/ui/Markdown";
import I18n from "../../../../../../../i18n";

const iconSize = 64;

/**
 * Informs the user about the consequences of the cashback unsubscription
 * @constructor
 */
export const UnsubscribeComponent = (): React.ReactElement => (
  <View style={{justifyContent: "space-between"}}>
    <View spacer={true}/>
    <IconFont name={"io-notice"} size={iconSize} color={IOColors.red}/>
    <View spacer={true}/>
    <H3 color={"red"}>{I18n.t("bonus.bpd.unsubscribe.body1")}</H3>
    <View spacer={true}/>
    <Markdown>{I18n.t("bonus.bpd.unsubscribe.body2")}</Markdown>
  </View>
);
