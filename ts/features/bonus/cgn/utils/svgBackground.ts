export type Point = {
  x: number;
  y: number;
};

const generateRandomNumberInRange = (max: number, min: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const generateRandomSvgMovement = (
  steps: number,
  pointA: Point,
  pointB: Point
): string => {
  if (steps > 0) {
    const fixedSteps = Math.floor(steps);
    const points: ReadonlyArray<Point> = [...new Array(fixedSteps)].map(_ => ({
      x: generateRandomNumberInRange(pointA.x, pointB.x),
      y: generateRandomNumberInRange(pointA.y, pointB.y)
    }));

    const pointsStringified = [
      ...points.map(p => `${p.x} ${p.y}`),
      `${points[0].x} ${points[0].y};`
    ];

    return pointsStringified.join(";");
  }
  return "";
};
