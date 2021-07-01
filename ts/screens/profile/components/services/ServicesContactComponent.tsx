import * as React from "react";
import { connect } from "react-redux";
import { View } from "native-base";
import { FlatList, ListRenderItemInfo } from "react-native";
import { useState } from "react";
import { GlobalState } from "../../../../store/reducers/types";
import { Dispatch } from "../../../../store/actions/types";
import { H1 } from "../../../../components/core/typography/H1";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H4 } from "../../../../components/core/typography/H4";
import IconFont from "../../../../components/ui/IconFont";
import { IOColors } from "../../../../components/core/variables/IOColors";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { H5 } from "../../../../components/core/typography/H5";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import I18n from "../../../../i18n";

type Props = {
  onSelectOption: (optionKey: string) => void;
  hasAlreadyOnboarded?: true;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type ContactOption = {
  title: string;
  key: string;
  description1: string;
  description2?: string;
};

const options: ReadonlyArray<ContactOption> = [
  {
    title: I18n.t("services.optIn.preferences.quickConfig.title"),
    key: "quick",
    description1: I18n.t("services.optIn.preferences.quickConfig.body.text1"),
    description2: I18n.t("services.optIn.preferences.quickConfig.body.text2")
  },
  {
    title: I18n.t("services.optIn.preferences.manualConfig.title"),
    key: "manual",
    description1: I18n.t("services.optIn.preferences.manualConfig.body.text1")
  }
];

const ServicesContactComponent = (props: Props): React.ReactElement => {
  const [selected, setSelected] = useState<string | undefined>();

  const renderListItem = ({ item }: ListRenderItemInfo<ContactOption>) => (
    <>
      <TouchableDefaultOpacity
        style={[
          IOStyles.row,
          {
            justifyContent: "space-between"
          }
        ]}
        onPress={() => {
          setSelected(item.key);
          props.onSelectOption(item.key);
        }}
      >
        <View style={IOStyles.flex}>
          <H4>{item.title}</H4>
          <H5 weight={"Regular"}>
            {item.description1}
            {item.description2 && <H5>{` ${item.description2}`}</H5>}
          </H5>
        </View>
        <View hspacer large />
        <IconFont
          name={selected === item.key ? "io-radio-on" : "io-radio-off"}
          color={IOColors.blue}
          size={28}
          style={{ alignSelf: "flex-start" }}
        />
      </TouchableDefaultOpacity>
      <View spacer />
      <ItemSeparatorComponent noPadded />
      <View spacer />
    </>
  );

  return (
    <>
      <H1>{I18n.t("services.optIn.preferences.title")}</H1>
      <View spacer small />
      <Body>{I18n.t("services.optIn.preferences.body")}</Body>
      <View spacer large />
      <FlatList
        style={{ flexGrow: 0 }}
        scrollEnabled={false}
        data={options}
        renderItem={renderListItem}
        keyExtractor={o => o.key}
      />
    </>
  );
};

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesContactComponent);
