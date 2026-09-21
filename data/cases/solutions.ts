// SERVER ONLY: imported exclusively by the server engine and offline tests.
import type { SecretSolution } from "@/types/game";
export const clockmakerSolution: SecretSolution = {
  answers: {
    culprit: "Leon Rook",
    motive: "To stop tomorrow’s disclosure of provenance fraud",
    method: "The killer pulled the spring-latched door shut after a fatal blow",
    clock: "Its minute hand was mounted incorrectly during maintenance",
    watch: "It left in the insured collection before the crime",
    alibi: "The internal call, post-20:38 print, and verified 20:44 exit",
  },
  deductions: {
    time: "20:38, the courier camera’s timestamp",
    lock: "Pull the spring-latched door shut",
    watch: "It had already been collected legitimately",
    voice: "No, it was the answering-machine greeting",
    return: "Leon returned: his face and fresh print corroborate the log",
    motive: "Exposure of Leon’s false provenance certificates",
  },
  contradictions: [
    {
      id: "call",
      pair: ["leon-alibi", "phone"],
      explanation:
        "Leon says he called from the bridge. Routing places the call at the workshop extension.",
    },
    {
      id: "return",
      pair: ["leon-alibi", "camera"],
      explanation:
        "Verified 20:44 footage shows Leon leaving long after his claimed final departure.",
    },
    {
      id: "voice",
      pair: ["ivy-alibi", "audio"],
      explanation:
        "The voice was an answering-machine recording, so Ivy’s inference of a live conversation is unreliable.",
    },
  ],
  timelineOrder: ["t-parcel", "t-call", "t-entry", "t-alive", "t-exit"],
  proof: ["ledger", "spill", "camera", "tool"],
  hints: [
    "A time displayed by an object is not necessarily the time of the event. Find an independent clock.",
    "The delivery receipt leads to evidence that changes the death window. Analyze it, then revisit the alibis.",
    "Compare Leon’s first answer with the phone report and pharmacy footage. The fresh palm print defeats his earlier-visit explanation.",
  ],
  explanation: [
    {
      title: "The culprit",
      text: "Leon Rook killed Elias. The courier’s 20:38 image shows Elias alive and the varnish unmarked; Leon’s palm print was therefore made after that time. Verified footage shows him leaving at 20:44 with the crescent tool. Elias’s blood inside that tool connects his presence to the fatal blow.",
    },
    {
      title: "The motive",
      text: "Elias’s audit traced false provenance certificates to Leon. The original invoices were due at the insurers the next morning. Leon attempted to prevent exposure; he did not know that copies were already held in escrow.",
    },
    {
      title: "The locked room",
      text: "There was no impossible escape. The spring latch engaged when Leon pulled the door shut. The interior thumb-turn had led witnesses to assume it required someone inside. The undamaged windows needed no explanation.",
    },
    {
      title: "The real chronology",
      text: "20:12: Oscar’s watch was collected. 20:30: Leon called from the front-room extension, creating a misleading account record. 20:36: his token opened the courtyard entrance. 20:38: Elias was photographed alive. Between 20:38 and 20:44: Leon confronted and struck him. 20:44: Leon left with the tool. 21:05: police discovered the body.",
    },
    {
      title: "The wrong time",
      text: "The clock’s minute hand had been remounted seven minutes behind. Mara’s account and the courier’s synchronized photograph independently support this. The 20:40 voice was a recorded greeting, not evidence of survival.",
    },
    {
      title: "The misleading evidence",
      text: "Oscar’s watch was sealed in a legitimate parcel; his cuff carried his own blood. Mara’s threatening letter was outdated and continuous scanner images supported her alibi. Ivy hid unauthorized prototype work, explaining the filings. None of those secrets explains Leon’s fresh print, exit footage, or bloodstained tool.",
    },
  ],
};
