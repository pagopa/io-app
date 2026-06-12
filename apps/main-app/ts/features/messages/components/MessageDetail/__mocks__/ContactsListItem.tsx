import { View } from "react-native";
import { ContactsListItemProps } from "../ContactsListItem";

export const ContactsListItem = ({ email, phone }: ContactsListItemProps) => (
  <>
    <View>Mock ContactsListItem</View>
    {email && <View>{email}</View>}
    {phone && <View>{phone}</View>}
  </>
);
