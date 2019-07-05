import I18n from "i18n-js";
import { Text, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItem, ScrollView } from "react-native";
import FooterWithButtons from "./ui/FooterWithButtons";

type Props = {
  items: ReadonlyArray<any>;
  keyExtractor: (item: any, index: number) => string;
  renderItem: ListRenderItem<any>;
};

type State = {
  selectedItems: ReadonlyArray<any>;
};

export class ChooserListComponent extends React.PureComponent<Props, State> {
  private sectionedMultiSelect: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedItems: []
    };
  }

  public onSelectedItemsChange = (selectedItems: ReadonlyArray<any>) => {
    this.setState({ selectedItems });
  };

  private onPressCancel = () => {
    if (this.sectionedMultiSelect !== null) {
      this.sectionedMultiSelect._cancelSelection();
    }
  };

  private onPressSave = () => {
    if (this.sectionedMultiSelect !== null) {
      this.sectionedMultiSelect._submitSelection();
    }
  };

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

  private renderListEmptyComponent() {
    return (
      <View>
        <Text>Nessun elemento</Text>
      </View>
    );
  }

  public render() {
    const { items, keyExtractor, renderItem } = this.props;
    return (
      <View
        style={[
          {
            overflow: "hidden",
            marginHorizontal: 0,
            marginVertical: 0,
            borderRadius: 0,
            alignSelf: "stretch",
            flex: 1,
            backgroundColor: "white"
          }
        ]}
      >
        <ScrollView
          keyboardShouldPersistTaps="always"
          style={[{ paddingHorizontal: 12, flex: 1 }]}
        >
          <View>
            {items.length > 0 ? (
              <FlatList
                keyboardShouldPersistTaps="always"
                removeClippedSubviews={false}
                data={items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
              />
            ) : (
              this.renderListEmptyComponent()
            )}
          </View>
        </ScrollView>
        {this.renderFooterButtons()}
      </View>
    );
  }
}
