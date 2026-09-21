import { catalog } from "../catalog";
import { buildCompactCase, type Story } from "./easy";
// Original archive mechanisms belong to server-side case content, never public metadata.
const mechanisms: string[] = [
  "A changed inheritance is concealed in a palimpsest; distinguish ink aging from paper aging.",
  "A boarding tally counts a transferred crew member twice; reconcile independent manifests.",
  "Only a chilled glass carries a contaminant; reconstruct condensation transfer from serving order.",
  "A reel splice removes an apparent alibi; match optical soundtrack continuity to missing frames.",
  "A lamp never failed, but its lens rotated backward; compare bearing reports from three vessels.",
  "A painting leaves as its own shipping crate; reconcile packing dimensions against gallery photographs.",
  "A dead-man message uses a reused signing key; distinguish authorship from key possession.",
  "Three tenants share one legally impossible lease; compare municipal numbering changes.",
  "An understudy hears a cue before it was played; reconstruct a private monitor delay.",
  "Brine weights conceal a second cargo; use salinity and displacement rather than declared mass.",
  "A burned frame contains older paint than the canvas; establish which layer was transferred.",
  "An elevator stop list omits a maintenance stop; compare counterweight and door-cycle records.",
  "A berth was occupied only after a tunnel; use platform reflections to identify the boarding point.",
  "A genuine birth certificate belongs to a twin; distinguish valid documents from a valid claim.",
  "Weather damage appears natural until leaf orientation reveals fans ran against the storm.",
  "Cabin sounds travel through ventilation; separate witnessed speech from witnessed presence.",
  "Two authentic keys could not open the vault alone; trace a lock-core replacement order.",
  "A telegram predates the arrival of its news; reconstruct routing through a different calendar zone.",
  "A sample bears the right label but wrong collection tube; trace bedside handoff order.",
  "A copper statue masks a surveying instrument; triangulate inscriptions rather than read them literally.",
  "An invitation uses a private draft address; identify which revision leaked and when.",
  "A forged map copies a deliberate survey error; infer its source from the error’s revision date.",
  "Ballot totals are correct but ward attribution changes; audit transfer envelopes.",
  "Footprints end at water before the tide arrives; compare sediment moisture with tide times.",
  "A stage trap opens on the wrong count; reconstruct a time-signature edit.",
  "A batch yield proves a formula leak; separate impurities from process temperature.",
  "Each purchase is valid but the stock is counted twice through circular resale.",
  "A juror’s secret contact is real but unrelated; align recess logs with sealed evidence access.",
  "A contaminant enters after rainfall; compare sealed collection vessels and storage racks.",
  "A position fix is internally consistent but uses an altered chronometer reference.",
  "Heat changes a resin’s appearance; reconstruct test order before identifying the substitute.",
  "Balances vanish while physical seals remain; reconstruct title transfers rather than door access.",
  "A bidder buys an empty lot knowingly; trace pre-sale photography and custody.",
  "Sunrise memory conflicts with a demolished wall’s historic shadow; rebuild the old view.",
  "A weight sheet implies an extra passenger; distinguish ballast removed from luggage added.",
  "Pruning diagrams encode routes; compare seasonal growth against an alleged initiation date.",
  "A harmless tone schedules illegal pickups; separate equipment drift from deliberate timing.",
  "Reflections reveal a screen invisible from the street; reconstruct which window provided the view.",
  "A harvest ledger omits a year under a regional calendar reform; map weather to dates.",
  "Dust seals survive on stairs while a lift counter changes; model vertical access.",
  "Correct counts hide wrong concentrations; compare dilution records with container weights.",
  "A transmission uses a retired identifier; distinguish spoofed metadata from transmitter location.",
  "Five witnesses signed an authentic sheet before a sixth paragraph was inserted.",
  "Water damage preserves a hidden impression; sequence documents by pressure traces.",
  "A sample is genetically correct but from the wrong generation; reconstruct breeding records.",
  "Witnesses reverse left and right after viewing a reflection; remap their positions.",
  "Repayment dates encode access windows; distinguish extortion from a real loan.",
  "A genuine customs seal moves with a detachable hinge; test the physical boundary.",
  "A medal’s missing mass identifies a cavity, but its inscription points to a later recipient.",
  "Two reports describe different preservation artifacts; reconcile storage conditions.",
  "Floor polish transfers between shoes, invalidating the apparent trail direction.",
  "A mirrored negative reverses the apparent weapon hand; verify the original plate.",
  "Dust layers record maintenance rather than elapsed years; date a concealed visit.",
  "A prisoner stays inside an apparently escaped cell; trace supply weights and shift overlap.",
  "A warm engine is an unreliable departure clock when heaters run independently.",
  "A contract’s metadata predates its language; examine incremental saves and attachments.",
  "An acoustic echo is counted as a separate strike; reconstruct timing from two courtyards.",
  "A supposed substitution cipher is a measurement scale; account for wood shrinkage.",
  "A legal cargo changes status while stationary because a treaty boundary moves.",
  "Three informants repeat one planted source; distinguish independent corroboration from repetition.",
  "Similar crime notes were cut from different editions; separate imitation from common authorship.",
  "An empty boat’s draft records recent ballast, not passengers; combine salt lines and fuel use.",
  "A stopped clock records flooding years after a disappearance; untangle two events.",
  "An authentic death entry is attached to a switched transport casket; follow custody.",
  "Blueprint revisions conceal rooms with duplicate utility meters; reconcile service loads.",
  "A sculpture’s water circuit transports a small original while a replica remains.",
  "A valid signature is transferred by conservation backing; sequence adhesive layers.",
  "Twelve legitimate claims conceal one ship insured under changing names.",
  "A live presenter reads delayed captions unknowingly; locate the compromised source.",
  "An instrument photograph shows a simulator horizon rather than actual flight attitude.",
  "A telescope record uses sidereal time; convert it before assessing an alibi.",
  "The room moves between floors during construction; follow module delivery records.",
  "Samples are upstream by road but downstream hydrologically; reconstruct hidden drainage.",
  "A gap in tape is erased speech, not a pause; compare bias noise and splice tension.",
  "Date-line and local timetable conventions create two apparent simultaneous journeys.",
  "A broken pane fractures from temperature change after the assault; separate break time from death time.",
  "Valid ballots were routed through obsolete precinct maps; reconstruct eligibility independently.",
  "Six copies share a copying error while a seventh preserves an older route.",
  "Tunnel numbers encode excavation order, not geography; reconstruct intersecting surveys.",
  "Letters link restoration fraud to three earlier cases; distinguish coordinated actors from copied techniques.",
  "Synthetic sunrise images conceal staggered outages; correlate independent atmospheric readings.",
  "Every document is authentic yet belongs to different people; build a life chronology.",
  "A future-dated file exploits restore ordering; prove content existed before its apparent creation.",
  "Multiple true reports support a false causal narrative; separate timing, access, and authorization.",
  "Map omissions encode survey confidence; combine uncertain bearings without treating them as facts.",
  "Ground-station clock corrections mask command origin; reconcile signed uplink acknowledgments.",
  "Leap-second handling splits one entry into two apparent visits across independent systems.",
  "All witnesses share a contaminated briefing; isolate observations made before exposure.",
  "A curator changed cross-case custody links; rebuild provenance using original exhibits from the archive.",
];
const firstNames = [
  "Mara",
  "Elias",
  "Nora",
  "Felix",
  "Iris",
  "Theo",
  "Ada",
  "Hugo",
  "Clara",
  "Oscar",
];
const surnames = [
  "Vale",
  "Mercer",
  "Hale",
  "Finch",
  "Rowan",
  "Ash",
  "Ward",
  "Reed",
  "Blake",
];
export const archiveEpisodes = mechanisms.map((mechanism, index) => {
  const meta = catalog[index + 11];
  const culprit = `${firstNames[index % 10]} ${surnames[Math.floor(index / 10)]}`;
  const first = "Inspector Ellis";
  const second = "Archivist Quinn";
  const observation = mechanism.split(";")[0].replace(/\.$/, "");
  const method = `Alter the investigation record to conceal this finding: ${observation.charAt(0).toLowerCase()}${observation.slice(1)}.`;
  const motive = `${culprit}’s signed payment agreement promises a fee only if the disputed account at ${meta.subtitle} is accepted without correction.`;
  const story: Story = [
    culprit,
    first,
    second,
    "I never replaced the disputed report. The copy in the file is the original.",
    `The supervised records-room register and retained revision both show ${culprit} replacing the report for “${meta.title}” at 14:10. The replacement suppresses this finding: ${observation.charAt(0).toLowerCase()}${observation.slice(1)}.`,
    `The 14:00 intake receipt identifies the original report for “${meta.title}” and assigns its duplicate to sealed evidence tray ${meta.id}. The replacement's withdrawal slip bears ${culprit}’s signature.`,
    `Tray ${meta.id} holds the original signed examiner’s report and its source exhibits. Their reference numbers match the intake receipt. The examiner concludes: ${mechanism} The recovered replacement draft in ${culprit}’s folder deletes this conclusion.`,
    motive,
    method,
    `${first}’s fingerprints on the outer folder came from its recorded 13:30 delivery. The sealed inner report was intact at 14:00, after that delivery.`,
  ];
  const episode = buildCompactCase(story, index + 11, meta);
  episode.case.briefing = `${meta.introduction} Your assignment is to identify who suppressed a finding in this investigation, establish what the missing report demonstrates, and explain the reason for the alteration. Inspect the original records and follow the sealed-tray receipt. This compact case can be solved independently of every other case.`;
  episode.case.suspects.forEach((s) => {
    s.occupation =
      s.name === culprit
        ? "Commissioned case reviewer"
        : s.name === first
          ? "Evidence courier"
          : "Archive officer";
  });
  return episode;
});
