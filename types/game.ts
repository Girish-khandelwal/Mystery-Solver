export type Difficulty =
  "Hard" | "Very Hard" | "Expert" | "Master Detective" | "Legendary";
export type EvidenceType =
  "Physical" | "Digital" | "Documents" | "Forensic" | "Witness";
export interface CaseMeta {
  id: string;
  caseNumber: number;
  title: string;
  subtitle: string;
  category: string;
  difficulty: Difficulty;
  coverImage: string;
  introduction: string;
  duration: string;
  contentStatus: "playable" | "outline";
  outline?: {
    premise: string;
    setting: string;
    reasoning: string;
    complication: string;
  };
}
export interface Location {
  id: string;
  name: string;
  description: string;
  image: string;
  requires?: string[];
  deductionRequired?: string;
  hotspots: { evidenceId: string; label: string; x: number; y: number }[];
}
export interface Evidence {
  id: string;
  name: string;
  type: EvidenceType;
  locationId: string;
  image: string;
  description: string;
  analysis?: string;
  relatedSuspects: string[];
}
export interface Question {
  id: string;
  prompt: string;
  answer: string;
  requires?: string[];
  contradiction?: string;
}
export interface Suspect {
  id: string;
  name: string;
  age: number;
  occupation: string;
  relationship: string;
  personality: string;
  background: string;
  motive: string;
  alibi: string;
  avatar: string;
  questions: Question[];
}
export interface Witness {
  id: string;
  name: string;
  statement: string;
  reliability: string;
  requires?: string[];
}
export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  requires: string[];
}
export interface Deduction {
  id: string;
  question: string;
  requires: string[];
  options: string[];
}
export interface FinalQuestion {
  id: string;
  question: string;
  options: string[];
}
export interface MysteryCase extends CaseMeta {
  date: string;
  setting: string;
  briefing: string;
  knownFacts: string[];
  locations: Location[];
  suspects: Suspect[];
  evidence: Evidence[];
  witnesses: Witness[];
  timeline: TimelineEvent[];
  deductions: Deduction[];
  finalQuestions: FinalQuestion[];
}
export interface SecretSolution {
  answers: Record<string, string>;
  deductions: Record<string, string>;
  contradictions: { id: string; pair: [string, string]; explanation: string }[];
  timelineOrder: string[];
  proof: string[];
  hints: string[];
  explanation: { title: string; text: string }[];
}
export interface GameState {
  discovered: string[];
  analyzed: string[];
  visited: string[];
  interviews: string[];
  deductions: string[];
  contradictions: string[];
  connections: [string, string][];
  timeline: string[];
  timelineCorrect: boolean;
  notes: { id: string; text: string }[];
  pins: string[];
  hints: string[];
  wrongDeductions: number;
  wrongAccusations: number;
  elapsed: number;
  solved: boolean;
  report?: CaseReport;
}
export interface CaseReport {
  solved: boolean;
  score: number;
  accuracy: number;
  grade: string;
  evidenceFound: number;
  evidenceTotal: number;
  contradictionsFound: number;
  contradictionsTotal: number;
  hints: number;
  wrongDeductions: number;
  wrongAccusations: number;
  explanation: { title: string; text: string }[];
  previousRank: string;
  rank: string;
}
export interface GamePayload {
  case: MysteryCase;
  state: GameState;
  version: number;
  feedback?: string;
}
export interface ProfileData {
  username: string;
  xp: number;
  rank: string;
  nextRank: { name: string; xp: number } | null;
  solved: number;
  attempted: number;
  accuracy: number;
  evidence: number;
  hints: number;
  time: number;
  perfect: number;
  favorite: string;
  achievements: string[];
  progress: {
    caseId: string;
    status: string;
    updatedAt: string;
    score: number | null;
  }[];
}
