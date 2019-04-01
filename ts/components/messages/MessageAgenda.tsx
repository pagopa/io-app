import { format } from "date-fns";
import { View } from "native-base";
import React, { ComponentProps } from "react";
import {
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
    height: 50,
    paddingHorizontal: customVariables.contentPadding,
    paddingVertical: customVariables.contentPadding / 2,
    backgroundColor: customVariables.brandLightGray
  },
  itemSeparator: {
    height: 1,
    backgroundColor: customVariables.brandLightGray
  }
});

const keyExtractor = (_: MessageWithContentAndDueDatePO) => _.id;

export type MessageAgendaSection = SectionListData<
  MessageWithContentAndDueDatePO
>;

// tslint:disable-next-line: readonly-array
export type Sections = MessageAgendaSection[];

export type ItemLayout = {
  length: number;
  offset: number;
  index: number;
};

type SelectedSectionListProps = Pick<
  ComponentProps<SectionList<MessageAgendaSection>>,
  "refreshing" | "onRefresh" | "onContentSizeChange"
>;

type OwnProps = {
  sections: Sections;
  getItemLayout: (data: Sections | null, index: number) => ItemLayout;
  onPressItem: (id: string) => void;
};

type Props = OwnProps & SelectedSectionListProps;

/**
 * A component to render messages with due_date in a agenda like form.
 */
class MessageAgenda extends React.PureComponent<Props> {
  private sectionListRef = React.createRef<any>();

  public scrollToSectionsIndex = (sectionsIndex: number) => {
    if (this.sectionListRef.current !== null) {
      this.sectionListRef.current.scrollToLocation({
        sectionIndex: sectionsIndex,
        itemIndex: 0,
        viewOffset: 50,
        viewPosition: 1,
        animated: true
      });
    }
  };

  public render() {
    const {
      sections,
      refreshing,
      onRefresh,
      getItemLayout,
      onContentSizeChange
    } = this.props;
    return (
      <SectionList
        ref={this.sectionListRef}
        // Forwarded props
        sections={sections}
        refreshing={refreshing}
        onRefresh={onRefresh}
        getItemLayout={getItemLayout}
        onContentSizeChange={onContentSizeChange}
        stickySectionHeadersEnabled={true}
        alwaysBounceVertical={false}
        keyExtractor={keyExtractor}
        renderSectionHeader={this.renderSectionHeader}
        renderItem={this.renderItem}
      />
    );
  }

  private renderSectionHeader = (info: { section: MessageAgendaSection }) => {
    return (
      <View style={styles.sectionHeader}>
        <H5>
          {format(
            info.section.title,
            I18n.t("global.dateFormats.dayAndMonth")
          ).toUpperCase()}
        </H5>
      </View>
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
