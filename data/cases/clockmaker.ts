import type { MysteryCase, Evidence, Suspect } from "@/types/game";
const evidence = (
  id: string,
  name: string,
  type: Evidence["type"],
  locationId: string,
  description: string,
  analysis: string,
  relatedSuspects: string[] = [],
): Evidence => ({
  id,
  name,
  type,
  locationId,
  description,
  analysis,
  relatedSuspects,
  image: "/cases/evidence.svg",
});
const suspects: Suspect[] = [
  {
    id: "mara",
    name: "Mara Voss",
    age: 34,
    occupation: "Conservation engineer",
    relationship: "Elias’s daughter",
    personality: "Precise, guarded, exhausted.",
    background:
      "Left the family business after a bitter argument about selling the workshop.",
    motive: "Elias had threatened to change his will.",
    alibi: "At the municipal archive from 20:20 until 21:00.",
    avatar: "/cases/portrait.svg",
    questions: [
      {
        id: "mara-alibi",
        prompt: "Tell me about your evening.",
        answer:
          "The archive scanner records every page. I was there until nine. I did argue with him, but he was alive when I left at eight.",
      },
      {
        id: "mara-will",
        prompt: "Why were you cut out of the will?",
        requires: ["letter"],
        answer:
          "I wanted him to retire. The letter is six months old. We reconciled last week. Check the draft at his solicitor’s.",
      },
      {
        id: "mara-clock",
        prompt: "Did you touch the wall clock?",
        requires: ["clock"],
        answer:
          "At 19:55 I noticed it was seven minutes slow. Father said he had removed the minute hand to clean it and mounted it incorrectly. It kept running.",
      },
    ],
  },
  {
    id: "leon",
    name: "Leon Rook",
    age: 46,
    occupation: "Antique dealer",
    relationship: "Elias’s business partner",
    personality: "Affable until his accounts are mentioned.",
    background:
      "Brokered the Voss provenance certificates for private collectors.",
    motive: "Elias was examining irregularities in their joint sales.",
    alibi: "Already away on an outgoing call at 20:30; says he never returned.",
    avatar: "/cases/portrait.svg",
    questions: [
      {
        id: "leon-alibi",
        prompt: "When did you leave the workshop?",
        answer:
          "By half past eight. I rang Elias from the bridge and drove home. I did not go back.",
      },
      {
        id: "leon-call",
        prompt: "Explain the 20:30 call.",
        requires: ["phone"],
        answer:
          "I used my mobile on the bridge. He sounded quite normal. That proves I was outside.",
        contradiction: "call",
      },
      {
        id: "leon-access",
        prompt: "Why is your token in the courtyard log?",
        requires: ["access"],
        answer: "I must have dropped it. Anyone could have picked it up.",
      },
      {
        id: "leon-print",
        prompt: "Explain the fresh print in the spill.",
        requires: ["spill"],
        answer:
          "I checked the bench briefly after the call. It was before anything happened. You cannot establish otherwise.",
      },
      {
        id: "leon-ledger",
        prompt: "What was Elias sending to the insurers?",
        requires: ["ledger"],
        answer:
          "An incomplete audit. Old mistakes, exaggerated by a man who no longer understood the market.",
      },
    ],
  },
  {
    id: "ivy",
    name: "Ivy Chen",
    age: 27,
    occupation: "Clockmaking apprentice",
    relationship: "Elias’s employee",
    personality: "Anxious, observant, protective of her work.",
    background:
      "Used scrap material at night to make her own prototypes without permission.",
    motive: "Feared dismissal over missing materials.",
    alibi: "In the front repair room until 20:45, then at the tram stop.",
    avatar: "/cases/portrait.svg",
    questions: [
      {
        id: "ivy-alibi",
        prompt: "Did you hear Elias after 20:30?",
        answer:
          "At about twenty to nine, I heard his recorded clock-identification message. I assumed he was still talking to a customer.",
      },
      {
        id: "ivy-filings",
        prompt: "What are the unusual metal filings?",
        requires: ["filings"],
        answer:
          "Nickel silver from my escapement prototype. I hid it because I was using his stock. It was not a tool for opening a door.",
      },
      {
        id: "ivy-latch",
        prompt: "How does the workshop lock work?",
        requires: ["latch"],
        answer:
          "It is a spring latch. Pull the door shut and it locks. The inside thumb-turn retracts it; it does not have to be turned to lock it.",
      },
    ],
  },
  {
    id: "oscar",
    name: "Oscar Vale",
    age: 58,
    occupation: "Private collector",
    relationship: "Owner of the missing watch",
    personality: "Proud and combative.",
    background:
      "Had accused Elias of substituting a replica during restoration.",
    motive: "Believed Elias had damaged an irreplaceable heirloom.",
    alibi: "Dining with a curator after 20:10.",
    avatar: "/cases/portrait.svg",
    questions: [
      {
        id: "oscar-alibi",
        prompt: "Why were you arguing with Elias?",
        answer:
          "I thought he had swapped my watch. I shouted. Then the curator showed me the restoration photographs and I apologized.",
      },
      {
        id: "oscar-watch",
        prompt: "Did you take the pocket watch?",
        requires: ["receipt"],
        answer:
          "I arranged insured collection. The courier collected it at 20:12. Elias signed the seal in front of me.",
      },
      {
        id: "oscar-blood",
        prompt: "Why was there blood on your cuff?",
        requires: ["cuff"],
        answer:
          "I cut my finger on a broken tumbler at dinner. The restaurant has the first-aid entry.",
      },
    ],
  },
];
export const clockmaker: MysteryCase = {
  id: "001",
  caseNumber: 1,
  title: "The Clockmaker’s Last Hour",
  subtitle: "Some secrets are only a matter of time.",
  category: "Locked Room",
  difficulty: "Hard",
  coverImage: "/cases/workshop.svg",
  duration: "40–60 min",
  contentStatus: "playable",
  date: "14 November 1998",
  setting: "Voss & Son · Old Quarter",
  introduction:
    "A locked workshop. A missing heirloom. A clock that refuses to tell the truth.",
  briefing:
    "At 21:05, a patrol officer forced open the workshop of renowned clockmaker Elias Voss. He was dead beside his bench, the door apparently secured from inside and the windows closed. An empty velvet recess suggested a valuable pocket watch had been stolen. Four people confronted him that evening. Establish what happened using independent records: the workshop clock and the witnesses may be wrong.",
  knownFacts: [
    "Elias was found at 21:05; the medical window is initially 20:20–20:55.",
    "The workshop windows are sealed and undamaged.",
    "The missing watch belongs to collector Oscar Vale.",
    "The building has a front repair room and a separate courtyard entrance.",
  ],
  suspects,
  locations: [
    {
      id: "workshop",
      name: "The workshop",
      description:
        "The air smells of oil and old brass. A wall clock ticks above the motionless workbench.",
      image: "/cases/workshop.svg",
      hotspots: [
        { evidenceId: "clock", label: "Examine wall clock", x: 68, y: 25 },
        { evidenceId: "latch", label: "Examine door", x: 17, y: 43 },
        { evidenceId: "filings", label: "Inspect workbench", x: 47, y: 66 },
        { evidenceId: "spill", label: "Inspect varnish spill", x: 72, y: 75 },
        {
          evidenceId: "autopsy",
          label: "Read medical examiner’s report",
          x: 36,
          y: 82,
        },
      ],
    },
    {
      id: "office",
      name: "Elias’s office",
      description:
        "A narrow room above the shop. Letters and an unfinished audit occupy the desk.",
      image: "/cases/archive.svg",
      hotspots: [
        {
          evidenceId: "letter",
          label: "Open family correspondence",
          x: 24,
          y: 52,
        },
        { evidenceId: "ledger", label: "Read the audit", x: 55, y: 65 },
        { evidenceId: "phone", label: "Request phone records", x: 77, y: 40 },
        { evidenceId: "receipt", label: "Read delivery receipt", x: 43, y: 80 },
      ],
    },
    {
      id: "courtyard",
      name: "Service courtyard",
      description:
        "Rain on cobblestones. The access reader and the pharmacy opposite keep different kinds of records.",
      image: "/cases/street.svg",
      hotspots: [
        { evidenceId: "access", label: "Inspect access reader", x: 25, y: 42 },
        {
          evidenceId: "camera",
          label: "Obtain pharmacy footage",
          x: 73,
          y: 30,
        },
        { evidenceId: "audio", label: "Check answering machine", x: 48, y: 66 },
      ],
    },
    {
      id: "depot",
      name: "Courier depot",
      description:
        "Insured deliveries are sealed, weighed and recorded at this sorting counter.",
      image: "/cases/archive.svg",
      requires: ["receipt"],
      hotspots: [
        {
          evidenceId: "parcel",
          label: "Inspect sealed parcel record",
          x: 50,
          y: 59,
        },
        { evidenceId: "route", label: "Check courier route", x: 77, y: 73 },
      ],
    },
    {
      id: "lab",
      name: "Forensic laboratory",
      description:
        "Independent comparisons can distinguish a real link from an alarming coincidence.",
      image: "/cases/evidence.svg",
      deductionRequired: "time",
      hotspots: [
        { evidenceId: "cuff", label: "Read cuff comparison", x: 32, y: 58 },
        { evidenceId: "tool", label: "Inspect recovered tool", x: 70, y: 62 },
      ],
    },
  ],
  evidence: [
    evidence(
      "clock",
      "The slow wall clock",
      "Physical",
      "workshop",
      "The clock reads 20:31 in a photograph taken as the courier passed the window.",
      "Its rate is accurate, but its minute hand is mounted seven minutes behind true time. The courier’s time-synchronized camera recorded the photograph at 20:38. It was not stopped during the assault.",
    ),
    evidence(
      "latch",
      "Spring-latch assembly",
      "Physical",
      "workshop",
      "The door was locked when police arrived. The thumb-turn is on the inside.",
      "A bench test confirms the door locks whenever it is pulled shut. No key or interior manipulation is needed. There is no deadbolt.",
    ),
    evidence(
      "filings",
      "Silver-colored filings",
      "Forensic",
      "workshop",
      "Unusual pale shavings lie beside the door.",
      "Nickel-silver shavings match Ivy’s unfinished escapement, not the brass lock. They are under a layer of settled oil and predate the evening.",
      ["ivy"],
    ),
    evidence(
      "spill",
      "Print in fresh varnish",
      "Forensic",
      "workshop",
      "A palm impression crosses a fresh puddle of blue conservation varnish.",
      "The print belongs to Leon. The sealed 20:34 automatic bench photo shows no spill; the courier’s 20:38 image shows a spill and no handprint yet. A print could only have been left after 20:38.",
      ["leon"],
    ),
    evidence(
      "autopsy",
      "Medical examiner’s findings",
      "Forensic",
      "workshop",
      "Elias died from a single impact to the back of his head.",
      "No poison or defensive wounds. Death was rapid. Medical estimation alone cannot narrow the 20:20–20:55 window. The wound has a distinct crescent edge.",
    ),
    evidence(
      "letter",
      "An unsigned will amendment",
      "Documents",
      "office",
      "Elias threatens to disinherit Mara in an angry letter.",
      "Dated six months earlier. A solicitor’s attached memo from yesterday records that father and daughter reconciled and no amendment was executed.",
      ["mara"],
    ),
    evidence(
      "ledger",
      "Provenance audit",
      "Documents",
      "office",
      "A report records duplicate serial numbers on antique watches sold through Rook & Voss.",
      "Signed invoices trace all disputed certificates to Leon. A dated covering letter says Elias will deliver originals to the insurers at 09:00 tomorrow. Copies are already in escrow.",
      ["leon"],
    ),
    evidence(
      "phone",
      "Telephone routing report",
      "Digital",
      "office",
      "An outgoing call to Elias is listed at 20:30 under Leon’s business account.",
      "It originated from the workshop front-room extension, not a mobile. The billing label names the account holder, not the caller’s location. The call lasted 41 seconds.",
      ["leon"],
    ),
    evidence(
      "receipt",
      "Insured collection receipt",
      "Documents",
      "office",
      "A courier receipt refers to parcel V-184, collected at 20:12.",
      "Elias and Oscar signed an intact numbered seal; the described object is the supposedly missing pocket watch.",
      ["oscar"],
    ),
    evidence(
      "access",
      "Courtyard token log",
      "Digital",
      "courtyard",
      "Leon’s personal token opened the courtyard door at 20:36.",
      "The access clock is synchronized. Tokens are not biometric proof, but no loss was reported before police asked about this entry.",
      ["leon"],
    ),
    evidence(
      "camera",
      "Pharmacy CCTV sequence",
      "Digital",
      "courtyard",
      "Mara is visible leaving at 20:03; Oscar at 20:10. A coat obscures the 20:36 entrant.",
      "At 20:44, Leon’s face is visible as he exits, carrying a crescent-shaped case tool. The pharmacy time matches its 20:40 bank authorization to within one second.",
      ["leon"],
    ),
    evidence(
      "audio",
      "A voice after closing",
      "Digital",
      "courtyard",
      "Ivy heard Elias speaking at around 20:40.",
      "The shop answering machine plays Elias’s stock greeting on the front-room speaker. Its incoming log records an unanswered call at 20:40. It does not establish he was alive then.",
    ),
    evidence(
      "parcel",
      "Parcel V-184",
      "Physical",
      "depot",
      "The insured package is still sealed.",
      "The dispatch scan and scale match the intake record. A witnessed opening reveals Oscar’s genuine pocket watch with the same serial number as the restoration photographs.",
      ["oscar"],
    ),
    evidence(
      "route",
      "Courier’s camera roll",
      "Digital",
      "depot",
      "The courier passed the workshop again after a failed delivery nearby.",
      "Unedited images at 20:38 show Elias upright beside the varnish spill, with the slow clock reading 20:31. This establishes that he was alive seven minutes later than the clock suggests.",
    ),
    evidence(
      "cuff",
      "Oscar’s stained cuff",
      "Forensic",
      "lab",
      "A dark stain marks Oscar’s sleeve.",
      "The blood is Oscar’s, not Elias’s. The restaurant incident book records a cut at 20:22, supported by camera footage.",
      ["oscar"],
    ),
    evidence(
      "tool",
      "Crescent case opener",
      "Forensic",
      "lab",
      "Police recovered a tool from Leon’s car after obtaining a warrant.",
      "Elias’s blood is inside the crescent edge; the tool matches the wound. Leon’s fresh palm print and the verified exit footage place him at the scene after his claimed departure.",
      ["leon"],
    ),
  ],
  witnesses: [
    {
      id: "w-porter",
      name: "Nell Finch · courier",
      statement:
        "I passed the window again on my return. Elias was standing. My photograph has the correct time; I did not look at his clock.",
      reliability: "The original image can corroborate her memory.",
      requires: ["route"],
    },
    {
      id: "w-ivy",
      name: "Ivy Chen · apprentice",
      statement:
        "I heard his voice around twenty to nine. I did not actually see him.",
      reliability: "Distinguish hearing a voice from seeing a person.",
    },
    {
      id: "w-archivist",
      name: "Dara Holt · archivist",
      statement:
        "Mara operated the face-on archive scanner continuously from 20:20 to 21:00. She appears in its dated image sequence.",
      reliability: "Independently supported by continuous images.",
    },
  ],
  timeline: [
    {
      id: "t-parcel",
      title: "The watch leaves in an insured parcel",
      description: "Use the collection receipt.",
      requires: ["receipt"],
    },
    {
      id: "t-call",
      title: "The call comes from inside the shop",
      description: "Use the routing report.",
      requires: ["phone"],
    },
    {
      id: "t-entry",
      title: "Leon’s token opens the courtyard",
      description: "Use the synchronized access log.",
      requires: ["access"],
    },
    {
      id: "t-alive",
      title: "Elias is photographed alive",
      description: "Use the courier’s real timestamp.",
      requires: ["route"],
    },
    {
      id: "t-exit",
      title: "Leon leaves with the tool",
      description: "Use verified pharmacy footage.",
      requires: ["camera"],
    },
  ],
  deductions: [
    {
      id: "time",
      question:
        "What is the latest independently confirmed sighting of Elias alive?",
      requires: ["clock", "route"],
      options: [
        "20:31, the time on his clock",
        "20:38, the courier camera’s timestamp",
        "20:40, the recorded voice",
      ],
    },
    {
      id: "lock",
      question: "How could the killer leave a locked workshop?",
      requires: ["latch"],
      options: [
        "A hidden passage behind the clock",
        "Pull the spring-latched door shut",
        "A witness locked it later",
      ],
    },
    {
      id: "watch",
      question: "What explains the missing watch?",
      requires: ["receipt", "parcel"],
      options: [
        "The killer stole it",
        "Oscar hid a counterfeit",
        "It had already been collected legitimately",
      ],
    },
    {
      id: "voice",
      question: "Does Ivy’s testimony establish Elias was alive at 20:40?",
      requires: ["audio"],
      options: [
        "Yes, she recognized his voice",
        "No, it was the answering-machine greeting",
        "No, she invented the voice",
      ],
    },
    {
      id: "return",
      question:
        "Which conclusion survives the claim of a borrowed access token?",
      requires: ["access", "camera", "spill"],
      options: [
        "The token alone proves murder",
        "Leon returned: his face and fresh print corroborate the log",
        "No one can be placed at the scene",
      ],
    },
    {
      id: "motive",
      question: "Which imminent event explains the assault?",
      requires: ["ledger", "letter"],
      options: [
        "Mara’s impending disinheritance",
        "Exposure of Leon’s false provenance certificates",
        "The disappearance of Oscar’s watch",
      ],
    },
  ],
  finalQuestions: [
    {
      id: "culprit",
      question: "Who killed Elias Voss?",
      options: suspects.map((s) => s.name),
    },
    {
      id: "motive",
      question: "Why was Elias killed?",
      options: [
        "To inherit the workshop",
        "To stop tomorrow’s disclosure of provenance fraud",
        "To steal the pocket watch",
      ],
    },
    {
      id: "method",
      question: "How was the locked room created?",
      options: [
        "The killer pulled the spring-latched door shut after a fatal blow",
        "A remotely triggered clock struck Elias",
        "An accomplice locked the door from inside",
      ],
    },
    {
      id: "clock",
      question: "Why was the clock seven minutes slow?",
      options: [
        "The killer stopped it at death",
        "Its minute hand was mounted incorrectly during maintenance",
        "A power failure reset it",
      ],
    },
    {
      id: "watch",
      question: "What happened to the watch?",
      options: [
        "It left in the insured collection before the crime",
        "Leon sold it after the murder",
        "Ivy melted it down",
      ],
    },
    {
      id: "alibi",
      question: "What defeats the killer’s claimed departure?",
      options: [
        "The token alone",
        "An old threat and an uncertain voice",
        "The internal call, post-20:38 print, and verified 20:44 exit",
      ],
    },
  ],
};
