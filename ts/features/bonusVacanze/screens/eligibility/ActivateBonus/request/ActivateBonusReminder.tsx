import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import IconFont from "../../../../../../components/ui/IconFont";
import { openLink } from "../../../../../../components/ui/Markdown/handlers/link";
import themeVariables from "../../../../../../theme/variables";
import { activateBonusStyle } from "./Style";

type Props = {
  text: string;
  link: string;
};

const styles = StyleSheet.create({
  reminder: {
    color: themeVariables.lightGray
  },
  link: {
    color: themeVariables.textLinkColor
  }
});

const inpsCustomerCareLink =
  "https://www.inps.it/nuovoportaleinps/default.aspx?imenu=24";

/**
 * This component display a box with an icon and some text that remind the user some details about the bonus.
 * @param props
 * @constructor
 */
export const ActivateBonusReminder: React.FunctionComponent<Props> = props => {
  return (
    <View
      style={[activateBonusStyle.row, activateBonusStyle.horizontalPadding]}
    >
      <IconFont
        name={"io-titolare"}
        size={24}
        color={themeVariables.lightGray}
      />
      <View hspacer={true} />
      <Text style={[activateBonusStyle.boxText, styles.reminder]}>
        {`${props.text} `}
        <Text
          style={[activateBonusStyle.boxText, styles.link]}
          link={true}
          onPress={() => openLink(inpsCustomerCareLink)}
        >
          {props.link}
        </Text>
      </Text>
    </View>
  );
};
