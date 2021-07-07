import * as React from "react";
import { connect } from "react-redux";
import { Badge, View } from "native-base";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import { constNull } from "fp-ts/lib/function";
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
import { BaseTypography } from "../../../../components/core/typography/BaseTypography";
import { ServicesPreferencesModeEnum } from "../../../../../definitions/backend/ServicesPreferencesMode";

type Props = {
  onSelectMode: (mode: ServicesPreferencesModeEnum) => void;
  mode?: ServicesPreferencesModeEnum;
  showBadge?: boolean;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type ContactOption = {
  title: string;
  mode: ServicesPreferencesModeEnum;
  description1: string;
  description2?: string;
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    backgroundColor: IOColors.blue,
    height: 18
  }
});

const options = (): ReadonlyArray<ContactOption> => [
  {
    title: I18n.t("services.optIn.preferences.quickConfig.title"),
    mode: ServicesPreferencesModeEnum.AUTO,
    description1: I18n.t("services.optIn.preferences.quickConfig.body.text1"),
    description2: I18n.t("services.optIn.preferences.quickConfig.body.text2")
  },
  {
    title: I18n.t("services.optIn.preferences.manualConfig.title"),
    mode: ServicesPreferencesModeEnum.MANUAL,
    description1: I18n.t("services.optIn.preferences.manualConfig.body.text1")
  }
];

const ServicesContactComponent = (props: Props): React.ReactElement => {
  const renderListItem = ({ item }: ListRenderItemInfo<ContactOption>) => {
    const isSelected = item.mode === props.mode;
    return (
      <>
        <TouchableDefaultOpacity
          style={[
            IOStyles.row,
            {
              justifyContent: "space-between"
            }
          ]}
          accessibilityRole={"radio"}
          accessibilityState={{ checked: isSelected }}
          onPress={
            // do nothing if it is the current mode set
            isSelected ? constNull : () => props.onSelectMode(item.mode)
          }
        >
          <View style={IOStyles.flex}>
            {props.showBadge && item.mode === ServicesPreferencesModeEnum.AUTO && (
              <Badge style={[styles.badge]}>
                <BaseTypography
                  weight={"SemiBold"}
                  color={"white"}
                  style={{ fontSize: 12 }}
                >
                  {I18n.t("services.optIn.preferences.oldUsersBadge")}
                </BaseTypography>
              </Badge>
            )}
            <H4>{item.title}</H4>
            <H5 weight={"Regular"}>
              {item.description1}
              {item.description2 && <H5>{` ${item.description2}`}</H5>}
            </H5>
          </View>
          <View hspacer large />
          <IconFont
            name={isSelected ? "io-radio-on" : "io-radio-off"}
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
  };

  return (
    <>
      <H1>{I18n.t("services.optIn.preferences.title")}</H1>
      <View spacer small />
      <Body>{I18n.t("services.optIn.preferences.body")}</Body>
      <View spacer large />
      <FlatList
        style={{ flexGrow: 0 }}
        scrollEnabled={false}
        data={options()}
        renderItem={renderListItem}
        keyExtractor={o => o.mode}
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
