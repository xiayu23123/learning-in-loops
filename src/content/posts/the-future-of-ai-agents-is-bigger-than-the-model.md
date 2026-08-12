---
title: The Future of AI Agents Is Bigger Than the Model
description: AI agents are evolving from answer engines into systems that remember, authenticate, transact, delegate, and act. The winners will control the delegation stack, not just the model.
published: 2026-08-13
tags: [AI, Agents, Technology]
featured: true
---

For two decades, software trained us to ask. Search engines returned links;
chatbots returned prose. Agents introduce a different verb: delegate.

That difference sounds small until the system remembers an objective, calls a
tool, authenticates to an account, pays for a service, delegates a subtask, and
changes something outside the chat window. At that point, the relevant product
is no longer the model alone. It is an operating stack for machine action.

This is why much of the current agent debate is misframed. Investors ask which
model will win. Builders ask how many tools a model can call. Users often treat
the result as a better search engine. The harder questions concern persistent
state, authority, liability, unit economics, and physical infrastructure.

## Search retrieves; agents transact

A search engine expands what a person can see. An agent extends what a person
or organization can do.

Most current products still sit closer to search than true delegation. This is
not simply a failure of product imagination. Users trust an answer more readily
than an irreversible action. Tool calls fail. Permissions are incomplete.
Enterprise systems expose inconsistent APIs, if they expose APIs at all. A
fluent interface can hide a brittle chain of dependencies.

Measured capability is improving. [METR's task-horizon
research](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
documents growth in the length of bounded software tasks frontier systems can
complete at a specified reliability threshold. That does not demonstrate
unrestricted autonomy. Production frameworks such as the [OpenAI Agents
SDK](https://openai.github.io/openai-agents-python/) still represent agents as
explicit combinations of tools, handoffs, sessions, guardrails, and traces.
Near-term progress will come as much from systems engineering as from larger
models.

## The agent is a stack

The useful unit of analysis has at least six layers:

1. A model and reasoning policy.
2. Protocols connecting the system to tools, data, and other agents.
3. Persistent memory and state.
4. Identity, credentials, and delegated authority.
5. Budgets and economic permissions.
6. Software or physical actuators.

Each layer adds capability. Each also changes the failure surface. An error can
be stored in memory, propagated to another agent, authorized by an overly broad
credential, financed by a wallet, and made irreversible by a physical action.

Interoperability is arriving quickly. The [Model Context Protocol
specification](https://modelcontextprotocol.io/specification) defines a shared
architecture for connecting models to tools and resources. Google's [Agent2Agent
proposal](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
treats discovery, delegation, status, and artifacts as protocol objects
exchanged between agents. These protocols reduce integration friction; they do
not solve trust. Authentication, provenance, least privilege, revocation,
schema validation, and auditability become more important as connections become
easier.

## The market has four structural bottlenecks

The first is reliability. Hallucination is not usefully discussed as a single
defect rate. The real issue is where probabilistic generation sits in the
action chain. A model drafting options can be checked. A model silently changing
a production database creates a different risk. Consequential agents need
validators, constraint solvers, approval thresholds, sandboxing, and rollback
paths around the model. None of those components guarantees a correct system;
they make failures easier to detect and contain.

The second is integration. Agent deployment advances at the speed of the least
machine-readable system in the workflow. Modern protocols help at the edge, but
legacy databases, informal approvals, undocumented exceptions, and desktop
processes remain common. The model may be the most sophisticated component and
still be blocked by a spreadsheet emailed once a week.

The third is organizational power. Agents do not merely replace repetitive
clicking. They can redistribute who gathers information, recommends decisions,
allocates work, and controls exceptions. That threatens managerial territory.
Adoption therefore depends on incentives, labor design, accountability, and
politics, not just benchmark scores.

The fourth is unit economics. Token costs are only one line item. Reliable
agents require integration, evaluation, observability, security review, human
escalation, insurance, and remediation. A product may look inexpensive per call
while remaining expensive per successfully completed task.

## Memory is not identity, and ability is not authority

Long-lived agents require external memory. [Generative
Agents](https://arxiv.org/abs/2304.03442) demonstrated an architecture in which
stored experiences are retrieved, summarized into reflections, and used for
planning. [MemGPT](https://arxiv.org/abs/2310.08560) modeled memory as a hierarchy
between limited context and external storage. These systems show how apparent
continuity can be engineered around a model.

Memory still does not prove identity. A system can recall a history without
being authorized to act for the person or organization described by that
history. Future architectures must separate autobiographical memory, stable
identifiers, verifiable credentials, current authorization, and accountability.
[W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model-2.0/) and [DID
Core](https://www.w3.org/TR/did-core/) provide building blocks for claims and
identifiers. They do not establish subjective continuity or legal personhood.

The same distinction applies to money. A wallet gives an agent the ability to
pay, not legitimate authority to spend. Coinbase's [AgentKit](https://docs.cdp.coinbase.com/agent-kit/welcome)
and the [x402 protocol](https://www.x402.org/) already expose primitives for
wallets and machine-native payments. Useful economic agents still need budget
ceilings, merchant restrictions, receipts, approvals for exceptional
transactions, dispute mechanisms, key rotation, and immediate revocation.

This could create markets for transactions too small for human checkout: a
data query, verification job, inference call, storage interval, or specialized
model invocation. It also creates machine-speed fraud, runaway spending,
collusion, and resource capture.

## Coordination and embodiment multiply both value and risk

Multi-agent systems can divide research, coding, monitoring, and negotiation
among specialized workers. [AutoGen](https://arxiv.org/abs/2308.08155) and
[CAMEL](https://arxiv.org/abs/2303.17760) demonstrate programmable cooperation
as well as failure modes such as repetition and role confusion. Anthropic's
[production account of its multi-agent research
system](https://www.anthropic.com/engineering/multi-agent-research-system)
reports gains on suitable parallel tasks alongside substantially higher token
use.

More agents do not automatically mean more intelligence. They create a
coordination tax: duplicated work, conflicting state, communication overhead,
and cascading errors. The design problem moves toward routing, shared state,
conflict resolution, budgets, and end-to-end tracing.

Embodiment raises the stakes again. [RT-2](https://arxiv.org/abs/2307.15818)
showed how visual-language knowledge can contribute to robot control, while
[Gemini Robotics](https://deepmind.google/discover/blog/gemini-robotics-brings-ai-into-the-physical-world/)
targets greater generality, interactivity, and dexterity. These results do not
demonstrate reliable open-world autonomy. Physical deployment will arrive first
where environments and economics are constrained: warehouses, laboratories,
hospitals, factories, and homes.

A robot cannot rely on language-model judgment as its only safety layer. Force
limits, collision avoidance, emergency stops, location constraints, and
independently verified control policies must sit below it. Software errors can
sometimes be rolled back. A dropped object or injured person cannot.

## Agents have a material metabolism

Agent rhetoric often sounds disembodied, but persistent autonomy consumes
chips, storage, network capacity, cooling, and electricity. The International
Energy Agency's [*Energy and AI*](https://www.iea.org/reports/energy-and-ai) and
Lawrence Berkeley National Laboratory's [US data-center energy
report](https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report.pdf)
document growing electricity demand and constraints extending into generation,
transmission, interconnection, and cooling.

Persistent agents may shift demand from episodic training toward continual
inference, retrieval, monitoring, and tool use. Efficiency can reduce the cost
of each action while increasing total consumption because more actions become
affordable.

Infrastructure therefore becomes a governance layer. Whoever controls compute,
storage, electricity, network priority, and shutdown rights can shape agent
behavior through prices, quotas, scheduling, and revocation. The agent economy
will be constrained not only by intelligence, but by interconnection queues,
transformers, water, geography, and energy markets.

## What could make larger models less strategically central?

Larger and better models will continue to matter. They can expand the range of
tasks agents handle, reduce the amount of brittle orchestration, and make more
workflows economically viable. But model capability alone is unlikely to remain
a durable moat if competing models become substitutable and the scarce assets
move elsewhere in the stack.

The most credible disruption is not a single miracle chip. It is a division of
labor that moves critical operations outside free-form language generation.
Constraint solvers and optimization engines already dominate scheduling,
routing, allocation, and verification when a problem can be formalized.
Neuro-symbolic systems may combine learned representations with explicit rules.
World models and simulators may create experience where text corpora cannot.
Local models and confidential systems can keep proprietary knowledge inside an
enterprise boundary.

At the user layer, a cognitive-exoskeleton approach may win many markets before
high autonomy does. A system that remembers, retrieves, filters, and reminds
while leaving consequential decisions to a person can create value with less
trust and liability than a full delegate.

Specialized causal hardware and biological computing remain research bets.
They deserve attention, not confident market forecasts. The strategic test is
whether a technology reduces dependence on model scale by improving
verification, efficiency, proprietary learning, or physical experimentation.

## The likely future is layered, not winner-take-all

Current evidence supports longer task horizons in bounded domains, wider use of
external memory, standardized tool interfaces, limited machine payments,
domain-specific robotics, and growing pressure for audits and revocation.

It is plausible, but not assured, that persistent agents will become
institution-like actors: maintaining state, purchasing services, distributing
tasks, and managing budgets. Agent markets for data, compute, verification, and
specialized skills may follow.

Machine consciousness, legal personhood, spontaneous digital civilization,
and reliable open-world autonomy remain speculation. Memory, self-reference,
planning, refusal, or self-preserving behavior would not by themselves prove
any of those claims.

Operationally, agents will probably divide into three classes. Assistants will
propose. Operators will act within explicit permissions. Delegates will pursue
objectives across time within budgets and policy.

Most deployments will remain bounded because bounded systems are easier to
price, insure, audit, and revoke. High autonomy will appear where errors are
recoverable or the economic upside justifies extensive controls. It will move
more slowly in medicine, law, finance, critical infrastructure, and open
physical environments.

Foundation models will remain important, but value may migrate upward and
outward: toward proprietary data, workflow integration, credentials, payments,
verification, trust, and durable human relationships. The winning company may
not own the largest model. It may own the safest delegation boundary.

The future of agents will be determined less by whether machines appear human
than by whether institutions can make machine action legible, bounded,
reversible, and accountable.
