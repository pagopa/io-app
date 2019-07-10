import I18n from "i18n-js";
import { Container, Content, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItem, StyleSheet } from "react-native";
import customVariables from "../theme/variables";
import AppHeader from "./ui/AppHeader";
import FooterWithButtons from "./ui/FooterWithButtons";

type Props = {
  items: ReadonlyArray<any>;
  keyExtractor: (item: any, index: number) => string;
  renderItem: ListRenderItem<any>;
  onCancel: () => void;
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  itemSeparator: {
    height: 1,
    marginLeft: customVariables.contentPadding,
    marginRight: customVariables.contentPadding,
    backgroundColor: customVariables.brandLightGray
  },
  header: {
    height: customVariables.contentPadding / 2
  }
});

const ItemSeparatorComponent = () => <View style={styles.itemSeparator} />;

/**
 * A component view, search and select a list of items
 * TODO search will be introduced with story https://www.pivotaltracker.com/story/show/166792313
 * TODO select will be introduced with story https://www.pivotaltracker.com/story/show/167102335
 */
export class ChooserListComponent extends React.PureComponent<Props> {
  private onPressCancel = () => {
    this.props.onCancel();
  };

  private onPressSave = () => {
    this.onPressCancel();
  };

  /**
   * Footer
   */
  private renderFooterButtons() {
    const cancelButtonProps = {
      block: true,
      light: true,
      bordered: true,
      onPress: this.onPressCancel,
      title: I18n.t("global.buttons.cancel")
    };
    const saveButtonProps = {
      block: true,
      primary: true,
      onPress: this.onPressSave,
      title: I18n.t("global.buttons.saveSelection")
    };

    return (
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={cancelButtonProps}
        rightButton={saveButtonProps}
      />
    );
  }

  public render() {
    const { items, keyExtractor, renderItem } = this.props;

    return (
      <Container style={styles.container}>
        <AppHeader style={styles.header} />
        <Content
          noPadded={true}
          keyboardShouldPersistTaps="always"
          style={styles.content}
        >
          <View>
            {items.length > 0 && (
              <FlatList
                keyboardShouldPersistTaps="always"
                removeClippedSubviews={false}
                data={items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ItemSeparatorComponent={ItemSeparatorComponent}
              />
            )}
          </View>
        </Content>
        {this.renderFooterButtons()}
      </Container>
    );
  }
}
