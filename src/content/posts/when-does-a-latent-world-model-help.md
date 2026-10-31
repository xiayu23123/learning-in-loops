---
title: "When Does a Latent World Model Actually Help? Six Regimes"
description: A world model is usually drawn as observation → encoder → latent → transition. I tested whether the latent earns its place across six regimes of dynamics I did not hand-author. It almost never does — and each regime says what carries the load instead.
published: 2026-08-30
tags: [World Models]
featured: true
---

The [I Ching world model](/posts/i-ching-world-model/) ended with one
methodological result that survived: a representation trained to serve a
controller is not good enough to plan with; you have to learn it from the
dynamics directly, with an anti-collapse regulariser. That result was a small
I-JEPA with an action-conditioned transition head, and the 卦 layer around it
turned out to be decoration.

So the honest next question was not "what else can the I Ching encode" but
**does the latent transition buy anything at all** — on dynamics nobody
designed. Every number in the previous repo came from an environment whose
transition function I wrote by hand. That is a tautology engine: the model
learns to invert the generator I control. The only way out is to point the same
pipeline at dynamics I did not design.

> Code: [github.com/xiayu23123/lorenz-world-model](https://github.com/xiayu23123/lorenz-world-model)

I ran six regimes. The short version: **a learned latent transition is almost
never the active ingredient.** It helps in exactly one narrow case, and in
every other regime something else — an output head, a delay embedding, a
reconstruction loss, cross-instance transfer — is doing the work. Here is the
log.

## The setup

The base object is the same throughout: an encoder `f`, a transition `g`, and
whatever head the task needs. The Lorenz-63 attractor
(`σ=10, ρ=28, β=8/3`) is the anchor — a genuinely chaotic 3-D system from
1963, with a known largest Lyapunov exponent `λ_max ≈ 0.906`, so predictions
can be scored in **Lyapunov times** `T_λ = 1/λ_max ≈ 1.1` and checked against
published reservoir-computing results (Pathak et al. 2018 reach 4–8 `T_λ`).

Everything uses contiguous time splits (shuffling leaks neighbours across the
split), per-channel standardisation fit on train only, and — where a rollout is
involved — K-step unrolled training and a bounding-box clamp on the latent,
because `z + g(z)` has no restoring force off the data manifold and a small
error compounds into blow-up otherwise.

## Regime 1 — the observation *is* the state

Predict the next Lorenz state from the current one. Direct MLP in `R³` versus
an encoder into `z³²` with the transition learned there.

| model | 1-step MSE | valid time | learned `λ_max` (true 0.906) |
|---|---|---|---|
| **Direct R³** | 2.5e-6 | **2.88 ± 0.53 T_λ** | +1.21 ± 0.10 |
| Latent β=1 | 2.1e-4 | 1.20 ± 0.15 T_λ | +3.30 (spurious) |
| Latent β=0 (no var-reg) | 1.9e-3 | 1.00 ± 0.16 T_λ | pairwise cos 0.77 (near-collapse) |

A two-layer MLP predicting the raw state reaches ~2.9 Lyapunov times — the same
order of magnitude as a large tuned reservoir — and recovers a stretching rate
close to the true one. Encoding into 32 dimensions and learning the dynamics
there loses more than half that horizon on every seed, and the latent map
learns a *more* chaotic system than Lorenz actually is: its `λ_max` is 3× too
high, so the latent-space rollout dies almost immediately and only the
decoder's smoothing keeps the decoded trajectory on the butterfly for a while.

The anti-collapse regulariser does replicate here — remove it and pairwise
cosine of the latents goes from 0.10 to 0.77, decoder error 9× worse. That was
the one surviving result from the previous project, and it holds on a physics
equation too. But the headline is: **when the observation already is the
low-dimensional state, the latent is pure overhead.**

## Regime 2 — the observation is *less* than the state

Now the observation is a single scalar, `o = x + 0.3y`. A lone scalar is not
Markov, so both models get a 16-lag delay-embedding window. Direct
`R¹⁶ → R¹` versus latent `R¹⁶ → z³² → R¹`, rolled out autoregressively.

| metric | Direct | Latent z³² |
|---|---|---|
| next-obs 1-step MSE | **2.5e-5** | 7.5e-5 |
| rollout valid time | **1.37 ± 0.61 T_λ** | 0.72 ± 0.21 T_λ |
| hidden 3-D state, probe error | **raw window 0.002** | from z: 0.011 |

This regime was supposed to be where the latent shines — it has to reconstruct
hidden state the observation does not carry. Instead the experiment killed its
own premise. The 16-lag delay window already reconstructs the full 3-D state to
0.2 % residual variance (Takens' theorem in action), *better* than the learned
latent. "The observation is less than the state" stops being true the moment
you supply history — and a non-Markov observation forces you to supply it. The
latent still loses the rollout on every seed.

## Regime 3 — the observation is *far more* than the state

A ball bouncing in a box: the observation is a 24×24 frame (576-D), the true
state is `[x, y, vx, vy]`. Both models see a two-frame stack. Three arms:
predict the next frame directly; a JEPA latent (predict next latent, no
reconstruction); an autoencoder latent (encoder trained *with* a reconstruction
loss, Dreamer-style).

| metric | DirectPix | JEPA z³² | AE + transition z³² |
|---|---|---|---|
| next-frame 1-step MSE | **5.0e-5** | 2.0e-3 | 2.1e-3 |
| rollout valid | 22.5 ± 2.6 frames | 17.6 ± 2.4 | **26.1 ± 2.3** |
| 4-D state probe MSE | **0.025** | 0.105 | 0.040 |

Here the latent finally earns its place — but only the **reconstruction-trained**
one, and not for the reason usually given. Its one-step pixel error is 40×
worse than direct prediction, yet it holds the rollout ~16 % longer on every
seed. The gain is **rollout stability**: autoregressive pixel prediction
accumulates blur and ghosting; a bounded 32-D latent does not. The JEPA arm —
no reconstruction pressure — loses every metric. The reconstruction term is
load-bearing; the latent by itself is not.

## Regime 4 — the dynamics are stochastic

Lorenz plus state-dependent Gaussian process noise: each step adds
`ε ~ N(0, s(x)²)` where `s` grows on the outer wings. The conditional law is
known exactly, so there is a true NLL to hit. Four transition heads:

| head | test NLL (true −1.87) | mean RMSE | calibration error (ECE) |
|---|---|---|---|
| Deterministic (μ + residual variance) | −1.61 | 0.049 | 0.20 |
| **Gaussian head** (μ, σ(x)) | **−1.82** | 0.048 | **0.087** |
| Ensemble (5× bootstrap, PETS-style) | −1.64 | 0.047 | 0.24 |
| Latent-Gaussian (bottleneck + head) | −1.82 | 0.049 | 0.073 |

Point RMSE is identical across all four — MSE cannot tell a model that knows
its uncertainty from one that doesn't. The heteroscedastic head closes 80 % of
the NLL gap and cuts calibration error 2.5×; its Monte-Carlo rollout spread
tracks the true spread at ratio 1.05, flat across horizons, while the
deterministic arm under-predicts trajectory spread by 40 %. The bootstrap
ensemble is the *worst* calibrated — it models epistemic uncertainty, which is
near zero with 48k training points, and has no mechanism for state-dependent
aleatoric noise. And the latent bottleneck ties the plain Gaussian head: the
active ingredient is the **head**, not the latent.

For chaotic data that looks deterministic, "world model" should mean *predict
the next distribution*, and the minimal thing that delivers it is a
heteroscedastic output head — not a latent, not an ensemble.

## Regime 5 — planning

The first real control test. Procedurally-generated 7×7 lava mazes: a lava band
with one gap, sparse reward, 10 % action slip so the cells by the gap are
deadly. A fresh maze every episode; evaluation is on held-out maze seeds —
zero-shot. Model-free DQN versus a learned move-model with CEM planning.

| environment steps | DQN | WM + MPC (H=2) direct | WM + MPC (H=2) latent |
|---|---|---|---|
| 10k | 0.03 | **0.57** | 0.48 |
| 60k | 0.01 | **0.58** | 0.52 |

| planning horizon H | direct | latent |
|---|---|---|
| 1 | 0.45 | 0.43 |
| **2** | **0.58** | 0.53 |
| 4 | 0.25 | 0.26 |
| 6 | 0.14 | 0.13 |

DQN never gets off the floor — it would have to learn a maze-*general* policy
from a 196-D observation. (On a single fixed maze the same DQN reaches 1.0, so
this is a real generalisation failure, not a bug.) The planner works from 10k
steps because the move-model generalises trivially — local dynamics are the
same in every maze — and the search is done per-instance at test time. This is
the one place in the whole project where a learned model clearly beats
model-free, and the reason is specific: **dynamics transfer across task
instances where a policy does not.**

Two footnotes. Planning depth has a sweet spot — `H=2` beats `H=1`, but `H≥4`
collapses, because move accuracy is ~0.92 (slip caps it near 0.9) so rollout
fidelity is `0.92^H` and past `H≈3` the planner is optimising against the
model's hallucination. And the latent world model loses to the direct one at
every horizon.

## Regime 6 — long-term memory

The last place a latent belief could matter: memory past a fixed window. A
passive T-Maze — a cue at `t=0`, then `L` blank steps, then a junction where
the model must output the cue — reduced to supervised recall so the memory
mechanism is isolated from RL instability. `L~15` fits inside a 20-step frame
stack; `L~30` and `L~45` do not.

| architecture | L~15 | L~30 | L~45 |
|---|---|---|---|
| FrameStack MLP (k=20) | 0.96 | 0.48 | 0.49 |
| GRU, recall loss only | 1.00 | 0.49 | 0.49 |
| **GRU + next-obs aux** | 1.00 | **1.00** | 0.75 |
| RSSM (recurrent + stochastic latent) | 1.00 | 1.00 | 0.51 |

FrameStack fails by construction past the window. A plain GRU trained on the
sparse recall bit *also* sits at chance for `L~30` — 30 steps of
backprop-through-time on a single bit does not train. Add a next-observation
prediction head to the *same GRU* and it jumps from 0.49 to 1.00. This is
Dreamer's insight in miniature: the world-model (reconstruction) loss, not the
task signal, is what teaches the recurrent state to carry information. The
RSSM's stochastic latent ties that where the task is solvable and is *worse* at
the breaking point. The dense predictive objective is the ingredient; the
latent is not.

## What actually carries the load

| regime | observation vs state | what carries the load |
|---|---|---|
| 1 — full state | equal | plain MLP in observation space |
| 2 — projection | less | delay embedding (Takens), not a learned latent |
| 3 — pixels | far more | reconstruction-trained encoder, for rollout *stability* only |
| 4 — stochastic | equal, noisy | heteroscedastic output head (not latent, not ensemble) |
| 5 — planning | maze layout | dynamics that transfer across task instances |
| 6 — long memory | windowed | recurrence **plus a dense predictive objective** |

The learned latent transition is the active ingredient in exactly zero of the
six. Where a latent helps at all (regime 3), the reconstruction loss is doing
the work and the bottleneck is a stability trick, not a representation win.

## What this is and isn't

It is a control study. The environments are small and synthetic; the
conclusions are about *these regimes of problem*, not about world models in
general. It does not test a large multi-object pixel world, a genuine
long-horizon POMDP, or transfer — which is exactly where the received wisdom
says latents pay off, and exactly what these experiments do not cover. The
model class is plain MLPs and one small RSSM, not a scaled Dreamer.

What it does provide is a checklist. Before adding a latent to a world model,
run the direct-versus-latent-versus-latent-without-regulariser comparison on
your own data, with the same seeds. If the latent does not clearly win, the
thing that will actually move your numbers is somewhere else: a distributional
head if the dynamics are noisy, a delay embedding if the observation lags the
state, a reconstruction auxiliary loss if you need memory, and a model that
generalises across instances if you want to plan.

## The loop, again

The [previous post](/posts/i-ching-world-model/) was named for the way each
dead end pointed at the next thing to try. This one is the continuation: the
JEPA result that survived the I Ching pointed at "does the latent help on real
dynamics", and six regimes later the answer is a fairly clean *no, not the way
it's usually drawn*. That is a negative result, reproduced and ablated, and
negative results are the part that save the next person the weeks.
