import { format } from "date-fns";
import { Text, View } from "native-base";
import React from "react";
import {
  Image,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  StyleSheet
} from "react-native";

import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { MessageWithContentAndDueDatePO } from "../../types/MessageWithContentAndDueDatePO";
import H5 from "../ui/H5";
import MessageAgendaItem from "./MessageAgendaItem";

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: customVariables.contentPadding,
    paddingVertical: customVariables.contentPadding / 2,
    backgroundColor: customVariables.brandLightGray
  },
  itemSeparator: {
    height: 1,
    backgroundColor: customVariables.brandLightGray
  },
  emptyListWrapper: {
    padding: customVariables.contentPadding,
    alignItems: "center"
  },
  emptyListContentTitle: {
    paddingTop: customVariables.contentPadding
  },
  emptyListContentSubtitle: {
    textAlign: "center",
    paddingTop: customVariables.contentPadding,
    fontSize: customVariables.fontSizeSmall
  }
});

const keyExtractor = (_: MessageWithContentAndDueDatePO) => _.id;

const ItemSeparatorComponent = () => <View style={styles.itemSeparator} />;

export type MessageAgendaSection = SectionListData<
  MessageWithContentAndDueDatePO
>;

type Props = {
  // Can't use ReadonlyArray because of the SectionList section prop
  // typescript definition.
  // tslint:disable-next-line:readonly-array
  sections: MessageAgendaSection[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onPressItem: (id: string) => void;
};

const ListEmptyComponent = (
  <View style={styles.emptyListWrapper}>
    <View spacer={true} />
    <Image
      source={require("../../../img/messages/empty-due-date-list-icon.png")}
    />
    <Text style={styles.emptyListContentTitle}>
      {I18n.t("messages.deadlines.emptyMessage.title")}
    </Text>
    <Text style={styles.emptyListContentSubtitle}>
      {I18n.t("messages.deadlines.emptyMessage.subtitle")}
    </Text>
  </View>
);

/**
 * A component to render messages with due_date in a agenda like form.
 */
class MessageAgenda extends React.PureComponent<Props> {
  public render() {
    const { sections, isRefreshing, onRefresh } = this.props;
    return (
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        stickySectionHeadersEnabled={true}
        alwaysBounceVertical={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        renderSectionHeader={this.renderSectionHeader}
        renderItem={this.renderItem}
        ListEmptyComponent={ListEmptyComponent}
      />
    );
  }

  private renderSectionHeader = (info: { section: MessageAgendaSection }) => {
    return (
      <H5 style={styles.sectionHeader}>
        {format(
          info.section.title,
          I18n.t("global.dateFormats.dayAndMonth")
        ).toUpperCase()}
      </H5>
    );
  };

  private renderItem: SectionListRenderItem<
    MessageWithContentAndDueDatePO
  > = info => {
    const message = info.item;
    return (
      <MessageAgendaItem
        id={message.id}
        subject={message.content.subject}
        due_date={message.content.due_date}
        onPress={this.props.onPressItem}
      />
    );
  };
}

export default MessageAgenda;
