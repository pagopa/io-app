import * as React from "react";
import { useDispatch } from "react-redux";
import { H3 } from "../../../components/core/typography/H3";
import { WithTestID } from "../../../types/WithTestID";

type Props = WithTestID<{
  totalSeconds: number; // in seconds
  onExpiration: () => void;
}>;

const formattedTime = (time: number) => {
  const date = new Date(time * 1000);
  const minutes = date.getUTCMinutes();
  const seconds = date.getSeconds();
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const ConuntDown = (props: Props) => {
  const { totalSeconds: totalTime, onExpiration } = props;
  const [remainingTime, setRemainingTime] = React.useState(totalTime);

  const dispatch = useDispatch();

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingTime(prevRemainingTime =>
        prevRemainingTime > 0 ? prevRemainingTime - 1 : 0
      );
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  React.useEffect(() => {
    if (remainingTime === 0) {
      onExpiration();
    }
  }, [dispatch, onExpiration, remainingTime]);

  return (
    <>
      <H3 testID={props.testID}>{`${formattedTime(remainingTime)}`}</H3>
    </>
  );
};

export default ConuntDown;
