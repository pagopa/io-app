import { HSpacer, Icon, VSpacer } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import * as React from "react";
import { FlatList, ListRenderItemInfo, View } from "react-native";
import { connect } from "react-redux";
import { ServicesPreferencesModeEnum } from "../../../../../definitions/backend/ServicesPreferencesMode";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { IOBadge } from "../../../../components/core/IOBadge";
import { H4 } from "../../../../components/core/typography/H4";
import { H5 } from "../../../../components/core/typography/H5";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { Dispatch } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";

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
            {props.showBadge &&
              item.mode === ServicesPreferencesModeEnum.AUTO && (
                <IOBadge
                  small
                  variant="solid"
                  color="blue"
                  text={I18n.t("services.optIn.preferences.oldUsersBadge")}
                />
              )}
            <H4>{item.title}</H4>
            <H5 weight={"Regular"}>
              {item.description1}
              {item.description2 && <H5>{`\n${item.description2}`}</H5>}
            </H5>
          </View>
          <HSpacer size={24} />
          <View style={{ alignSelf: "flex-start" }}>
            <Icon
              name={isSelected ? "legRadioOn" : "legRadioOff"}
              color="blue"
              size={24}
            />
          </View>
        </TouchableDefaultOpacity>
        <VSpacer size={16} />
        <ItemSeparatorComponent noPadded />
        <VSpacer size={16} />
      </>
    );
  };

  return (
    <FlatList
      style={{ flexGrow: 0 }}
      scrollEnabled={false}
      data={options()}
      renderItem={renderListItem}
      keyExtractor={o => o.mode}
    />
  );
};

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesContactComponent);
