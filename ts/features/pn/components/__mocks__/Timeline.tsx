import { View } from "react-native";
import { TimelineProps } from "../Timeline";

export const Timeline = ({ data }: TimelineProps) => (
  <>
    {data.map((pieceOfData, index) => (
      <View key={index}>
        <View>{`Mock Timeline ${index}`}</View>
        <View>{pieceOfData.day}</View>
        <View>{pieceOfData.description}</View>
        <View>{pieceOfData.month}</View>
        <View>{pieceOfData.status}</View>
        <View>{pieceOfData.time}</View>
      </View>
    ))}
  </>
);
