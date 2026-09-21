export const RANKS = [
  "Rookie Investigator",
  "Junior Detective",
  "Detective",
  "Senior Detective",
  "Lead Investigator",
  "Inspector",
  "Chief Inspector",
  "Master Detective",
  "Elite Investigator",
  "Legendary Detective",
].map((name, i) => ({
  name,
  xp: [0, 500, 1500, 3000, 5000, 8000, 14000, 25000, 45000, 80000][i],
}));
export const rankFor = (xp: number) =>
  [...RANKS].reverse().find((r) => xp >= r.xp)!.name;
export const ACHIEVEMENTS = [
  {
    id: "first",
    name: "First case",
    description: "Solve your first investigation.",
  },
  {
    id: "perfect",
    name: "Perfect detective",
    description: "Earn a perfect investigation score.",
  },
  {
    id: "unaided",
    name: "No help needed",
    description: "Solve a case without hints.",
  },
  {
    id: "evidence",
    name: "Evidence hunter",
    description: "Find every evidence item in a solved case.",
  },
  {
    id: "contradictions",
    name: "Human lie detector",
    description: "Identify 25 contradictions.",
  },
  {
    id: "cold",
    name: "Cold case specialist",
    description: "Solve 10 cold cases.",
  },
  { id: "master", name: "Master investigator", description: "Solve 50 cases." },
  {
    id: "legend",
    name: "Legendary detective",
    description: "Solve all 100 cases.",
  },
];
