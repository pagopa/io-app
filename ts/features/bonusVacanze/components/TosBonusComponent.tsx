import { Body, Container, Content, Right } from "native-base";
import * as React from "react";
import { BackHandler, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import AppHeader from "../../../components/ui/AppHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import IconFont from "../../../components/ui/IconFont";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";

type Props = {
  onClose: () => void;
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: customVariables.contentPadding
  }
});

/**
 * Component to show the TOS for the bonus activation flow
 */
const TosBonusComponent: React.FunctionComponent<Props> = props => {
  const handleBackPressed = () => {
    props.onClose();
    return true;
  };

  React.useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackPressed);

    return () =>
      BackHandler.removeEventListener("hardwareBackPress", handleBackPressed);
  });

  const closeButtonProps = {
    block: true,
    primary: true,
    onPress: props.onClose,
    title: I18n.t("global.buttons.close")
  };

  return (
    <Container>
      <AppHeader noLeft={true}>
        <Body />
        <Right>
          <ButtonDefaultOpacity
            onPress={() => props.onClose()}
            transparent={true}
          >
            <IconFont name="io-close" />
          </ButtonDefaultOpacity>
        </Right>
      </AppHeader>
      <Content
        contentContainerStyle={styles.contentContainerStyle}
        noPadded={true}
      >
        <Markdown>{I18n.t("bonus.tos.content")}</Markdown>
      </Content>
      <FooterWithButtons type="SingleButton" leftButton={closeButtonProps} />
    </Container>
  );
};

export default TosBonusComponent;
