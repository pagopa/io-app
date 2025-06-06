import { View, StyleSheet } from "react-native";
import {
  IconButton,
  IOVisualCostants,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";

type Props = {
  title: string;
  subtitle: string;
  listItems: Array<ListItemInfo>;
  listItemHeaderLabel: string;
  actions: IOScrollViewActions;
  onClose: () => void;
};

export const ItwPermissionsWizard = ({
  title,
  subtitle,
  listItems,
  actions,
  listItemHeaderLabel,
  onClose
}: Props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <IconButton
        color="neutral"
        icon="closeLarge"
        onPress={onClose}
        accessibilityLabel={I18n.t("global.buttons.close")}
      />
    </View>
    <IOScrollViewWithListItems
      title={title}
      subtitle={subtitle}
      listItemHeaderLabel={listItemHeaderLabel}
      renderItems={listItems}
      actions={actions}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingVertical: 16
  }
});
