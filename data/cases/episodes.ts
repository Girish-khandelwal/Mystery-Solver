import type { MysteryCase, SecretSolution, EvidenceType } from "@/types/game";
interface Episode {
  n: number;
  title: string;
  category: string;
  setting: string;
  brief: string;
  names: [string, string, string];
  roles: [string, string, string];
  alibis: [string, string, string];
  culprit: number;
  motive: string;
  method: string;
  alternatives: [string, string];
  clues: [string, string, string, string][];
  twist: string;
  red: string;
  order: string[];
}
const episodes: Episode[] = [
  {
    n: 2,
    title: "The Vanishing Violin",
    category: "Art Theft",
    setting: "Bellweather Concert Hall",
    brief:
      "A Stradivari disappears between rehearsal and a live broadcast. Every exit was guarded, and the violinist carried her instrument onto the stage. The insurer asks whether anything actually left during the reported theft.",
    names: ["Ada Mercer", "Felix Ward", "Tessa Bell"],
    roles: ["Soloist", "Instrument technician", "Stage manager"],
    alibis: [
      "On camera rehearsing after 18:00.",
      "Repairing a bow in the side room throughout the interval.",
      "Calling lighting cues from the booth.",
    ],
    culprit: 1,
    motive: "Sell the original before a scheduled independent appraisal",
    method:
      "Swap the violin during afternoon maintenance and leave the replica for the evening discovery",
    alternatives: [
      "Carry it through the guarded exit during the interval",
      "Hide it in the soloist’s coat during the broadcast",
    ],
    clues: [
      [
        "Maintenance photograph",
        "At 15:10 the original has a crescent scratch beneath the bridge.",
        "The scratch is absent from a 16:05 stage photograph. The substitution predates the interval.",
        "Physical",
      ],
      [
        "Restoration work order",
        "Felix signed exclusive custody from 15:20 to 15:50.",
        "Ada arrived at 16:00; Tessa’s booth camera covers the whole custody interval.",
        "Documents",
      ],
      [
        "Case lining fibers",
        "Blue packing felt is trapped under the empty case clasp.",
        "It matches a cut roll in Felix’s repair cabinet; the concert cases use red velvet.",
        "Forensic",
      ],
      [
        "Freight receipt",
        "A bow-repair carton left at 15:45 under ticket B-71.",
        "Ticket B-71 was purchased with Felix’s staff account, and the carton weighs 2.3 kg, far more than a bow.",
        "Documents",
      ],
      [
        "Depot image",
        "The parcel scanner photographed the contents of B-71.",
        "The original’s crescent scratch is visible through the open case. The parcel is awaiting collection by Felix.",
        "Digital",
      ],
      [
        "Appraisal email",
        "An independent expert was due the following morning.",
        "Felix had quietly advertised an unregistered violin to a buyer; the serial matches the original.",
        "Digital",
      ],
      [
        "Soloist’s debt",
        "Ada has overdue loans.",
        "Her lender approved a restructuring last week. Debt explains anxiety but not the exclusive maintenance access.",
        "Documents",
      ],
      [
        "Broadcast audio",
        "The soloist says the instrument sounded normal at 18:00.",
        "Room equalization conceals timbre changes; tone alone cannot date a substitution.",
        "Witness",
      ],
    ],
    twist: "The alleged interval theft happened hours earlier.",
    red: "Ada’s debt and the evening sound recording do not overcome the dated physical change.",
    order: [
      "Original photographed at 15:10",
      "Felix takes custody at 15:20",
      "Carton dispatched at 15:45",
      "Replica photographed at 16:05",
    ],
  },
  {
    n: 3,
    title: "Murder on Platform Nine",
    category: "Murder Mystery",
    setting: "Northbridge Terminus",
    brief:
      "A railway auditor is found beneath an out-of-service carriage. A conductor’s electronic ticket scan appears to place her on a departing train, but the station systems disagree about what a scan proves.",
    names: ["June Farrow", "Silas Dent", "Nora Pike"],
    roles: ["Conductor", "Porter", "Rail auditor"],
    alibis: [
      "On the 22:10 train when my ticket was scanned.",
      "Moving luggage at the east lift.",
      "In the public café.",
    ],
    culprit: 0,
    motive: "Prevent disclosure of falsified overtime and diverted payroll",
    method:
      "Kill the auditor at the siding and create an alibi with a remotely scanned duplicate ticket",
    alternatives: [
      "Attack from the moving train",
      "Poison the café drink hours earlier",
    ],
    clues: [
      [
        "Ticket event",
        "June’s ticket was accepted at 22:11.",
        "The device ID belongs to a platform reader, not the train. Acceptance proves a barcode was present, not June.",
        "Digital",
      ],
      [
        "Siding access",
        "A restricted gate opened at 22:06.",
        "June’s key was used; the gate camera shows her face and striped duty scarf.",
        "Digital",
      ],
      [
        "Payroll audit",
        "The victim compiled an overtime discrepancy report.",
        "Payments went to an account controlled by June; the meeting to disclose this was scheduled for 08:00.",
        "Documents",
      ],
      [
        "Service locker slip",
        "A cleaning locker was opened at 22:18.",
        "The locker number is written on June’s issued key envelope.",
        "Documents",
      ],
      [
        "Locker examination",
        "A railway signal wrench is wrapped in a duty scarf.",
        "The wrench carries the victim’s blood and June’s fresh print beneath the blood layer.",
        "Forensic",
      ],
      [
        "Train interior record",
        "The 22:10 departure was recorded continuously.",
        "June never boarded. A colleague scanned her duplicate barcode from a message, believing it was a test.",
        "Digital",
      ],
      [
        "Porter’s quarrel",
        "Silas threatened the auditor over lost wages.",
        "The east lift camera places him with a disabled passenger from 22:00 to 22:20.",
        "Witness",
      ],
      [
        "Station clock",
        "The main clock reads 22:05 in a photograph.",
        "The clock was stopped for repair at 21:30 and provides no event time.",
        "Physical",
      ],
    ],
    twist: "An accepted ticket is not a passenger-location record.",
    red: "The porter’s anger was real, but his continuous assisted journey is independently recorded.",
    order: [
      "June enters siding at 22:06",
      "Train departs at 22:10",
      "Duplicate barcode scanned at 22:11",
      "Locker opened at 22:18",
    ],
  },
  {
    n: 4,
    title: "The Blue Diamond Affair",
    category: "Jewel Theft",
    setting: "Halcyon Auction House",
    brief:
      "A blue diamond appears genuine under ultraviolet light before auction and false afterward. The gemologist insists the stones were identical, but the light itself was part of the deception.",
    names: ["Rafe Morland", "Celia Quill", "Owen Hart"],
    roles: ["Auctioneer", "Gemologist", "Security officer"],
    alibis: [
      "Hosting a streamed preview.",
      "Testing the stone under ultraviolet light with observers.",
      "At the front security desk.",
    ],
    culprit: 1,
    motive: "Replace a pledged diamond before creditors seize her collection",
    method:
      "Substitute a coated imitation during testing and manipulate the ultraviolet comparison",
    alternatives: [
      "Swap the diamond after the auction",
      "Have the guard remove it during a blackout",
    ],
    clues: [
      [
        "Ultraviolet comparison",
        "Celia’s test showed a matching blue fluorescence.",
        "The test lamp has a fitted blue filter; a control stone fluoresces identically under it.",
        "Physical",
      ],
      [
        "Microscope capture",
        "A 13:10 image records a triangular inclusion.",
        "The 13:18 image lacks the inclusion, despite Celia’s claim that no substitution occurred.",
        "Digital",
      ],
      [
        "Testing custody",
        "The stone was in Celia’s screened testing station from 13:12 to 13:17.",
        "Continuous views clear Rafe and Owen of access during this interval.",
        "Documents",
      ],
      [
        "Filter supplier invoice",
        "A removable filter was delivered to locker C-4.",
        "Celia paid for it through her private restoration account.",
        "Documents",
      ],
      [
        "Locker recovery",
        "Locker C-4 contains a gem pouch.",
        "Inside is the original with the triangular inclusion and auction laser number. Only Celia signed for the locker key.",
        "Forensic",
      ],
      [
        "Creditor notice",
        "A seizure hearing is scheduled tomorrow.",
        "Celia’s pledged blue diamond was due for surrender; a matching sale would have covered the debt.",
        "Documents",
      ],
      [
        "Auctioneer’s commission",
        "Rafe concealed an unusually large commission.",
        "The signed seller contract authorized it; it is embarrassing but lawful.",
        "Documents",
      ],
      [
        "Blackout report",
        "A witness recalls a blackout.",
        "The logged blackout occurred at 12:40, before the genuine microscope image.",
        "Witness",
      ],
    ],
    twist: "The test apparatus manufactured the apparent match.",
    red: "The blackout preceded the last genuine image; it cannot explain the substitution window.",
    order: [
      "Blackout at 12:40",
      "Original imaged at 13:10",
      "Celia begins testing at 13:12",
      "Imitation imaged at 13:18",
    ],
  },
  {
    n: 5,
    title: "Room 307",
    category: "Missing Person",
    setting: "The Wren Hotel",
    brief:
      "A guest disappears from a third-floor room without appearing on corridor footage. Reception insists nobody left, but the hotel recently renumbered a wing.",
    names: ["Dorian Moss", "Lena Frost", "Amir Cole"],
    roles: ["Night receptionist", "Housekeeper", "Guest’s colleague"],
    alibis: [
      "At reception all night; Room 307 never opened.",
      "Cleaning the second-floor lounge.",
      "Waiting in the restaurant.",
    ],
    culprit: 0,
    motive: "Extort money using a guest’s concealed identity",
    method:
      "Move the captive through the old Room 307 while directing investigators to the newly numbered room",
    alternatives: [
      "Escape through a third-floor window",
      "Leave secretly with the colleague before check-in",
    ],
    clues: [
      [
        "Renumbering plan",
        "The west wing was relabeled last week.",
        "Current Room 307 used to be 309; old 307 is now 305 beside the service stair.",
        "Documents",
      ],
      [
        "Key encoder log",
        "Dorian encoded the guest’s key at 23:04.",
        "The database used the old-room mapping and opened current 305, not current 307.",
        "Digital",
      ],
      [
        "Room-service slip",
        "Food for 307 was billed at 23:20.",
        "A photograph shows it delivered to current 305, proving the guest occupied that room.",
        "Documents",
      ],
      [
        "Linen dispatch note",
        "A covered cart went to the disused annex at 23:34.",
        "The annex key checkout bears Dorian’s signature.",
        "Documents",
      ],
      [
        "Annex inspection",
        "The missing guest is rescued from a locked office.",
        "The guest identifies Dorian; adhesive restraints match a cut roll in his desk.",
        "Forensic",
      ],
      [
        "Ransom draft",
        "An unsent message demands payment for silence.",
        "It was edited under Dorian’s individual staff login and contains identity details from the guest’s passport scan.",
        "Digital",
      ],
      [
        "Colleague’s lie",
        "Amir denied knowing the guest’s former name.",
        "He was protecting a consensual identity change; restaurant footage corroborates his location.",
        "Witness",
      ],
      [
        "Housekeeping trolley",
        "A guest saw Lena pushing a cart.",
        "The guest’s receipt places this at 21:50, over an hour before check-in.",
        "Documents",
      ],
    ],
    twist: "The investigation begins outside the wrong physical room.",
    red: "The colleague hid personal information, while the cart witness conflated two different journeys.",
    order: [
      "Key encoded at 23:04",
      "Food delivered at 23:20",
      "Cart dispatched at 23:34",
      "Wrong room opened by police at 00:10",
    ],
  },
  {
    n: 6,
    title: "The Last Email",
    category: "Cybercrime",
    setting: "Aster Research",
    brief:
      "A confidential design is emailed from a scientist’s account after she leaves the country. Her assistant blames stolen credentials, but mail submission and delivery occurred on different days.",
    names: ["Iris Lane", "Bram Ellis", "Noel Finch"],
    roles: ["Research scientist", "Systems administrator", "Project assistant"],
    alibis: [
      "In flight when the email arrived.",
      "Conducting routine server maintenance before departure.",
      "At an industry conference.",
    ],
    culprit: 1,
    motive: "Sell a proprietary design to pay a hidden trading loss",
    method:
      "Queue a delayed email using a delegated service token before the scientist’s flight",
    alternatives: [
      "Log in from the aircraft Wi-Fi",
      "Steal the assistant’s laptop at the conference",
    ],
    clues: [
      [
        "Message headers",
        "The message arrived at 09:00 on Tuesday.",
        "Submission was Monday 16:42. Tuesday’s timestamp is delivery only.",
        "Digital",
      ],
      [
        "Token audit",
        "A delegated token submitted the mail.",
        "The token was minted from Bram’s hardware security key at 16:39. No scientist password was used.",
        "Digital",
      ],
      [
        "Maintenance record",
        "Bram claims all activity was routine backup.",
        "The approved procedure prohibits mailbox delegation; the token’s permission scope exceeds backup access.",
        "Documents",
      ],
      [
        "Queue job pointer",
        "The job references spool archive Q-8.",
        "A signed retention manifest gives the offline archive location.",
        "Documents",
      ],
      [
        "Archived queue",
        "Q-8 contains the outgoing payload and a delay flag.",
        "The payload hash matches the stolen design; the signature binds it to Bram’s token.",
        "Digital",
      ],
      [
        "Payment ledger",
        "An intermediary transferred a consultancy payment.",
        "The recipient account belongs to Bram; the payment memo matches the design’s internal code, never published externally.",
        "Documents",
      ],
      [
        "Scientist’s draft",
        "Iris drafted a resignation.",
        "It remained unsent; airport records clear her of physical access during token creation.",
        "Documents",
      ],
      [
        "Conference login",
        "Noel’s account accessed a public project page.",
        "It downloaded only a public abstract, whose hash differs from the leaked archive.",
        "Digital",
      ],
    ],
    twist: "Delivery time does not date the human action.",
    red: "The resignation and public download are unrelated to the privileged queue submission.",
    order: [
      "Bram creates token at 16:39",
      "Payload submitted at 16:42",
      "Scientist boards at 18:00",
      "Queue delivers Tuesday at 09:00",
    ],
  },
  {
    n: 7,
    title: "The Riverside Disappearance",
    category: "Missing Person",
    setting: "Bracken River Works",
    brief:
      "A surveyor’s abandoned canoe suggests a drowning. Yet a tide gauge, a dry notebook, and a staged emergency call point inland rather than downstream.",
    names: ["Petra Shaw", "Evan Marsh", "Hugo Reed"],
    roles: ["River contractor", "Survey assistant", "Boat keeper"],
    alibis: [
      "Inspecting the north levee during the emergency call.",
      "At the survey office.",
      "Closing the boathouse.",
    ],
    culprit: 0,
    motive: "Suppress a survey proving illegal dumping beneath a levee",
    method:
      "Confine the surveyor in a pumping station and stage a canoe accident upstream",
    alternatives: [
      "Sabotage the canoe on the open river",
      "Help the surveyor voluntarily disappear by train",
    ],
    clues: [
      [
        "Tide gauge",
        "The canoe was found below the footbridge at 17:20.",
        "Between 16:30 and 17:30 flow ran upstream; a canoe lost at the claimed site could not drift there.",
        "Digital",
      ],
      [
        "Dry field notebook",
        "The notebook was found inside the wet canoe.",
        "Its soluble ink is untouched beneath an open cover. It was added after the canoe was wet.",
        "Physical",
      ],
      [
        "Emergency call",
        "Petra reported a fall at 17:02 from the north levee.",
        "The authenticated fixed-line record places the call at the southern pump office.",
        "Digital",
      ],
      [
        "Pump maintenance card",
        "A service card lists an isolated chamber.",
        "Petra signed out the only portable chamber padlock that morning.",
        "Documents",
      ],
      [
        "Pump chamber",
        "The surveyor is found alive behind the padlocked door.",
        "The captive identifies Petra and retains a torn sleeve fragment matching her jacket.",
        "Forensic",
      ],
      [
        "Buried samples",
        "The survey records a chemical plume under the levee.",
        "Petra’s company disposal manifest falsely lists the same material as removed.",
        "Documents",
      ],
      [
        "Assistant’s argument",
        "Evan disputed credit for the survey.",
        "A timestamped group call places him in the office throughout the incident.",
        "Witness",
      ],
      [
        "Boat keeper’s cash",
        "Hugo accepted an unrecorded boat rental.",
        "It was a fishing rental returned at noon, unrelated to the surveyor’s canoe.",
        "Documents",
      ],
    ],
    twist: "The river’s direction reverses the apparent search area.",
    red: "Credit disputes and unrecorded rentals explain evasiveness but do not match the staged current or fixed-line call.",
    order: [
      "Padlock collected at 09:00",
      "Current reverses at 16:30",
      "Emergency call at 17:02",
      "Canoe found at 17:20",
    ],
  },
  {
    n: 8,
    title: "The Museum Without Shadows",
    category: "Museum Heist",
    setting: "Orison Museum",
    brief:
      "A sculpture vanishes despite a security feed that shows it on its pedestal. The displayed feed contains no moving shadows, even while the actual skylight changes.",
    names: ["Vera Holt", "Kit Arden", "Sana West"],
    roles: ["Curator", "Exhibition installer", "Security supervisor"],
    alibis: [
      "Giving a recorded lecture.",
      "Installing display lighting in the closed gallery.",
      "Watching the apparently intact sculpture on the security monitor.",
    ],
    culprit: 1,
    motive:
      "Deliver the sculpture to a private buyer before its ownership dispute is resolved",
    method:
      "Cover the security lens with a lit still image and remove the sculpture through the installation route",
    alternatives: [
      "Loop yesterday’s entire camera stream remotely",
      "Swap the sculpture during the curator’s lecture",
    ],
    clues: [
      [
        "Monitor sequence",
        "The sculpture appears stationary through the theft window.",
        "The image contains no moving skylight shadows, but the visible sensor noise is live. It is not a digital replay.",
        "Digital",
      ],
      [
        "Camera housing",
        "A rectangular adhesive residue borders the lens.",
        "The residue matches a small illuminated transparency frame in Kit’s equipment list.",
        "Physical",
      ],
      [
        "Installation permit",
        "Kit had exclusive closed-gallery access from 14:00 to 14:30.",
        "Vera’s lecture and Sana’s control-room camera provide continuous independent coverage.",
        "Documents",
      ],
      [
        "Loading manifest",
        "A lighting crate was moved to storage bay L.",
        "Its measured mass increased by the sculpture’s mass after gallery access.",
        "Documents",
      ],
      [
        "Storage bay scan",
        "The crate contains a wrapped bronze form.",
        "The foundry number matches the sculpture; Kit’s private pickup code is on the seal.",
        "Forensic",
      ],
      [
        "Buyer correspondence",
        "A message promises delivery before a court injunction.",
        "Kit’s verified address sent a photograph of the statue’s otherwise hidden base number.",
        "Digital",
      ],
      [
        "Curator’s omission",
        "Vera concealed a disputed acquisition.",
        "The dispute is real, but does not grant her access during the recorded removal window.",
        "Documents",
      ],
      [
        "Supervisor’s distraction",
        "Sana made a personal call.",
        "The call explains why she missed the frozen shadows; it did not disable recording.",
        "Witness",
      ],
    ],
    twist:
      "The camera is recording live, but the subject in front of it is a photograph.",
    red: "The curator’s provenance problem supplies context, not the physical means of the heist.",
    order: [
      "Kit enters at 14:00",
      "Shadows stop at 14:06",
      "Crate weighed at 14:22",
      "Image restored at 14:28",
    ],
  },
  {
    n: 9,
    title: "The Broken Alibi",
    category: "Insurance Fraud",
    setting: "Morrow Glassworks",
    brief:
      "A kiln fire destroys an insured inventory while its owner appears across town on a livestream. The recording is authentic; the assumption that ignition required his presence is not.",
    names: ["Grant Venn", "Pia Knox", "Jules Lake"],
    roles: ["Factory owner", "Kiln operator", "Insurance assessor"],
    alibis: [
      "Across town on a live broadcast when the fire started.",
      "Off duty before the kiln cycle began.",
      "Not inside the factory that week.",
    ],
    culprit: 0,
    motive: "Collect insurance on inventory already sold and removed",
    method:
      "Program a delayed unsafe kiln cycle after removing stock and disabling its cutoff",
    alternatives: [
      "Set the fire by hand during the livestream",
      "Have the assessor remotely hack the kiln",
    ],
    clues: [
      [
        "Livestream archive",
        "Grant is visible at 21:00 when the alarm triggers.",
        "The stream is independently live. It clears only his location at ignition, not earlier preparation.",
        "Digital",
      ],
      [
        "Controller history",
        "A cycle was scheduled at 17:12.",
        "The owner-only service PIN disabled the cutoff; a local keypad, not remote access, performed the change.",
        "Digital",
      ],
      [
        "Keypad camera",
        "The service panel was used before closing.",
        "Grant’s face is visible at 17:12. Pia had signed out at 16:45 and was on a recorded bus.",
        "Digital",
      ],
      [
        "Freight bill",
        "A pallet shipment left for warehouse M at 15:30.",
        "Its item count matches the supposedly destroyed insured inventory.",
        "Documents",
      ],
      [
        "Warehouse audit",
        "Warehouse M holds unopened glassware pallets.",
        "Serials match Grant’s fire-loss claim; no equivalent inventory remained in the kiln room.",
        "Physical",
      ],
      [
        "Policy rider",
        "Coverage increased two days before the fire.",
        "Grant submitted a signed schedule listing goods he had already arranged to remove.",
        "Documents",
      ],
      [
        "Operator’s grievance",
        "Pia threatened to report unpaid wages.",
        "Her threat concerned employment; independent records exclude her from the controller change.",
        "Witness",
      ],
      [
        "Assessor’s fee",
        "Jules billed an unusually high amount.",
        "The invoice covered three separate sites, not a secret payment to cause this fire.",
        "Documents",
      ],
    ],
    twist: "A true alibi at ignition does not exclude delayed preparation.",
    red: "Pia’s anger is not a substitute for the controller signature and camera evidence.",
    order: [
      "Stock leaves at 15:30",
      "Pia departs at 16:45",
      "Unsafe cycle scheduled at 17:12",
      "Fire triggers at 21:00",
    ],
  },
  {
    n: 10,
    title: "The Black Envelope",
    category: "Blackmail",
    setting: "Marlowe Civic Archive",
    brief:
      "Three trustees receive anonymous demands containing authentic sealed-hearing quotations. Each had archive access, but a printer defect and document revision isolate when the leak was made.",
    names: ["Esme Vail", "Rowan Cross", "Dale Snow"],
    roles: ["Trustee", "Records officer", "External solicitor"],
    alibis: [
      "At the hearing until noon.",
      "Only printing the authorized public minutes.",
      "Reading the redacted copy in the library.",
    ],
    culprit: 1,
    motive:
      "Force trustees to approve a land transfer benefiting a concealed company",
    method:
      "Print the sealed revision during a maintenance window and send extortion demands from archive stationery",
    alternatives: [
      "Copy the solicitor’s redacted notes",
      "Record the hearing from outside the sealed room",
    ],
    clues: [
      [
        "Quoted paragraph",
        "The demand quotes an exact land parcel identifier.",
        "That identifier was corrected at 12:20 and appears only in the sealed revision, never in spoken testimony.",
        "Documents",
      ],
      [
        "Printer banding",
        "Black envelopes enclose sheets with a repeated pale stripe.",
        "The stripe matches archive printer P2 between its 12:15 drum fault and 13:00 replacement.",
        "Forensic",
      ],
      [
        "Print accounting",
        "Rowan says he printed only public minutes.",
        "His badge released the sealed revision at P2 at 12:27; the public minutes have a different document hash.",
        "Digital",
      ],
      [
        "Stationery requisition",
        "A black-envelope box was sent to annex cabinet R.",
        "Rowan signed the cabinet checkout at 12:30.",
        "Documents",
      ],
      [
        "Cabinet examination",
        "Draft demands remain in the cabinet shredder bin.",
        "Their uncut lower edges carry Rowan’s handwritten corrections and the same parcel identifier.",
        "Physical",
      ],
      [
        "Company register",
        "The threatened vote concerns a land transfer.",
        "The beneficial-owner declaration identifies Rowan as the recipient company’s owner.",
        "Documents",
      ],
      [
        "Trustee’s secret",
        "Esme omitted a conflict of interest.",
        "Her interest is disclosed in the sealed hearing, explaining why she was targeted rather than identifying her as sender.",
        "Documents",
      ],
      [
        "Solicitor’s copy",
        "Dale’s notes repeat part of the hearing.",
        "They use the old parcel identifier and omit the corrected sealed paragraph.",
        "Documents",
      ],
    ],
    twist:
      "A revision made after the hearing dates the source more precisely than testimony.",
    red: "Esme had something to hide and Dale had partial information, but neither had the printed revision in the defect window.",
    order: [
      "Printer fault begins at 12:15",
      "Sealed revision corrected at 12:20",
      "Rowan releases print at 12:27",
      "Drum replaced at 13:00",
    ],
  },
  {
    n: 11,
    title: "The Silent Witness",
    category: "Sabotage",
    setting: "Alder Observatory",
    brief:
      "A telescope mount fails before a crucial observation. The overnight recorder contains no sounds of entry, but the supposedly silent witness was only storing frequencies outside ordinary hearing.",
    names: ["Mina Wren", "Theo Ash", "Leah Brook"],
    roles: ["Principal astronomer", "Mount engineer", "Visiting researcher"],
    alibis: [
      "At the remote control console.",
      "Calibrating sensors, with no mechanical changes.",
      "Asleep in the guest quarters.",
    ],
    culprit: 1,
    motive: "Hide a defective retrofit before an independent acceptance test",
    method:
      "Remove a retaining pin during calibration and alter the sensor report to disguise the cause",
    alternatives: [
      "Damage the mount through a software command",
      "Break the pin during the visitor’s observing session",
    ],
    clues: [
      [
        "Recorder configuration",
        "No footsteps appear in the saved channel.",
        "The channel stores ultrasonic bearing diagnostics only; it cannot establish that nobody entered.",
        "Digital",
      ],
      [
        "Retaining pin seat",
        "The safety pin is missing from an intact socket.",
        "There are no shear marks. It was deliberately withdrawn, not broken under load.",
        "Forensic",
      ],
      [
        "Calibration report",
        "Theo reports no mechanical work at 02:10.",
        "The housing sensor records an open panel at 02:12 under his individually signed maintenance session.",
        "Digital",
      ],
      [
        "Tool checkout",
        "A pin extractor was returned to test cage T.",
        "Only Theo checked it out that night. The cage inspection can recover residue.",
        "Documents",
      ],
      [
        "Extractor residue",
        "A steel pin lies in the extractor case.",
        "Its serial matches the missing mount part, and the protective grease carries Theo’s ridge detail.",
        "Forensic",
      ],
      [
        "Acceptance memo",
        "An independent test was due at dawn.",
        "Theo had certified an incompatible retrofit; postponing the test would conceal the signed dimensional discrepancy.",
        "Documents",
      ],
      [
        "Researcher’s rivalry",
        "Leah publicly criticized Mina’s research.",
        "The guest-door camera and building access record corroborate her absence during maintenance.",
        "Witness",
      ],
      [
        "Remote command",
        "Mina sent a mount command before failure.",
        "The command was within normal speed limits. An intact retaining pin would have sustained that load.",
        "Digital",
      ],
    ],
    twist:
      "A sensor can be truthful yet measure the wrong thing for the claimed alibi.",
    red: "Scientific rivalry and a normal command do not explain an intact, deliberately removed safety component.",
    order: [
      "Theo starts calibration at 02:10",
      "Panel opens at 02:12",
      "Extractor returned at 02:25",
      "Normal mount command at 03:00",
    ],
  },
];
export function buildEpisode(e: Episode): {
  case: MysteryCase;
  solution: SecretSolution;
} {
  const id = String(e.n).padStart(3, "0");
  const evidence = e.clues.map((x, i) => ({
    id: `e${i}`,
    name: x[0],
    description: x[1],
    analysis: x[2],
    type: x[3] as EvidenceType,
    locationId: i === 4 ? "followup" : i % 2 === 0 ? "scene" : "records",
    image: "/cases/evidence.svg",
    relatedSuspects: i < 6 ? [`s${e.culprit}`] : [],
  }));
  const suspects = e.names.map((name, i) => ({
    id: `s${i}`,
    name,
    age: 31 + i * 9,
    occupation: e.roles[i],
    relationship: `Connected to ${e.setting}`,
    personality: [
      "Defensive about personal affairs.",
      "Careful with technical language.",
      "Wary of unsupported accusations.",
    ][i],
    background: `Works with the people and records at ${e.setting}.`,
    motive:
      i === e.culprit
        ? "A professional decision may carry financial consequences."
        : "A private dispute complicates their testimony.",
    alibi: e.alibis[i],
    avatar: "/cases/portrait.svg",
    questions: [
      {
        id: `q${i}`,
        prompt: "Describe your movements and work.",
        answer: e.alibis[i],
      },
      {
        id: `q${i}-challenge`,
        prompt: "How do you explain the independent records?",
        requires: [i === e.culprit ? "e2" : i === 0 ? "e6" : "e7"],
        answer:
          i === e.culprit
            ? "Those records may show my access, but you still have to connect it to the missing object and prove intent."
            : i === 0
              ? e.red
              : "I hid a personal matter. Check the original record before treating my embarrassment as guilt.",
      },
    ],
  }));
  const c: MysteryCase = {
    id,
    caseNumber: e.n,
    title: e.title,
    subtitle: e.setting,
    category: e.category,
    difficulty: "Hard",
    coverImage: [
      "/cases/archive.svg",
      "/cases/street.svg",
      "/cases/workshop.svg",
    ][e.n % 3],
    duration: "25–40 min",
    contentStatus: "playable",
    introduction: e.brief,
    briefing:
      e.brief +
      " Secure original records, analyze their limits, and corroborate each conclusion before presenting a theory.",
    date: "18 November 1998",
    setting: e.setting,
    knownFacts: [
      e.clues[0][1],
      e.clues[2][1],
      "A statement can be mistaken without its speaker committing the crime.",
    ],
    evidence,
    suspects,
    locations: ["scene", "records", "followup"].map((loc, i) => ({
      id: loc,
      name: [e.setting, "Records & interviews", "Follow-up search"][i],
      description: [
        "Inspect the physical scene and preserve what the initial report overlooked.",
        "The original documents can reveal what a confident summary leaves out.",
        "The recorded lead authorizes a focused search of the named storage site.",
      ][i],
      image: ["/cases/workshop.svg", "/cases/archive.svg", "/cases/street.svg"][
        i
      ],
      requires: i === 2 ? ["e3"] : undefined,
      hotspots: evidence
        .filter((x) => x.locationId === loc)
        .map((x, j) => ({
          evidenceId: x.id,
          label: `Inspect ${x.name.toLowerCase()}`,
          x: 20 + j * 20,
          y: 45 + (j % 2) * 25,
        })),
    })),
    witnesses: [
      {
        id: "w1",
        name: "Independent records examiner",
        statement: e.clues[7][1],
        reliability: "Compare this observation against the original source.",
        requires: ["e7"],
      },
    ],
    timeline: e.order.map((title, i) => ({
      id: `t${i}`,
      title,
      description: "Cross-check the timestamp and source before ordering.",
      requires: [`e${i}`],
    })),
    deductions: [
      {
        id: "d1",
        question:
          "Which interpretation best accounts for the apparent impossibility?",
        requires: ["e0", "e1"],
        options: [e.alternatives[0], e.method, e.alternatives[1]],
      },
      {
        id: "d2",
        question: "What does the recovered material establish?",
        requires: ["e3", "e4"],
        options: [
          "An unrelated coincidence",
          `A physical link to ${e.names[e.culprit]}`,
          "That the original report must be completely accurate",
        ],
      },
      {
        id: "d3",
        question: "Which motive is supported by a contemporaneous record?",
        requires: ["e5", "e6"],
        options: [
          "A personal dislike without a documented consequence",
          e.motive,
          "An unexplained act by an outsider",
        ],
      },
    ],
    finalQuestions: [
      { id: "culprit", question: "Who is responsible?", options: e.names },
      {
        id: "motive",
        question: "What was the motive?",
        options: [
          e.motive,
          "Conceal an unrelated romantic affair",
          "Retaliate for a minor personal insult",
        ],
      },
      {
        id: "method",
        question: "How was the crime carried out?",
        options: [e.alternatives[0], e.alternatives[1], e.method],
      },
    ],
  };
  return {
    case: c,
    solution: {
      answers: {
        culprit: e.names[e.culprit],
        motive: e.motive,
        method: e.method,
      },
      deductions: {
        d1: e.method,
        d2: `A physical link to ${e.names[e.culprit]}`,
        d3: e.motive,
      },
      contradictions: [
        {
          id: "primary",
          pair: [`q${e.culprit}`, "e2"],
          explanation: e.clues[2][2],
        },
      ],
      timelineOrder: e.order.map((_, i) => `t${i}`),
      proof: ["e2", "e4", "e5"],
      hints: [
        "Read the original record rather than the apparent alibi. What does the instrument actually measure?",
        e.clues[3][2],
        `Compare ${e.names[e.culprit]}’s first statement with ${e.clues[2][0].toLowerCase()}. Recover and analyze the follow-up evidence.`,
      ],
      explanation: [
        {
          title: "The responsible party",
          text: `${e.names[e.culprit]} is responsible. ${e.clues[2][2]} ${e.clues[4][2]}`,
        },
        { title: "The motive", text: `${e.motive}. ${e.clues[5][2]}` },
        {
          title: "The method",
          text: `${e.method}. ${e.clues[0][2]} ${e.clues[1][2]}`,
        },
        { title: "The chronology", text: e.order.join(" → ") + "." },
        { title: "The misleading evidence", text: e.red },
      ],
    },
  };
}
export const additionalEpisodes = episodes.map(buildEpisode);
