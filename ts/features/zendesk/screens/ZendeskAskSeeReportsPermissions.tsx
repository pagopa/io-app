import { CompatNavigationProp } from "@react-navigation/compat";
import { constNull } from "fp-ts/lib/function";
import { ListItem, View } from "native-base";
import React, { ReactNode } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import EmailIcon from "../../../../img/assistance/email.svg";
import FiscalCodeIcon from "../../../../img/assistance/fiscalCode.svg";
import NameSurnameIcon from "../../../../img/assistance/nameSurname.svg";
import { H1 } from "../../../components/core/typography/H1";
import { H3 } from "../../../components/core/typography/H3";
import { H4 } from "../../../components/core/typography/H4";
import { H5 } from "../../../components/core/typography/H5";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../../store/reducers/profile";
import { ZendeskParamsList } from "../navigation/params";

export type ZendeskAskSeeReportsPermissionsNavigationParams = {
  assistanceForPayment: boolean;
};

/**
 * id is optional since some items should recognized since they can be removed from the whole list
 * i.e: items about profile || payment
 */
type Item = {
  id?: string;
  icon: ReactNode;
  title: string;
  value?: string;
  zendeskId?: string;
  testId: string;
};

type ItemProps = {
  fiscalCode: string;
  nameSurname: string;
  email: string;
};

const iconProps = { width: 24, height: 24 };

const getItems = (props: ItemProps): ReadonlyArray<Item> => [
  {
    id: "profileNameSurname",
    icon: <NameSurnameIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.nameSurname"),
    value: props.nameSurname,
    testId: "profileNameSurname"
  },
  {
    id: "profileFiscalCode",
    icon: <FiscalCodeIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.fiscalCode"),
    value: props.fiscalCode,
    testId: "profileFiscalCode"
  },
  {
    id: "profileEmail",
    icon: <EmailIcon {...iconProps} />,
    title: I18n.t("support.askPermissions.emailAddress"),
    value: props.email,
    testId: "profileEmail"
  }
];

const ItemComponent = (props: Item) => (
  <ListItem testID={props.testId}>
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center"
      }}
    >
      <View>{props.icon}</View>
      <View hspacer />
      <View style={{ flex: 1, flexDirection: "column" }}>
        <H4>{props.title}</H4>
        {props.value && <H5 weight={"Regular"}>{props.value}</H5>}
      </View>
    </View>
  </ListItem>
);

type Props = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<
      ZendeskParamsList,
      "ZENDESK_ASK_SEE_REPORTS_PERMISSIONS"
    >
  >;
};
/**
 * this screen shows the kinds of data the app could collect when a user is looking at the previous ticket only for the authenticated users
 * @constructor
 */
const ZendeskAskSeeReportsPermissions = (props: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const assistanceForPayment = props.navigation.getParam(
    "assistanceForPayment"
  );
  const notAvailable = I18n.t("global.remoteStates.notAvailable");
  const fiscalCode = useIOSelector(profileFiscalCodeSelector) ?? notAvailable;
  const nameSurname = useIOSelector(profileNameSurnameSelector) ?? notAvailable;
  const email = useIOSelector(profileEmailSelector).getOrElse(notAvailable);

  const itemsProps: ItemProps = {
    fiscalCode,
    nameSurname,
    email
  };

  const items = getItems(itemsProps)
    // remove these item whose have no value associated
    .filter(it => it.value !== notAvailable);

  const continueButtonProps = {
    testID: "continueButtonId",
    bordered: false,
    onPress: () => {
      navigation.navigate("ZENDESK_MAIN", {
        screen: "ZENDESK_SEE_REPORTS_ROUTERS",
        params: { assistanceForPayment }
      });
    },
    title: I18n.t("support.askPermissions.cta.allow")
  };

  return (
    <BaseScreenComponent
      showChat={false}
      goBack={true}
      // customRightIcon is needed to have a centered header title
      customRightIcon={{
        iconName: "",
        onPress: constNull
      }}
      headerTitle={I18n.t("support.askPermissions.header")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"ZendeskAskPermissions"}>
        <ScrollView>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <H1>{I18n.t("support.askPermissions.title")}</H1>
            <View spacer />
            <H4 weight={"Regular"}>{I18n.t("support.askPermissions.body")}</H4>
            <View spacer small={true} />
            <H3>{I18n.t("support.askPermissions.listHeader")}</H3>

            {items.map((item, idx) => (
              <ItemComponent key={`permission_item_${idx}`} {...item} />
            ))}
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskAskSeeReportsPermissions;
