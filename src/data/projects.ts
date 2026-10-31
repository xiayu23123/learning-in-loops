export interface Project {
  /** Repository-style name shown as the heading. */
  name: string;
  /** What sort of thing it is, shown in the left column. */
  kind: string;
  /** One or two sentences, in my own words. */
  summary: string;
  /** Code or case-study link. Leave it out while a project isn't public yet. */
  repo?: string;
  /** File name (without .md) of the post that writes the project up. */
  post?: string;
  /** Shown as a label; projects without a repo default to "In progress". */
  status?: string;
  /** Short facts shown under the summary. */
  facts?: string[];
}

export const projects: Project[] = [
  {
    name: 'lorenz-world-model',
    kind: 'Research',
    summary:
      'Does a learned latent transition earn its place? I pointed the same world-model pipeline at six regimes of dynamics I did not design, from Lorenz-63 to pixels to long-term memory. The latent was the active ingredient in zero of the six.',
    repo: 'https://github.com/xiayu23123/lorenz-world-model',
    post: 'when-does-a-latent-world-model-help',
    facts: ['6 regimes', 'negative result'],
  },
  {
    name: 'yi-world-model',
    kind: 'Research',
    summary:
      'A differentiable state-space model built on the structure of the I Ching: 64 hexagrams on a signed 6-cube, the King Wen order and the 错/综/互 relations hard-coded, only the continuous parts learning. It solved no real problem. Every dead end is written down, and one methodological result survived.',
    repo: 'https://github.com/xiayu23123/yi-world-model',
    post: 'i-ching-world-model',
    facts: ['every failure logged', '5 seeds + ablation'],
  },
  {
    name: 'ai-product-case-studies',
    kind: 'Case studies',
    summary:
      'Notes on the AI products I have built and run: a question-answering app over classical Chinese texts, a multi-model task marketplace, a fiction data pipeline and a small brain-inspired agent on an 8 GB laptop GPU. Architecture, evaluation and real numbers; no source code.',
    repo: 'https://github.com/xiayu23123/ai-product-case-studies',
    facts: ['4 case studies', 'written in Chinese'],
  },
  {
    name: 'citation-gate',
    kind: 'Tool',
    summary:
      'The citation gate from my classical-texts app, rebuilt as a standalone CLI, library and GitHub Action. Every passage an answer quotes has to be in your corpus, in the book it is credited to, and a near match fails if any edit touches a character or a name that carries meaning (寒→热, a dropped 不, 麻黄汤→桂枝汤).',
    repo: 'https://github.com/xiayu23123/citation-gate',
    post: 'diff-dont-score-citation-gate',
    facts: ['ablation per mechanism', 'limits written down'],
  },
];
