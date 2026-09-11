# lesen

A small reading-practice prototype for children from pre-school through Year 3. Stories are grouped by reading level and shown one sentence at a time. The child moves a single marker beneath each letter; reaching the end of a word moves the marker to the next word.

## Run it

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Add or edit stories

All starter content is in `src/stories.js`. Each story has:

- a unique `id`
- a `level` matching one of the level IDs
- a short `title`
- a simple `art` character for the library
- a `sentences` array (each item becomes one reading page)

Keep early-level sentences short and decodable. The reader automatically splits each sentence into words and each word into traceable letters; trailing punctuation is displayed without becoming an extra slider stop.

Pre-K and Kindy use optional sound-group cueing. Their reviewed grapheme groups live in `earlyReaderCueGroups` in `src/stories.js`, so a word such as `need` is cued as `n · ee · d`, not as four separate letters. Multi-letter graphemes receive a small curved bridge beneath the letters to show that they work together. `earlyReaderSoundTiming` marks each spoken group as `hold` or `quick`: `rat`, for example, displays long paths for `r` and `a`, followed by a short stop for `t`.

Use `earlyReaderWordFeatures` for word-specific exceptions. In `loose`, the groups are `l · oo · s · e`, with the final `e` marked silent. It remains visible but gets no sound segment, and the draggable rail ends before it. Add and review a mapping for every new early-reader word. Year 1–3 stories deliberately use the slider without visual sound cues.

Run `npm run validate:phonics` to check that every early-reader word has complete sound grouping and timing metadata. Production builds run this check automatically.

## Included in this prototype

- Five reading levels from Pre-K to Year 3
- Fourteen editable starter activities and stories
- A Pre-K progression from individual sounds to tiny blended words
- Contextual Pre-K picture cues that connect sounds and words to meaning
- One sentence per reading screen
- Letter-aligned, keyboard-accessible word sliders
- Automatic movement to the next word
- Optional browser text-to-speech for the current sentence
- Responsive layouts, large touch targets, visible focus states, and reduced-motion support
