import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Text, View } from "native-base";
import React, { ComponentProps } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  SectionListScrollParams,
  StyleSheet
} from "react-native";
import variables from "../../theme/variables";

import startCase from "lodash/startCase";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { makeFontStyleObject } from "../../theme/fonts";
import customVariables from "../../theme/variables";
import { CreatedMessageWithContentAndDueDate } from "../../types/CreatedMessageWithContentAndDueDate";
import { format } from "../../utils/dates";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import MessageListItem from "./MessageListItem";

// Used to calculate the cell item layouts.
const LIST_HEADER_HEIGHT = 70;
const SECTION_HEADER_HEIGHT = 48;
const ITEM_HEIGHT = 158;
const FAKE_ITEM_HEIGHT = 75;
const ITEM_SEPARATOR_HEIGHT = 1;

const screenWidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
  // List
  emptyListWrapper: {
    padding: customVariables.contentPadding,
    alignItems: "center"
  },
  emptyListContentTitle: {
    paddingTop: customVariables.contentPadding
  },
  emptyListContentSubtitle: {
    textAlign: "center",
    fontSize: customVariables.fontSizeSmall
  },

  // ListHeader
  listHeaderWrapper: {
    height: LIST_HEADER_HEIGHT,
    paddingHorizontal: customVariables.contentPadding,
    paddingTop: 24,
    paddingBottom: 8
  },
  listHeaderButtonText: {
    ...makeFontStyleObject(Platform.select)
  },

  // SectionHeader
  sectionHeaderWrapper: {
    height: SECTION_HEADER_HEIGHT,
    paddingTop: 19,
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.colorWhite
  },
  sectionHeaderContent: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.brandLightGray
  },
  sectionHeaderText: {
    fontSize: 18,
    color: customVariables.brandDarkestGray,
    ...makeFontStyleObject(Platform.select, "600"),
    lineHeight: 20
  },

  // Items
  itemEmptyWrapper: {
    height: FAKE_ITEM_HEIGHT,
    paddingHorizontal: customVariables.contentPadding,
    justifyContent: "center"
  },
  itemEmptyText: {
    color: customVariables.brandDarkestGray
  },
  itemSeparator: {
    height: ITEM_SEPARATOR_HEIGHT,
    backgroundColor: customVariables.brandLightGray
  },
  button: {
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: variables.contentPadding,
    width: screenWidth - variables.contentPadding * 2
  },

  // Animation progress
  contentProgress: {
    display: "flex",
    position: "absolute",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    paddingRight: 0,
    height: 50,
    width: screenWidth,
    zIndex: 999,
    backgroundColor: customVariables.colorWhite
  },
  progress: { alignSelf: "center" },
  messageNoOthers: {
    padding: 12,
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center"
  }
});

export type FakeItem = {
  fake: true;
};

export type MessageAgendaItemMetadata = {
  isRead: boolean;
};

export type MessageAgendaItem = ITuple2<
  CreatedMessageWithContentAndDueDate,
  MessageAgendaItemMetadata
>;

export type MessageAgendaSection = SectionListData<
  MessageAgendaItem | FakeItem
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
  "refreshing" | "onContentSizeChange"
>;

type OwnProps = {
  sections: Sections;
  servicesById: ServicesByIdState;
  paymentsByRptId: PaymentByRptIdState;
  onPressItem: (id: string) => void;
  onLongPressItem: (id: string) => void;
  onMoreDataRequest: () => void;
  selectedMessageIds: Option<Set<string>>;
  isContinuosScrollEnabled: boolean;
  lastDeadlineId: Option<string>;
};

type Props = OwnProps & SelectedSectionListProps;

type State = {
  itemLayouts: ReadonlyArray<ItemLayout>;
  prevSections?: Sections;
  isLoadingProgress: boolean;
};

export const isFakeItem = (item: any): item is FakeItem => {
  return item.fake;
};

// Min number of items to activate continuos scroll
const minItemsToScroll = 5;

const keyExtractor = (_: MessageAgendaItem | FakeItem, index: number) =>
  isFakeItem(_) ? `item-${index}` : _.e1.id;

/**
 * Generate item layouts from sections.
 * The VirtualizedSectionList react-native component create cells for:
 * - SECTION_HEADER
 * - ITEM + ITEM_SEPARATOR (NOTE: A single cell for both)
 * - SECTION_FOOTER
 *
 * Here we calculate the ItemLayout for each cell.
 */
const generateItemLayouts = (sections: Sections) => {
  // tslint:disable-next-line: no-let
  let offset = LIST_HEADER_HEIGHT;
  // tslint:disable-next-line: no-let
  let index = 0;
  // tslint:disable-next-line: readonly-array
  const itemLayouts: ItemLayout[] = [];

  sections.forEach(section => {
    // Push the info about the SECTION_HEADER cell.
    itemLayouts.push({
      length: SECTION_HEADER_HEIGHT,
      offset,
      index
    });

    offset += SECTION_HEADER_HEIGHT;
    index++;

    section.data.forEach((_, dataIndex, data) => {
      // Push the info about the ITEM + ITEM_SEPARATOR cell.
      const isFake = isFakeItem(_);
      const isLastItem = dataIndex === data.length - 1;

      const itemHeight = isFake ? FAKE_ITEM_HEIGHT : ITEM_HEIGHT;
      const cellHeight = isLastItem
        ? itemHeight
        : itemHeight + ITEM_SEPARATOR_HEIGHT;
      itemLayouts.push({
        length: cellHeight,
        offset,
        index
      });

      offset += cellHeight;
      index++;
    });

    // Push the info about the SECTION_FOOTER cell.
    // NOTE: VirtualizedSectionList component creates a cell instance for
    // the SECTION_FOOTER even when not rendered.
    itemLayouts.push({
      length: 0,
      offset,
      index
    });

    index++;
  });

  return itemLayouts;
};

const ItemSeparatorComponent = () => <View style={styles.itemSeparator} />;

const FakeItemComponent = (
  <View style={styles.itemEmptyWrapper}>
    <Text style={styles.itemEmptyText}>{I18n.t("reminders.emptyMonth")}</Text>
  </View>
);

/**
 * A component to render messages with due_date in a agenda like form.
 */
class MessageAgenda extends React.PureComponent<Props, State> {
  // Ref to section list
  private sectionListRef = React.createRef<any>();
  private idTimeoutProgress?: number;

  constructor(props: Props) {
    super(props);
    this.state = {
      itemLayouts: [],
      isLoadingProgress: false
    };
    this.loadMoreData = this.loadMoreData.bind(this);
  }

  public componentWillUnmount() {
    if (this.idTimeoutProgress !== undefined) {
      clearTimeout(this.idTimeoutProgress);
    }
  }

  public componentDidUpdate(prevProps: Props) {
    // Load a min (>5) of section to activate scroll
    if (
      this.props.refreshing === false &&
      this.props.sections.length < minItemsToScroll &&
      // When length == 0 the button is showed
      this.props.sections.length !== 0
    ) {
      this.loadMoreData();
    }
    // Change status loading to show progress
    if (
      prevProps.refreshing !== this.props.refreshing &&
      this.props.refreshing === false
    ) {
      // We leave half a second longer to show the progress even for faster requests
      // tslint:disable-next-line: no-object-mutation
      this.idTimeoutProgress = setTimeout(() => {
        this.setState({
          isLoadingProgress: false
        });
        // Set scroll position when the new elements have been loaded
        if (
          this.sectionListRef !== undefined &&
          this.props.sections !== undefined &&
          this.props.sections.length >= minItemsToScroll &&
          this.props.isContinuosScrollEnabled
        ) {
          this.scrollToLocation({
            animated: false,
            itemIndex: 0,
            sectionIndex: Platform.OS === "ios" ? 2 : 1
          });
        }
      }, 500);
    }
  }

  public static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    const { sections } = nextProps;
    const { prevSections } = prevState;
    if (sections !== prevSections) {
      return {
        prevSections: sections,
        itemLayouts: generateItemLayouts(sections)
      };
    }

    return null;
  }

  private loadMoreData() {
    // This state trigger progress bar
    this.setState({
      isLoadingProgress: true
    });
    // Check if necessary show other data
    if (this.props.isContinuosScrollEnabled) {
      this.props.onMoreDataRequest();
    }
  }

  private renderSectionHeader = (info: { section: MessageAgendaSection }) => {
    const isFake = info.section.fake;
    return (
      <View style={styles.sectionHeaderWrapper}>
        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionHeaderText}>
            {startCase(
              format(
                info.section.title,
                I18n.t(
                  isFake
                    ? "global.dateFormats.monthYear"
                    : "global.dateFormats.weekdayDayMonthYear"
                )
              )
            )}
          </Text>
        </View>
      </View>
    );
  };

  private renderItem: SectionListRenderItem<
    MessageAgendaItem | FakeItem
  > = info => {
    if (isFakeItem(info.item)) {
      return FakeItemComponent;
    }

    const message = info.item.e1;
    const { isRead } = info.item.e2;
    const {
      paymentsByRptId,
      onPressItem,
      onLongPressItem,
      selectedMessageIds
    } = this.props;

    const potService = this.props.servicesById[message.sender_service_id];

    const service =
      potService !== undefined
        ? pot.isNone(potService)
          ? ({
              organization_name: I18n.t("messages.errorLoading.senderInfo"),
              department_name: I18n.t("messages.errorLoading.serviceInfo")
            } as ServicePublic)
          : pot.toUndefined(potService)
        : undefined;

    const payment =
      message.content.payment_data !== undefined && service !== undefined
        ? paymentsByRptId[
            `${service.organization_fiscal_code}${
              message.content.payment_data.notice_number
            }`
          ]
        : undefined;

    return (
      <MessageListItem
        isRead={isRead}
        message={message}
        service={service}
        payment={payment}
        onPress={onPressItem}
        onLongPress={onLongPressItem}
        isSelectionModeEnabled={selectedMessageIds.isSome()}
        isSelected={selectedMessageIds
          .map(_ => _.has(message.id))
          .getOrElse(false)}
      />
    );
  };

  private getItemLayout = (_: Sections | null, index: number) => {
    return this.state.itemLayouts[index];
  };

  // On scroll download more data
  private onScrollHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = e.nativeEvent.contentOffset.y;
    if (
      scrollPosition < 50 &&
      !this.state.isLoadingProgress &&
      this.props.isContinuosScrollEnabled
    ) {
      // Before call other items check if the last section is showed
      this.loadMoreData();
    }
  };

  public render() {
    const {
      sections,
      servicesById,
      paymentsByRptId,
      isContinuosScrollEnabled,
      lastDeadlineId
    } = this.props;
    const { isLoadingProgress } = this.state;

    const ListEmptyComponent = (
      <View style={styles.emptyListWrapper}>
        <ButtonDefaultOpacity
          block={true}
          primary={true}
          small={true}
          bordered={true}
          style={styles.button}
          onPress={this.loadMoreData}
        >
          <Text numberOfLines={1}>{I18n.t("reminders.loadMoreData")}</Text>
        </ButtonDefaultOpacity>
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

    // Show this component when the user has not deadlines
    const ListEmptySectionsComponent = (
      <View style={styles.emptyListWrapper}>
        <View spacer={true} large={true} />
        <Image
          source={require("../../../img/messages/empty-due-date-list-icon.png")}
        />
        <Text style={styles.emptyListContentTitle}>
          {I18n.t("messages.deadlines.emptyMessage.title")}
        </Text>
      </View>
    );

    return (
      <View
        style={{
          flex: 1,
          width: screenWidth
        }}
      >
        <SectionList
          // If we not have a final deadline then we not have deadlines
          sections={sections}
          extraData={{ servicesById, paymentsByRptId }}
          inverted={false}
          bounces={false}
          keyExtractor={keyExtractor}
          ref={this.sectionListRef}
          onScroll={this.onScrollHandler}
          renderItem={this.renderItem}
          renderSectionHeader={this.renderSectionHeader}
          ItemSeparatorComponent={ItemSeparatorComponent}
          getItemLayout={this.getItemLayout}
          ListHeaderComponent={
            !isContinuosScrollEnabled && this.noOtherDeadlines
          }
          ListFooterComponent={sections.length > 0 && <EdgeBorderComponent />}
          ListEmptyComponent={
            sections.length === 0 && lastDeadlineId.isNone()
              ? ListEmptySectionsComponent
              : ListEmptyComponent
          }
        />
        {isLoadingProgress &&
          isContinuosScrollEnabled && (
            <View style={styles.contentProgress}>
              <ActivityIndicator
                style={styles.progress}
                size="small"
                color={variables.brandDarkGray}
              />
            </View>
          )}
      </View>
    );
  }

  public noOtherDeadlines = () => {
    return (
      <View style={styles.messageNoOthers}>
        <Text bold={true}>{I18n.t("reminders.noOtherDeadlines")}</Text>
      </View>
    );
  };

  public scrollToLocation = (params: SectionListScrollParams) => {
    if (this.sectionListRef.current !== null) {
      this.sectionListRef.current.scrollToLocation(params);
    }
  };
}

export default MessageAgenda;
