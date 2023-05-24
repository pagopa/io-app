import * as React from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { H5 } from "../core/typography/H5";
import { H4 } from "../core/typography/H4";
import { IOColors } from "../core/variables/IOColors";
import { formatDateAsLocal } from "../../utils/dates";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import I18n from "../../i18n";
import { VSpacer } from "../core/spacer/Spacer";
import { Icon } from "../core/icons";

type Props = {
  date: Date | undefined;
  onConfirm: (date: Date) => void;
  label?: string;
  minimumDate?: Date;
  blocked?: boolean;
};

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, borderColor: IOColors.bluegreyLight },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

const DateTimePicker: React.FunctionComponent<Props> = (props: Props) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const onConfirm = (date: Date) => {
    props.onConfirm(date);
    setShowModal(false);
  };

  const onDismiss = () => setShowModal(false);

  const onPress = () => {
    if (props.blocked !== true) {
      setShowModal(true);
    }
  };

  return (
    <View style={styles.container}>
      {props.label && <H5 color={"bluegreyDark"}>{props.label}</H5>}
      <VSpacer size={16} />
      <TouchableDefaultOpacity style={styles.inputContainer} onPress={onPress}>
        <H4
          weight={"Regular"}
          color={props.date ? "bluegrey" : "bluegreyLight"}
        >
          {props.date
            ? formatDateAsLocal(props.date, true, true)
            : I18n.t("global.dateFormats.dateTimePicker")}
        </H4>
        <Icon
          size={24}
          color={props.blocked !== true ? "blue" : "bluegreyLight"}
          name="calendar"
        />
      </TouchableDefaultOpacity>

      <DateTimePickerModal
        minimumDate={props.minimumDate ?? new Date()}
        isVisible={showModal}
        mode="date"
        onConfirm={onConfirm}
        onCancel={onDismiss}
      />
    </View>
  );
};

export default DateTimePicker;
