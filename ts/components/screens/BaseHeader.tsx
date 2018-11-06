import { Body, Left, Right, Text } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableHighlight } from "react-native";

import IconFont from "../../components/ui/IconFont";
import AppHeader from "../ui/AppHeader";

import { DEFAULT_APPLICATION_NAME } from "../../config";

import GoBackButton from "../GoBackButton";
import { InstabugButtons } from "../InstabugButtons";

const styles = StyleSheet.create({
  helpButton: {
    paddingLeft: 10
  }
});

export interface OwnProps {
  headerTitle?: string;
  goBack?: () => void;
  primary?: boolean;
  onShowHelp?: () => void;
}

type Props = OwnProps;

export class BaseHeader extends React.PureComponent<Props> {
  public render() {
    const { goBack, headerTitle, onShowHelp } = this.props;
    return (
      <AppHeader primary={this.props.primary}>
        {goBack && (
          <Left>
            <GoBackButton onPress={goBack} />
          </Left>
        )}
        <Body>
          <Text white={this.props.primary} numberOfLines={1}>
            {headerTitle || DEFAULT_APPLICATION_NAME}
          </Text>
        </Body>
        <Right>
          <InstabugButtons />
          {onShowHelp && (
            <TouchableHighlight onPress={onShowHelp} style={styles.helpButton}>
              <IconFont name="io-question" />
            </TouchableHighlight>
          )}
        </Right>
      </AppHeader>
    );
  }
}
