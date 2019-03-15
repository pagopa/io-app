import { Body, Button, Left, Right, Text } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import IconFont from "../../components/ui/IconFont";
import AppHeader from "../ui/AppHeader";

import { DEFAULT_APPLICATION_NAME } from "../../config";

import GoBackButton from "../GoBackButton";
import { InstabugButtons } from "../InstabugButtons";

const styles = StyleSheet.create({
  helpButton: {
    padding: 8
  }
});

interface OwnProps {
  headerTitle?: string;
  goBack?: React.ComponentProps<typeof GoBackButton>["goBack"];
  primary?: boolean;
  onShowHelp?: () => void;
  // A property to set a custom AppHeader body
  body?: React.ReactNode;
}

type Props = OwnProps;

export class BaseHeader extends React.PureComponent<Props> {
  public render() {
    const { goBack, headerTitle, onShowHelp, body } = this.props;
    return (
      <AppHeader
        primary={this.props.primary}
        noLeft={typeof goBack === "undefined" || goBack === false}
      >
        {goBack && (
          <Left>
            <GoBackButton testID="back-button" onPress={goBack} />
          </Left>
        )}
        <Body>
          {body || (
            <Text white={this.props.primary} numberOfLines={1}>
              {headerTitle || DEFAULT_APPLICATION_NAME}
            </Text>
          )}
        </Body>
        <Right>
          <InstabugButtons />
          {onShowHelp && (
            <Button
              onPress={onShowHelp}
              style={styles.helpButton}
              transparent={true}
            >
              <IconFont name="io-question" />
            </Button>
          )}
        </Right>
      </AppHeader>
    );
  }
}
