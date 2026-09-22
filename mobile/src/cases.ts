// Only the offline build imports answer keys into the application bundle.
// The website keeps its server-only registry and its server-validated scoring.
import { clockmaker } from "../../data/cases/clockmaker";
import { clockmakerSolution } from "../../data/cases/solutions";
import { additionalEpisodes } from "../../data/cases/episodes";
import { archiveEpisodes } from "../../data/cases/archive";
import { easyEpisodes } from "../../data/cases/easy";
export const offlineCases = [
  { case: clockmaker, solution: clockmakerSolution },
  ...additionalEpisodes,
  ...archiveEpisodes,
  ...easyEpisodes,
];
export const offlineCase = (id: string) =>
  offlineCases.find((e) => e.case.id === id);
