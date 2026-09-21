import "server-only";
import { clockmaker } from "./cases/clockmaker";
import { clockmakerSolution } from "./cases/solutions";
import { additionalEpisodes } from "./cases/episodes";
export const cases = [
  { case: clockmaker, solution: clockmakerSolution },
  ...additionalEpisodes,
];
export const getCase = (id: string) => cases.find((c) => c.case.id === id);
