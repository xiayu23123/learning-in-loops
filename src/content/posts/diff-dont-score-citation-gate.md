---
title: "Diff, Don't Score: A Citation Gate for Classical Chinese"
description: LLM answers about classical Chinese texts quote passages that look right and are not. Exact matching rejects good quotes; fuzzy matching lets every meaning-changing edit through. citation-gate aligns each quote to its source and rejects it if any edit touches a character or a name that carries meaning.
published: 2026-10-31
tags: [RAG, Evaluation]
featured: true
---

Ask a model about 《伤寒论》 and it will quote it. The quotes look right, and
often they are not: one character changed, two real lines glued together, a
line credited to the wrong book, a modern paraphrase wrapped in 「」. Readers
can't check, and the answer looks authoritative precisely because it quotes.

I run a question-answering product over medical and divination classics. Its
rule is "the program owns the facts, the model owns the wording", and the part
that enforces it is a citation gate: every quoted passage has to be found in
the library, near-verbatim, in the book it is credited to, or the answer fails.
`citation-gate` is a clean reimplementation of that idea for public use, not
the product's code.

> Code: [github.com/xiayu23123/citation-gate](https://github.com/xiayu23123/citation-gate) · Benchmark: [bench/RESULTS.md](https://github.com/xiayu23123/citation-gate/blob/main/bench/RESULTS.md)

The short version: **fuzzy matching, the obvious fix for exact matching,
passes 50 of 50 meaning-changing edits.** The fix is to diff, not score. On the
test split the full gate catches 99.1% of bad quotes and rejects none of the
good ones. That total needs three caveats, all of them below: most of the last
jump comes from a category built to need the last mechanism, the term list
behind it overlaps the benchmark almost completely, and on dev the same
mechanism started rejecting good quotes. Here is the log.

## What a bad quote looks like

The repo ships nine example answers in
[examples/answers.jsonl](https://github.com/xiayu23123/citation-gate/blob/main/examples/answers.jsonl),
checked against a bundled corpus of public-domain 《素问》, 《伤寒论》 and
《金匮要略》 from Chinese Wikisource:

```text
$ citation-gate check examples/answers.jsonl --corpus corpus
q04-growth-wrong: altered 「女子七岁，肝气盛，齿更发长」 素問 suwen-1.txt:14 肾→肝
q05-winter: altered 「故藏于精者，春病温。」 素問 suwen-1.txt:101 -不
q06-taiyang: misattributed 「太阳之为病，脉浮，头项强痛而恶寒。」 傷寒論 shanghan.txt:156
q07-longevity: spliced 「上古之人，春秋皆度百岁，阴平阳秘，精神乃治。」 suwen-1.txt:5 + suwen-1.txt:75
q08-qi: unknown_source 「人之所以生者，气也。」
q09-wheeze: altered 「太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风无汗而喘者，桂枝汤」 傷寒論 shanghan.txt:246 麻→桂 黄→枝
citation-gate FAIL: 6/11 quotes failed in 6/9 answers
```

Each failure is a different kind. q04 says 肝气盛 where the source says
腎氣盛, and the answer goes on to tell girls to nourish the liver. q05 drops
the 不 from 春不病溫, which reverses the sentence. q06 is a real line of
《伤寒论》 credited to 《金匮要略》. q07 joins two real lines from different
chapters of 《素问》 and credits the result to 《伤寒论》. q08 cites 《难经》,
which the corpus doesn't contain. q09 turns 麻黄汤 into 桂枝汤, a different
prescription.

The other five quotes pass. They are written in simplified characters against
a traditional-character source, and one carries an OCR-style slip (曰→日).

The example file has no paraphrase; the benchmark does.
「太阳病的主要表现是脉象浮，头部和颈项强硬疼痛，并且怕冷」, credited to
《伤寒论》, is a fair modern rendering of 太陽之為病，脈浮，頭項強痛而惡寒, and
it fails as `not_found`, because it is not a quote.

## Exact is too strict, fuzzy is too kind

Both sides are folded the same way before anything is compared: Unicode NFKC,
OpenCC's traditional→simplified table, a small table of variants common in
medical classics (鞕→硬, 濇→涩, 欬→咳, 沈→沉), lower-case, and everything that
is not a letter or digit dropped. The classics were punctuated by later
editors, so punctuation is not evidence.

The [benchmark](https://github.com/xiayu23123/citation-gate/tree/main/bench)
is built deterministically from the corpus: 456 items per split, each one
answer with one quote under test, labelled by construction, never by running
the gate. Good quotes are `genuine` (a real passage, simplified 70% of the
time) and `noise` (a real passage with 1–2 OCR-style slips on non-critical
characters). Everything else is bad: a single critical edit, a swapped herb
or formula name, a real line credited to the wrong book, a splice, a
paraphrase, and fakes from a character Markov model of the corpus. The fuzzy
threshold is chosen on dev only, test is scored once per configuration, and
CI rebuilds both splits and fails if any number moves.

Test split, threshold 0.85, each row adding one mechanism:

| configuration | bad quotes caught | good quotes rejected |
|---|---|---|
| exact match only | 100.0% | 45.5% |
| + fuzzy match | 48.8% | 0.0% |
| + critical characters | 77.2% | 0.0% |
| + splice detection | 77.2% | 0.0% |
| + herb names | 87.3% | 0.0% |
| + formula names | 99.1% | 0.0% |

Exact matching rejects 45.5% of good quotes. Folding already handles script,
so in this benchmark all of that is the `noise` category: the per-category
table has exact matching flagging 100% of the 50 noisy quotes and 0% of the 60
genuine ones.

Fuzzy matching fixes it completely and breaks something worse. False alarms go
to 0.0%, and `altered`, one critical edit to a real passage, goes from 100%
caught to 0%. All 50 meaning-changing edits pass. Two of them, from
[bench/test.jsonl](https://github.com/xiayu23123/citation-gate/blob/main/bench/test.jsonl):

| quote | source | edit |
|---|---|---|
| 「手足热，骨节痛，脉沉者」 | 《伤寒论》 少陰病，身體痛，手足寒，骨節痛，脈沉者，附子湯主之。 | 寒→热 |
| 「地道通，故形坏而无子也。」 | 《素问》 七七，任脈虛，……地道不通，故形壞而無子也。 | dropped 不 |

A matcher tuned to forgive one wrong character forgives 寒→热 and a dropped 不
just the same. Tightening the threshold doesn't rescue it: with the full gate
on dev, going from 0.85 to 0.90 raises false alarms from 1.8% to 25.5%. A
similarity score doesn't know which character it is forgiving.

## Diff, don't score

So the gate keeps the score and adds a test on the diff itself. Character
bigrams vote for alignment diagonals, votes within a band are pooled (an
insertion shifts the diagonal for the rest of the quote), and the top windows
are aligned with semi-global edit distance: the whole quote against any
stretch of source. Then it reads the edit script. A fuzzy match passes only if
similarity clears 0.85 *and* no substitution, insertion or deletion touches a
critical character.

The bundled `tcm` list of critical characters is short and written by hand:
numerals, negations, organs, the eight principles (阴阳表里寒热虚实),
channels, five phases, treatment verbs, direction and size, prognosis and sex.
With it, `altered` is caught 100% again, and not one genuine or noisy quote is
rejected. That is the row from 48.8% to 77.2%.

A failure carries its diff, so the report says what changed:

```python
from citation_gate import Corpus, Policy, check_answer

corpus = Corpus.load("corpus")
report = check_answer(corpus, "《素问》云：「女子七岁，肝气盛，齿更发长」")
for r in report.results:
    print(r.status, r.note())  # altered 素問 suwen-1.txt:14 肾→肝
```

Splice detection is the next row, and it changes no decision: those quotes
already fail as `not_found`. It only explains them. A quote that matches
nowhere is covered greedily by exact fragments, and fragments that don't line
up in one passage are reported as a splice with both locations. I kept it
because `suwen-1.txt:5 + suwen-1.txt:75` is something a person can go and
check, and `not_found` isn't.

## Herb names, and a number that was an accident

Critical characters don't cover names. 麻黄汤→桂枝汤 changes the prescription,
and none of 麻, 黄, 桂, 枝 is on the list. That is q09 above, and v0.1.0 of the
gate let it through.

[PR #1](https://github.com/xiayu23123/citation-gate/pull/1) added critical
terms, and building a benchmark for them showed that v0.1.0's herb-swap number
had been luck. It caught 92% of `herb_swap`, one name replaced in a quote of
8–30 characters. In a short quote a two-character swap pushes similarity below
the threshold; in a long one it doesn't. On `herb_swap_long`, the same swap in
a quote of 30–60 characters, v0.1.0 catches 28%, and fuzzy matching alone
catches 0%. Those 28% are swaps where one of the names happens to contain a
critical character (大枣, 生姜, 半夏, 枳实, 泽泻). A typical item:
「知医以丸药下之，此非其治也。潮热者，实也。先宜服小阿胶汤以解外，后以柴胡加芒硝汤主之。」,
where the source has 小柴胡湯.

The term list is extracted from the corpus by
`scripts/extract_terms.py`, which never reads the benchmark: 78 herb names from
the ingredient lines of its formulas, keeping names used in at least two
recipes, and 186 formula names from its recipe headings. Terms are checked on
both sides of the alignment. An edit fails the quote if it lands inside a
listed name in the quote or in the source passage, so 麻黄汤→桂枝汤 fails
because it breaks 麻黄.

| category (test) | v0.1.0 | + herb names | + formula names |
|---|---|---|---|
| herb_swap | 92% | 100% | 100% |
| herb_swap_long | 28% | 100% | 100% |
| herb_swap_offlist | 90% | 90% | 92% |
| formula_swap | 92% | 100% | 100% |
| formula_swap_bare | 0% | 0% | 100% |

Read the category rows, not the total. Most formula names are built from herb
names and critical characters (承**气**, **泻**心, **四**逆,
**大**/**小**柴胡), so herb names already catch every `formula_swap`. Formula
names only matter for the 38 of 186 that have neither, such as 白虎汤 and
真武汤. `formula_swap_bare` swaps only among those names, so it was built to
need formula names, and it accounts for nearly all of the jump from 87.3% to
99.1%.

## What the term list does not buy

Three results from that PR limit the claim, and they belong here rather than
in a footnote.

**Off the list, terms do nothing.** `herb_swap_offlist` swaps two herbs the
list doesn't contain, neither with a critical character. It is caught 90% of
the time with or without herb names, and those 90% are the threshold rejecting
short quotes: the same accident as before. Formula names lift it to 92% by
catching one swap that happens to sit inside a listed formula name. All three
errors left on test are off-list swaps that passed as `fuzzy`. One of them is
「有水气，其人若渴，栝蒌猪骨丸主之。」, where the source has 栝蔞瞿麥丸. Long
quotes are as exposed off the list as they were before terms existed.

**The 100% rows are mostly overlap.** `herb_swap` and `herb_swap_long` swap
names from a hand-written list of 32 herbs in the benchmark builder. The
extracted list was built without reading it and still contains 30 of the 32;
it misses 黄柏, which this corpus spells 黄檗, and 防己, which the extractor
finds in only one recipe. For formulas it is 42 of 47. So the two 100% figures
say that the extracted list covers the common herbs of these books, not that
it will cover yours. `herb_swap_offlist` is the number to expect for the herbs
a list misses.

**It now rejects slips inside names.** No good quote on test is rejected. On
dev, false alarms go from 0.0% to 0.9% with herb names and to 1.8% with formula
names: 2 of 110 good quotes. Both are `noise` items whose slip happens to fall
inside a listed name: 「去桂枝，加自术四两」, an OCR-style 白→自 inside 白术,
and 「栀子生姜豉豉汤主之。」, a doubled 豉 inside 栀子生姜豉汤. I didn't change
the noise generator to make those go away; they are the cost of the mechanism,
and the benchmark should show it. The threshold chosen on dev is still 0.85.

## What this does not show

- **The noise is synthetic**: visually confusable pairs, dropped and doubled
  characters, at most two per quote. Real OCR error is burstier, and a burst is
  exactly what pushes a good quote under a threshold or into a name.
- **The corpus is small**: four files, 62,917 folded characters. The bigram
  index is in memory; corpora in the hundreds of millions of characters are
  untested.
- **The term list fits these texts** because it was extracted from them. It
  holds herb and formula names only; symptoms and pulse terms are not critical
  terms yet, and 吴茱萸汤, which has no recipe heading in the corpus, is not on
  it.
- **It checks verifiability, not truth.** A real quote from a book you don't
  have fails as `unknown_source` or `not_found`. Books that share passages, as
  《伤寒论》 and 《金匮要略》 do, make misattribution genuinely ambiguous, and
  the gate accepts a quote found in any book its attribution can refer to. A
  paraphrase that isn't presented as a quote is out of scope, except that
  `--require-citation` flags sentences that cite nothing.

## Using it

It is a standard-library-only Python package with a CLI and a GitHub Action.
The exit code is 1 if any answer fails, so it can sit in CI next to an eval
set:

```bash
pip install git+https://github.com/xiayu23123/citation-gate
citation-gate check answers.jsonl --corpus corpus/ --markdown report.md --json report.json
```

For other domains, pass `--critical none`, `--critical-terms none` or your own
files.

## Next

A divination (术数) domain, the other half of the classics the original
product covers, is in progress; it gets written up when it has numbers.

The part that transfers beyond classical Chinese is the title. When a single
character can reverse a sentence, a similarity score is the wrong thing to
threshold. Align the quote, then read the diff.
