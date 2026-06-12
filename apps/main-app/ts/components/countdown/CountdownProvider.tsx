import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode
} from "react";
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

  const startTimer = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isRunningTimer.current = true;
    BackgroundTimer.runBackgroundTimer(() => {
      setTimerCount(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
    }, intervalDuration);
  }, [intervalDuration]);

  const resetTimer = useCallback(() => {
    setTimerCount(timerTiming);
    BackgroundTimer.stopBackgroundTimer();
    // eslint-disable-next-line functional/immutable-data
    isRunningTimer.current = false;
  }, [timerTiming]);

  const isRunning = useCallback(() => isRunningTimer.current, []);

  const contextValue = useMemo(
    () => ({ timerCount, resetTimer, startTimer, isRunning }),
    [timerCount, resetTimer, startTimer, isRunning]
  );

  return (
    <CountdownContext.Provider value={contextValue}>
      {children}
    </CountdownContext.Provider>
  );
};

// Hook to use the countdown context
export const useCountdown = () => useContext(CountdownContext);
