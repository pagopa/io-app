import { createContext, useContext, useState, ReactNode, useRef } from "react";
import BackgroundTimer from "react-native-background-timer";

type CountdownContextType = {
  timerCount: number;
  resetTimer?: () => void;
  startTimer?: () => void;
  isRunning?: () => boolean;
};

const CountdownContext = createContext<CountdownContextType>({ timerCount: 0 });

// Props type for the provider component
interface CountdownProviderProps {
  children: ReactNode;
  timerTiming: number;
  intervalDuration: number;
}

export const CountdownProvider = (props: CountdownProviderProps) => {
  const { children, timerTiming, intervalDuration } = props;
  const [timerCount, setTimerCount] = useState<number>(timerTiming);
  const isRunningTimer = useRef<boolean>(false);

  const startTimer = () => {
    // eslint-disable-next-line functional/immutable-data
    isRunningTimer.current = true;
    BackgroundTimer.runBackgroundTimer(() => {
      setTimerCount(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
    }, intervalDuration);
  };

  const resetTimer = () => {
    setTimerCount(timerTiming);
    BackgroundTimer.stopBackgroundTimer();
    // eslint-disable-next-line functional/immutable-data
    isRunningTimer.current = false;
  };

  const isRunning = () => isRunningTimer.current;

  return (
    <CountdownContext.Provider
      value={{ timerCount, resetTimer, startTimer, isRunning }}
    >
      {children}
    </CountdownContext.Provider>
  );
};

// Hook to use the countdown context
export const useCountdown = () => useContext(CountdownContext);
