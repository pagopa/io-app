import * as React from "react";
import { useDispatch } from "react-redux";
import { Action } from "typesafe-actions";
import { H3 } from "../../../components/core/typography/H3";

type Props = {
  totalSeconds: number; // in seconds
  actionToDispatchWhenExpired: Action;
};

const formattedTime = (time: number) => {
  const date = new Date(time * 1000);
  const minutes = date.getUTCMinutes();
  const seconds = date.getSeconds();
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const ConuntDown = (props: Props) => {
  const { totalSeconds: totalTime, actionToDispatchWhenExpired } = props;
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
      dispatch(actionToDispatchWhenExpired);
    }
  }, [actionToDispatchWhenExpired, dispatch, remainingTime]);

  return (
    <>
      <H3>{`${formattedTime(remainingTime)}`}</H3>
    </>
  );
};

export default ConuntDown;
