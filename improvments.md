# lesen: improvements for children aged 4–10

Review date: 12 September 2026. Baseline: `8960435`.

Priority direction updated: 17 September 2026. **Child experience first; architecture, SOPs and production processes later.** This is a product refinement plan, not a requirement to build infrastructure before improving the app.

## First experience pass — 21 September 2026

### Tablet-only update after the five-year-old trial

The child's observed difficulty takes precedence over the earlier multi-word slider plan. The current design now uses one practice word at a time for early readers, with a quiet sentence reference. Large Back and Next arrows stay in the bottom corners; Stories has a book icon and label. Completing a slider does not change the word: Next is the deliberate advance action. Older readers retain one sentence per screen. Reading options live behind help rather than competing with navigation.

The library shows two choices per shelf page with explicit paging, and finishing a story offers Next story directly. Resume saves the exact word. Four shorter, repetitive Kindy texts replace the mixed-difficulty set; Moon Cat, Hop Frog and Loose Goose remain available in Year 1. The Kindy words are short and have authored cues, but the material still needs educator review rather than being presented as a certified sequence.

Chrome viewport checks cover tablet portrait/landscape for no document scrolling or clipped controls, one-word navigation, backward travel, a complete Kindy story, next-story handoff, resume, help and longer independent sentences. Physical tablet/child validation remains necessary. The historical first-pass details below no longer describe the current word-advance behaviour or narrow-screen layout.

Implemented locally (not pushed):

- One direct pointer-controlled marker, preserving the initial grab offset, with a 96 × 96 CSS-pixel grabbing area. Held dragging works forward/backward between adjacent words and across line boundaries; releasing does not automatically skip to another word. Completion no longer removes the handle.
- Sound highlighting uses the rendered segment boundaries. Silent letters remain readable and receive no segment. Phone rails fit the available width without shrinking the handle.
- Visible tap alternatives, previous-page navigation, rereading, locally saved page resume, and a story-ending screen. Older levels start without compulsory sliders; sentence readers can switch support on/off.
- An optional first-use visual demonstration, meaningful cover subjects, a smaller welcome area, and level selection behind a grown-up disclosure. Emoji remain temporary, device-dependent artwork.
- Added the missing `c`, `h`, `r` sound activity before Tiny Words, completed the garden/lighthouse events, and gave Kite Day a small resolution. These are editorial improvements, not a certified phonics sequence.
- No new sound assets, microphone scoring, infrastructure or SOP programme.

Verification: production build and phonics validator pass; five focused drag-geometry tests pass. Headless Chrome checks passed for edge grabs, continuous forward/backward handoffs, reversing after completion, saved-page resume, independent reading, ending/reread, and no horizontal overflow at checked widths from 320–1024 px. Touch-emulated Chrome checks passed for second-finger isolation, cancellation and preventing scrolling during handle dragging. Inspected phone/library/word and tablet/word/sentence screenshots.

Still needs real use: iPad Safari and Android tablet/phone trials, including slow reading, comfortable grabbing and wrapped lines. Narrow phones currently stack supported words, so longer sentences require page scrolling outside the handle; this is not yet the proposed compact active-word layout. Test that tradeoff with children before introducing a different navigation metaphor. Educator review of pronunciations/grouping (including `qu`), full assistive-technology/zoom checks, consistent illustrations and the supplied recordings remain outstanding. The findings below describe the original review baseline unless addressed above; this pass is not a claim that every item is finished.

## The experience we are aiming for

A child opens lesen, recognises something they want to read, and starts without navigating school-year settings. The words are clear. The handle is easy to grab and stays with their finger. The sound cues make reading easier without becoming another puzzle. They can pause, go back and try again. Finishing feels satisfying and offers an obvious next choice.

“Polished” means that whole experience works—not just that the screens look finished. Prioritise these five outcomes:

1. **Effortless touch:** generous grabbing area, direct movement, continuous forward/backward travel and no surprise word changes.
2. **Clear reading stage:** comfortable text, useful sound cues, no clipped words and no need to fight scrolling on a phone.
3. **An obvious beginning:** meaningful pictures, few choices and a brief visual demonstration instead of instructions a pre-reader cannot read.
4. **Support that fits the reader:** sounds and words for beginners; optional help rather than mandatory dragging for confident readers.
5. **A satisfying finish:** complete little stories, relevant illustrations, rereading and an inviting next activity.

Work on one excellent end-to-end example first: choose an activity, practise a word, read a short story, go backwards, finish and reread. Use that experience to settle the design before expanding the catalogue. Correct sound grouping and readable silent letters belong in this work because they directly affect the child; an elaborate content platform does not.

## Overall judgement

lesen has a promising visual identity and a useful early-reading concept, but the current prototype is not yet ready for independent use across ages 4–10. The biggest opportunity is to reduce the effort of operating the app so the child can concentrate on reading. A successful drag is currently treated as successful reading; those are different things.

Keep the warm colours, plain reading type, one-sentence presentation, contextual pictures, and restrained celebrations. Prioritise reliable touch interaction, a reviewed phonics progression, and content that fits the child's reading ability. Additional decorative animation is a low priority.

This review uses the critique/frontend-design guidance, inspection of the current source and all 14 activities/stories, calculated layout and contrast checks, the parent's reported observations, and the sources linked below. `npm run build` passes, including validation of 47 early-reader words. There was no live browser or physical-device interaction test in this review. Browser-specific behaviour is identified as a risk requiring reproduction, not represented as a tested result. Scores are heuristic judgements, not measured child outcomes or an accessibility certification.

## What to preserve

- **Calm, distinctive design.** Cream, green, coral and blue form a coherent palette. The interface avoids noisy rewards, advertisements and time pressure.
- **Reading-focused typography.** Andika, natural word shapes, and the removal of boxes around individual letters are good starting points. Avoid stretching letter spacing to fill longer rails.
- **Useful scaffolding.** `ee` and `oo` groups, visible silent letters without sound segments, and the apple picture for `a` connect interaction to reading. These need systematic content review and more precise spatial alignment.
- **Child-sized visual handle.** The 80 × 60 CSS-pixel tablet handle is worth retaining. Its effective hit area must match its appearance.

Visual anti-pattern verdict: provisional pass from source inspection. There is no generic neon/glass/gradient treatment. However, the oversized welcome heading, decorative sun, abstract cover symbols and large blank spaces resemble a promotional site more than a child's activity shelf. Improve the hierarchy rather than redesigning the brand.

## Priority overview

P0 = blocks the task; P1 = major difficulty or learning risk; P2 = useful next improvement; P3 = polish. No P0 is claimed without reproducing a complete blocker on a device. If the overflow or drag failures below prevent completion, promote them to P0.

| ID | Priority | Action | Effort | Acceptance outcome |
|---|---|---|---|---|
| 1 | P1 | Make the handle effortless to grab and move | L | A continuous forward/backward drag works across words and lines without lag, jumps or release requirements |
| 2 | P1 | Constrain rails and redesign phone reading layout | M | All words and controls fit at 320–430 px widths; the next action remains reachable |
| 3 | P1 | Align sound cues, text and silent-letter geometry | M | The highlighted group agrees with the section under the marker |
| 4 | P1 | Make the first activities a genuinely achievable learning sequence | M | The first words use sounds the child has encountered; cues represent the intended pronunciation |
| 5 | P1 | Separate supported decoding from fluent reading | M | Older/stronger readers can read a sentence without dragging every word |
| 6 | P1 | Make first use and alternative controls understandable | M | A child can start after a short demonstration; touch-only users can proceed without dragging |
| 7 | P1 | Correct completion claims and recovery | M | Completion describes practice, and rereading/resuming is straightforward |
| 8 | P1 | Make a small set of stories worth finishing and rereading | M | Each has an appealing subject, a coherent ending and meaningful illustrations |
| 9 | P2 | Keep sound help honest and predictable while recordings are pending | S | No dead sound buttons; available playback stops on exit and can be replayed |
| 10 | P2 | Improve contrast, screen-reader access and focus | M | Text remains legible and the entire activity is operable with assistive technology |
| 11 | P1 | Try the complete experience with children on actual devices | M | Children can start, drag, reverse and finish without operating help or frustration |
| 12 | P2 | Finish the visual and verbal details | S | Spacing, states, labels and rewards feel consistent and purposeful |

Effort: S = local change; M = multiple related components; L = substantial implementation or editorial work. These are relative estimates, not delivery promises.

## 1. Make the marker feel attached to the child's finger

**Experience first:** the handle should feel like a physical object the child has picked up. Touching its edge must not reposition it. Moving slowly must not feel sticky; moving quickly must not trigger a word ahead of the finger. Pausing and reversing should be ordinary actions, not special gestures. Keep the large, touchable shape; improve the effective grabbing area before making it visually larger again.

The implementation evidence below explains likely causes, not a separate architecture project. Change only what is needed to achieve this behaviour.

**Evidence:** `Reader.applyMarkerPosition`, `continueContinuousDrag`, `endContinuousDrag` and `WordSlider` in [src/main.jsx](src/main.jsx); `.slider-wrap input` and its thumb rules in [src/styles.css](src/styles.css).

The first word uses a native range control, but later words use manually calculated pointer coordinates. The invisible native thumb is 88 px wide on tablets. Padding is subtracted for the manual calculation, but the native thumb's centre travel is not explicitly reconciled with the visible marker's full-rail travel. These two mappings can behave differently; this is a strong candidate for the reported finger/marker mismatch, requiring Safari and Chrome reproduction.

Other concrete risks in the current handlers:

- `trackBackGesture` does not require an existing gesture: optional chaining on an absent gesture does not trigger its early return. A mouse hover 40 px left of the rail can reach an assignment to `backGestureRef.current.used` while that ref is null.
- Once pointer capture moves to the reading stage, the per-input backward handler no longer owns the gesture. The stage handler only clamps positions at zero; it has no equivalent backward handoff.
- While waiting for the next word, moving back over the current word does not cancel `pendingIndex`; release can still advance.
- Stored `pointerId` is not checked on stage move/up/cancel events. A second touch could move or end the first gesture.
- `pointercancel` uses the same handler as release and can advance a pending word. Cancellation should not count as a deliberate advance.
- `touch-action: pan-y` permits browser scrolling to compete with diagonal movement to a wrapped line. Pointer capture alone does not resolve that competition.
- A next-line entry checks vertical proximity and only a left boundary. Entering that line far to the right can set the next word straight to 100%.

**Action:** use one persistent gesture owner, one active pointer ID and one geometry function for every word. Model idle, dragging, crossing a gap, crossing a line and completed states explicitly. Derive the visible handle, hit area and value from the same rail measurements. Preserve the initial grab offset so touching the handle's edge does not make it jump. Keep movement direct, unstepped and without speed limits or automatic return, consistent with the accepted product direction.

Define gap behaviour explicitly: let the handle follow the held finger through whitespace without assigning another sound; wrapped lines should require entry near the next line's start. Provide a clear scroll region outside the handle and prevent scrolling only for an intentional handle drag. Keep backward travel available throughout a continuous gesture. Do not make a drag-speed restriction stand in for reading assessment.

**Done when:** slow/fast drags, edge grabs, reversals, short releases, second-finger touches, cancellation, rotation and line changes work on real iPad Safari and Android Chrome. The marker retains its grab offset within a proposed 4 CSS-pixel tolerance along a rail. A cancelled gesture preserves the last valid position and never completes another word. Repeating the full sentence forwards and backwards needs no rescue taps.

Suggested design follow-up: `/harden`, then `/adapt`.

## 2. Make the phone layout a first-class experience

**Evidence:** `pathWidthRem` has no viewport cap for cued words. At a 16 px root font, `splash` requests approximately **387 px** of minimum word width; `green` requests **299 px**. A 375 px phone has roughly 311 px inside the reader and stage padding, and a 320 px phone roughly 256 px. These calculations exclude extra space required by handle overhangs. `.reading-stage` also clips horizontal overflow.

Longer rails therefore create a credible clipping problem. They also put many ordinary sentence words on separate rows. Each tablet-style slider consumes about 122 px vertically before its letters and inter-row gap. This undermines the one-sentence focus, especially in phone landscape.

**Action:** cap rail width to available content width including handle overhang. Establish separate layouts for sound practice, single-word decoding and sentence reading. On small phones, keep the complete sentence in a compact readable strip and provide a generous active-word practice area below; on tablets, retain inline rails where the sentence fits. Validate this proposed phone layout with children before adopting it. Allow an intentional lift/reposition at line breaks without penalty.

Reduce the welcome hero and the reader's 8 rem mobile top padding. Do not reserve a large invisible success panel during reading. Keep the primary activity/action visible without competing scrolling areas.

**Done when:** test 320, 375, 390 and 430 px widths, tablet portrait/landscape, browser chrome visible, and 200% text zoom. No word, silent letter, handle or next-page button is clipped. Do not shrink the hit target to make content fit.

Suggested follow-up: `/adapt`, `/arrange`.

## 3. Make cues spatially and semantically consistent

**Evidence:** cue centres are calculated from weights, then the first and last centres are stretched to 0% and 100%. Rendered segments instead fill a flex track with padding, gaps and minimum widths. Nearest-centre highlighting therefore does not necessarily match the section physically under the marker. The word is centred above a rail that may be much longer than its letters. Silent-tail shortening uses character counts, not measured glyph widths.

**Action:** derive cue activation from the same actual segment boundaries used to render the rail. Keep a bridge for an authored multi-letter unit, but distinguish a spelling unit from a claim that it always represents exactly one phoneme. Keep silent letters readable. Measure the silent tail and text placement if the rail is intended to stop below its last sounded letter; otherwise explain a separate sound-strip metaphor rather than suggesting exact letter alignment.

Use length/shape as well as colour for hold/quick cues, and demonstrate the meaning once. Prefer “stretch” and “quick” in adult guidance over “long vowel/short vowel”: sustainability and vowel identity are different concepts. Preserve direct marker movement across boundaries.

**Done when:** `rat`, `need`, `loose`, `goose`, `quick` and `winked` pass a frame-by-frame cue/rail review. Silent `e` never activates, stays readable, and the cue changes at the displayed boundary in both directions.

Suggested follow-up: `/normalize`, `/clarify`.

## 4. Make early success achievable, not accidental

**Evidence:** `src/stories.js` contains school-year categories, but no difficulty score, prerequisites, taught-sound inventory or mastery data. `Tiny Words` includes `cat`, `hat`, `map`, `rat` after sound activities that introduce `m s a t n p i f`; `c`, `h` and `r` have not been introduced there. Kindy includes vowel teams, consonant clusters, inflections and less straightforward spellings together.

The global spelling-to-timing map is insufficient for future pronunciation. For example, `qu` in `quick` corresponds to /kw/, yet the interface bridges it under a general one-sound interpretation and marks it as one quick unit. [Cambridge's pronunciation of quick](https://dictionary.cambridge.org/pronunciation/english/quick) supports the /kwɪk/ example. A spelling group can be useful pedagogically without being a single phoneme.

**Action now:** make the first handful of activities a coherent sequence. Introduce the sounds needed for `cat`, `hat`, `map` and `rat` before expecting the child to blend those words, or change the first words to match the sounds already introduced. Check the exact words and cues in this small experience with an early-literacy educator. Do not automatically treat every final `e` as silent or every `oo` as identical. Agree the intended pronunciation before recording; Australian English is a proposed default given the project context, not an assumption about every reader.

Show child-facing choices such as “Sounds”, “Words”, “Short stories”; retain year guidance in the adult area. Offer adult selection initially. Difficulty should feel like a manageable next step, not an unexplained jump in spelling and vocabulary. A formal difficulty engine, detailed authoring schema and automated placement can wait.

**Done when:** the first word activity uses introduced correspondences, the selected stories do not spring unexplained patterns on a beginner, and their pronunciation and cues have been checked. A child should be challenged by reading, not by missing instruction.

The [IES foundational-reading guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/21/Published) supports teaching sound–letter relationships, decoding and connected-text reading. The particular lesson sequence and thresholds proposed here still need educator review.

## 5. Give stronger readers a different reading mode

**Evidence:** Year 1–3 hide sound cues but retain a required slider under every word and gate progress on traversing all of them. The same motor task is applied across the whole age range.

**Action:** provide three skill-based modes: supported sounds/words, supported sentences, and independent sentence reading. In independent mode, show the sentence naturally, offer optional word help and let the child choose “Next”. Retain the agreed one-sentence default; assess an optional passage view later for fluency. Let an older child use decoding support without a preschool label.

**Done when:** a confident nine-year-old can complete a story without operating each word's slider; a nine-year-old still learning to decode can access help without babyish framing. Mode choice depends on skill and preference, not birth date alone.

Suggested follow-up: `/distill`, `/adapt`.

## 6. Make first use understandable without reading instructions

**Evidence:** five horizontally scrolling level tabs, text-heavy activity names, abstract story art and written prompts are the main navigation aids. There is no gesture demonstration. Backward navigation requires discovering a 40 px overscroll. Keyboard support exists, but there is no explicit touch alternative for all custom gesture functions.

**Action:** show one recommended “Continue” activity and two or three recognisable alternatives. Put level selection in a grown-up area. Replace cover glyphs such as `♣`, `▰` and `oo` with meaningful, consistent thumbnails. Give a short, replayable, skippable demonstration of grabbing, dragging, pausing and going back. With recordings still pending, use a visual demonstration and an adult cue.

Provide large tap controls for previous/next word and a “Read without dragging” option. Native range tapping may already provide some forward alternatives; verify it rather than assuming an accessibility failure. The custom backward and cross-word behaviours also need a discoverable equivalent. W3C distinguishes keyboard access from a [single-pointer alternative to dragging](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).

**Done when:** after one demonstration, a first-time child can find and start an activity without reading the prompt. All essential actions can also be completed using taps alone.

Suggested follow-up: `/onboard`, `/clarify`.

## 7. Make feedback truthful and preserve progress

**Evidence:** reaching the end triggers “Great sound!” or “You read the whole sentence!” without listening or checking understanding. Finishing hides all markers; there is no reread button or previous-page control. `Finish story` returns directly to the library. State is held in React memory, so refresh or closing the reader loses the current reading position.

**Action:** separate activity completion from reading accuracy. Use “Page complete” or “Ready to read it again?” for automatic feedback. Offer “Read again”, “Next” and a brief final story recap. Add a saved local resume position with an explicit restart action. Keep support/hints separate from errors and avoid timed goals. A simple parent-confirmed “Practised / Needs help” record is sufficient initially; microphone scoring is not required.

**Done when:** rapidly dragging through a sentence cannot be reported as verified mastery. A child can reread the final sentence, revisit a previous page, or leave and resume without losing their place.

Suggested follow-up: `/harden`, `/clarify`.

## 8. Improve the stories before multiplying them

Current inventory: 3 Pre-K activities, 4 Kindy stories, 3 Year 1 stories, 2 Year 2 stories and 2 Year 3 stories. Each story has only three sentences.

| Content | Judgement | Concrete improvement |
|---|---|---|
| First/More Sounds | Pictures provide useful context; the initial set is small and its sequence is not documented | Teach an educator-selected reusable sound set, then build words exclusively from that set |
| Tiny Words | `cat`, `hat`, `map`, `rat` are concrete and pictureable | Introduce missing correspondences first; add blending review and a picture choice after decoding |
| Mud Pup | Clear sequence: muddy pup, wet paws, bath | Reclassify by prerequisites; `paws`, `quick`, `bath`, `the` make it more than a basic CVC text |
| Moon Cat / Hop, Frog! | Appealing images, but mixed spelling and cluster demands | Split into deliberately sequenced lessons; state what `oo`, `ee`, `sh`, clusters and endings require |
| Loose Goose | Good target for the joined `oo` and silent `e` treatment | Retain as a targeted lesson after those patterns have been taught |
| Year 1–2 collection | Gentle subjects; some complete mini-events, some descriptions | Add a simple question, small challenge and clear resolution; tag vocabulary separately from decoding difficulty |
| Garden Gate / Lighthouse Mystery | Intriguing openings, especially the lighthouse | Finish the event or make these explicit chapters with a continuation; currently the mystery stops at its setup |

**Action now:** finish a few excellent examples before expanding the bank. Give each a recognisable character, a small event or problem, and a satisfying ending—even with very simple language. Use appealing interests such as animals, everyday mishaps, sport, space and making things. Avoid equating older children with harder spelling alone: offer richer ideas in accessible language. Catalogue size and publishing workflows come later.

Use pictures to explain a sound or confirm meaning. During word decoding, offer a reveal/hint option so the picture is not always enough to guess the answer. Emoji are acceptable placeholders, but an ant can be named “ant” rather than “insect”, and images render differently across devices. Review picture naming with children and replace ambiguous items with consistent assets. Add one optional meaning question or retell prompt after a story; use spoken/adult-supported prompts for non-readers when recordings arrive.

**Done when:** each selected story is achievable, has a coherent ending and offers something to talk about or revisit. Its pictures support meaning instead of merely decorating the page. Repetition rehearses familiar skills in fresh contexts. Use assets with appropriate rights, without making asset-management tooling a prerequisite.

## 9. Make available sound help predictable; wait for the recordings

**Evidence:** `public/audio/README.md` is a placeholder. Sound mode has no playback; word/story mode uses device speech synthesis with a fixed rate, no selected language/voice, no visible loading/error state and no stop-on-exit cleanup. Fonts load from Google; no offline package/service worker is present.

**Action now:** respect the plan for parent-provided recordings. Do not invent recordings or show an apparently usable sound button with nothing behind it. Until clips arrive, make the visual activity usable with an adult and keep unavailable audio out of the child's primary actions. Reserve synthetic speech for a clearly identified whole-word/sentence fallback; do not assume it models isolated phonemes correctly. Stop audio when leaving a page and provide obvious stop/replay controls for available playback.

Offline packs, audio-management tooling and broader infrastructure are later work. For now, missing clips or playback failure must not trap the child. Do not introduce unnecessary collection of children's personal data to support this refinement.

**Done when:** available sound help is predictable, leaving a page stops playback, and missing recordings do not prevent completing the activity. Once recordings arrive, check that they match the displayed cues on the actual devices.

## 10. Improve accessibility without weakening the reading cues

Calculated against the reader background `#fffaf0`, active coral `#e95e49` is approximately **3.28:1**, silent grey `#aaa397` **2.40:1**, and main ink **11.21:1**. Coral meets the usual 3:1 threshold for the current large reading text, but should not be reused for small instructional text without checking. Silent letters are meaningful text, and their contrast is too low even for that large-text threshold. The whole-word inactive opacity of `.46` further reduces contrast.

**Action:** keep inactive words readable and reduce emphasis through weight, underline or subtle background instead of heavy opacity reduction. Darken silent letters while preserving their distinction. Maintain shape/length distinctions in monochrome. Verify actual rendered contrast and all backgrounds, not only base hex colours.

`word-display` is `aria-hidden`, so the visible sentence is not exposed as ordinary text; slider labels substitute isolated words and omit punctuation. Expose one coherent sentence to assistive technology, avoid duplicate narration, label controls separately, and check focus after the final slider disables. Verify hidden success copy is not announced prematurely. Use actual progress semantics where useful. Scope non-selection to child interaction surfaces if an adult help/settings area is added.

The [W3C enhanced target guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) uses 44 × 44 CSS pixels, subject to exceptions. That is not a guarantee of comfort for a four-year-old. Retain the larger handle and validate its effective hit area with children.

**Done when:** VoiceOver/TalkBack, keyboard, tap-only operation, reduced motion and 200% zoom all complete the activity; no important letters disappear through contrast or clipping.

Suggested follow-up: `/audit`, `/typeset`.

## 11. Judge the experience in children's hands

The successful build does not tell us whether a four-year-old can grab the handle or whether a nine-year-old enjoys the story. The parent's observations of frustration are more important to this refinement than a clean technical score.

**Action now:** watch short sessions on an actual tablet and phone. Ask the child to choose something, start, pause, go backwards, finish and reread. Observe before explaining. Notice missed grabs, surprise word changes, repeated attempts, scrolling conflicts and whether pictures or prompts confuse them. Stop when frustration builds; do not turn the trial into a reading test.

**Done when:** children can operate the selected activity after one short demonstration, do not need rescue taps, and can recover naturally when they change their mind. Check beginners and stronger readers separately. This is a practical way to refine the product, not an SOP programme or proof of learning effectiveness. Focused technical checks still belong with fixes, but building a comprehensive testing platform is not the immediate deliverable.

## 12. Minor polish

- Put the German IPA wordmark detail in adult/about content if it distracts early readers; the short name itself is memorable.
- Replace decorative page numerals with a quieter page indicator if testing shows competition with the sentence.
- Keep rewards connected to the story or mastered practice, with replay and choice rather than streak pressure.
- Make handle pressed/held/released states clear without shifting its position or adding drag lag. Keep celebrations brief and out of the reading path.
- Keep consistent child-facing terms: sound, word, story and next. Retain technical vocabulary in authoring tools.

## Provisional design health score

Scale: 0 absent/broken, 1 weak, 2 partial, 3 good, 4 excellent. This is a source-based heuristic assessment for the specified child audience.

| Heuristic | Score / 4 | Main reason |
|---|---:|---|
| Visibility of status | 2 | Active words and page progress exist; pending handoff is not explained |
| Match with the real world | 2 | Natural reading text; gesture expectations repeatedly conflict with observed child behaviour |
| User control and freedom | 2 | Exit and some backwards movement exist; replay/resume and continuous backward transfer are incomplete |
| Consistency | 2 | Cohesive styling, but native/manual pointer mappings differ |
| Error prevention | 1 | Multitouch, cancellation and phone overflow risks remain |
| Recognition over recall | 1 | Written prompts and hidden overscroll require explanation |
| Flexibility | 1 | All ages must traverse every word; support is tied to year labels |
| Aesthetic restraint | 3 | Calm palette and focused reading stage; oversized welcome/decorative space |
| Error recovery | 1 | Lost reading position and no visible interaction-recovery option |
| Help | 1 | Short written prompt and repository docs; no child-facing demonstration |
| **Total** | **16 / 40** | **Major usability improvements needed before independent child use** |

Cognitive-load checklist, assessed heuristically: single focus **pass**; chunking **fail** (five peer level choices); grouping **pass**; hierarchy **pass** (reading stage); one decision at a time **pass**; minimal choices **fail** (levels plus story choices); working-memory support **fail** (hidden gesture rules); progressive disclosure **fail** (all levels exposed before placement). **4/8 failures**, a high-priority design signal, not a measured limit on what every child can handle.

## Child and adult walkthroughs

| Persona | Likely breakdown | Improvement that matters most |
|---|---|---|
| New four-year-old, adult nearby | Cannot read the operating instructions; chooses by pictures; expects the handle to stay grabbed | One meaningful activity choice, visual demonstration and reliable large hit area |
| Six-year-old beginning to blend | Must coordinate sounding out, dragging, colour changes and wrapped lines; mixed story prerequisites | Reviewed progression, aligned cues, stable drag plus a tap alternative |
| Nine-year-old fluent reader or older struggling reader | Either finds mandatory sliders tedious or feels labelled too young when seeking help | Skill-based modes, age-respectful stories, optional decoding support |
| Child with motor/vision differences, with parent | Hidden backward gesture, low-contrast silent letters and dragging dependence | Readable full text, explicit touch alternatives, accessible focus and replay |

These are scenario walkthroughs, not interviews or observed usability sessions. The parent's actual reports of frustration are stronger evidence than these predictions.

## Experience-first work order

1. **Get one reading screen feeling right:** refine the handle, both-direction movement, spacing and cue alignment together. Use `rat`, `need` and `loose`, then a short sentence with word and line transitions. Never solve phone fit by shrinking the handle or spreading letters unnaturally.
2. **Make the whole small journey work:** meaningful activity cover, short demonstration, reading, pause/backtracking, completion and reread. Remove visual clutter and dead ends along that path.
3. **Make it right for different readers:** verify a beginner's sound/word activity and a stronger reader's story without compulsory sliders. Keep support accessible without babyish labels.
4. **Finish the content and visual details:** complete the selected stories, improve relevant pictures, darken meaningful text, refine spacing, labels and feedback. Use `/adapt`, `/onboard` and `/clarify` where needed, then `/polish` across the complete journey.
5. **Watch children use it and refine again:** correct the observed friction before expanding features or the story catalogue. A polished screenshot alone does not settle the interaction.

Before the next child trial, cover iPad Safari and Android Chrome, portrait and landscape, at least one small phone, touch with a connected keyboard/trackpad, slow/fast drag, diagonal line transition, release/re-grab, reverse after a handoff, second finger, browser cancellation and refresh/resume. Use screen-reader and zoom checks as separate sessions.

Run a small formative trial across approximately ages 4–5, 6–7 and 8–10, including different reading abilities; do not use one child as a proxy for all ages. Keep sessions short and stop on frustration. Record adult interventions, missed grabs, unexpected word changes, successful rereading, decoding attempts and comprehension—not swipe speed as literacy progress. A proposed initial usability target is four out of five participants starting after one demonstration and completing a familiar short activity with at most one operating prompt. Treat that as a design checkpoint, not proof of learning effectiveness.

## Explicitly deferred

Architecture clean-ups unrelated to the experience, SOPs, publishing/approval workflows, a comprehensive content-management system, automated placement or mastery scoring, large-scale catalogue expansion, offline-pack infrastructure and a broad test-platform project. Revisit these once the core experience is convincing. Necessary code fixes and checks are still part of delivering that experience; they are not standalone product goals.

The next deliverable should be a visibly and tangibly better child journey—not a more elaborate development process. Do not promise perfection from inspection: settle the difficult interactions by observing real use and refining until the recurring frustration is gone.
