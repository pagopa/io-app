import { format } from "date-fns";
import { Text, View } from "native-base";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import customVariables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";

const styles = StyleSheet.create({
  container: {
    padding: customVariables.contentPadding,
    flexDirection: "row"
  },
  subject: {
    flex: 1
  },
  hour: {
    flex: 0
  }
});

type Props = {
  id: string;
  subject: string;
  due_date: NonNullable<MessageWithContentPO["content"]["due_date"]>;
  onPress: (id: string) => void;
};

/**
 * A component to render a single Agenda item.
 * Extends PureComponent to avoid unnecessary re-renders.
 */
class MessageAgendaItem extends React.PureComponent<Props> {
  public render() {
    const { subject, due_date } = this.props;

    return (
      <TouchableOpacity onPress={this.handlePress}>
        <View style={styles.container}>
          <Text style={styles.subject}>{subject}</Text>
          <Text style={styles.hour}>{format(due_date, "HH:mm")}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  private handlePress = () => this.props.onPress(this.props.id);
}

export default MessageAgendaItem;
