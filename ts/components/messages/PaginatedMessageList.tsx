import { Millisecond } from "@pagopa/ts-commons/lib/units";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import { pageSize } from "../../config";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { useActionOnFocus } from "../../utils/hooks/useOnFocus";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import MessageList from "./MessageList";
import { renderEmptyList } from "./MessageList/helpers";

const styles = StyleSheet.create({
  activityIndicator: {
    padding: 12
  }
});

type OwnProps = {
  isSome: boolean;
  isError: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  nextCursor?: string;
  previousCursor?: string;
  refresh: () => void;
  fetchNextPage: () => void;
  fetchPreviousPage: (cursor: string) => void;
};

type Props = OwnProps & React.ComponentProps<typeof MessageList>;

const Loader = () => (
  <ActivityIndicator
    animating={true}
    size={"large"}
    style={styles.activityIndicator}
    color={customVariables.brandPrimary}
    accessible={true}
    accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
    accessibilityLabel={I18n.t("global.accessibility.activityIndicator.label")}
    importantForAccessibility={"no-hide-descendants"}
    testID={"activityIndicator"}
  />
);

// Do not refresh again automatically before minimumRefreshInterval has passed
const minimumRefreshInterval = 60000 as Millisecond; // 1 minute

/**
 * A component to load more data dynamically (infinite list)
 */
const PaginatedMessageList = ({
  ListEmptyComponent,
  isSome,
  isError,
  isLoading,
  isRefreshing = false,
  refresh,
  fetchNextPage,
  fetchPreviousPage,
  previousCursor,
  ...rest
}: Props) => {
  const [isRefreshFromUser, setIsRefreshFromUser] = useState(false);

  useActionOnFocus(() => {
    // check if there are new messages when the component becomes focused
    if (previousCursor) {
      fetchPreviousPage(previousCursor);
    }
  }, minimumRefreshInterval);

  useEffect(() => {
    if (!isRefreshing && isRefreshFromUser) {
      setIsRefreshFromUser(false);
    }
  }, [isRefreshing, isRefreshFromUser]);

  const refreshControl = (
    <RefreshControl
      refreshing={isRefreshFromUser || isRefreshing}
      onRefresh={() => {
        setIsRefreshFromUser(true);
        refresh();
      }}
    />
  );

  const renderListFooter = () => {
    if (isLoading) {
      return <Loader />;
    }
    return <EdgeBorderComponent />;
  };

  return (
    <MessageList
      {...rest}
      initialNumToRender={pageSize}
      refreshControl={refreshControl}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.25}
      ListFooterComponent={renderListFooter}
      ListEmptyComponent={renderEmptyList({
        isError,
        EmptyComponent: isSome ? ListEmptyComponent : null
      })}
    />
  );
};

export default PaginatedMessageList;
