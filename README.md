<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ajishpradeep/Ajishpradeep/main/figure-dark.svg">
  <img alt="AI works because mathematics does. A cloud of points resolves into a human pose, triangulated by two cameras, then dissolves again." src="https://raw.githubusercontent.com/Ajishpradeep/Ajishpradeep/main/figure-light.svg" width="100%">
</picture>

I engineer AI where the mathematics is explicit and the physics is enforced. It may be an LLM, a vision or multimodal system, generative or predictive — the domain changes, the mathematics does not.

*A metric that cannot see a fault will certify it. Those are the failures I build against.*

**[ajishpradeep.com](https://ajishpradeep.com)** — the work, with its figures drawn live &nbsp;·&nbsp; **[CV](https://ajishpradeep.com/cv/)** &nbsp;·&nbsp; [LinkedIn](https://linkedin.com/in/ajishpradeep) &nbsp;·&nbsp; [ajishpradeep@gmail.com](mailto:ajishpradeep@gmail.com)

<br>

## Three bodies of work

**Motion — markerless 3D biomechanics on a phone.** IdeasLab Formosa, 2025 – present.
Two consumer cameras, a 29-keypoint pose model, multi-view reconstruction anchored to real scale, and a coaching layer in which the language model is never allowed to do the maths. Mean per-joint 3D error 8 cm → 3 cm; the full pipeline on Apple silicon via Core ML with no footage leaving the handset — shipped in a golf product used by PGA Tour professionals, though the domain is the body, not the sport.
Case files: [the pose model and the fine-tune that quietly corrupted it](https://ajishpradeep.com/work/markerless-3d-motion/) · [the geometry underneath everything](https://ajishpradeep.com/work/reconstruction-infrastructure/) · [an LLM that is never allowed to do the maths](https://ajishpradeep.com/work/agentic-coaching-llm/)

**Retail — open-set recognition at 7,000+ stores.** President Information Corp, 2023 – 2025.
Dense detection says where a product is; a fine-tuned metric space says which one it is — so a new SKU costs vectors instead of a retraining run. Deployed across 7,000+ 7-ELEVEN stores in Taiwan; presented as an NVIDIA GTC 2025 technical poster.
Case file: [retail vision AI that scales without retraining](https://ajishpradeep.com/work/planogram-vision-ai/)

**Foundations — attention, generative modelling, function approximation.**
MSc thesis on a GAN with contextual and spatial attention for inpainting in the low-data regime (NTUT, 3.8/4.0). A mathematical walkthrough of the Transformer that carries one worked example from tokenisation to the decoder's masked attention. Kolmogorov–Arnold layers as a cheaper substitute for dense MLP blocks at inference — exploratory, no language-model results yet.
[Thesis case file](https://ajishpradeep.com/work/inpainting-thesis/) · [Case_Study](https://github.com/Ajishpradeep/Case_Study) · [kan_experiment](https://github.com/Ajishpradeep/kan_experiment)

## On the record

Every line below is corroborated by someone other than me.

| | | |
|---|---|---|
| 2025 | **Winner, TAITRA "Go Healthy with Taiwan"** — 1 of 3 from 638 proposals across 55 countries. Sole author of the winning technical proposal. | [finals coverage](https://newshub.medianet.com.au/2025/12/top-innovators-compete-in-taipei-as-go-healthy-with-taiwan-finals-spotlight-health-tech-advances/133652/) |
| 2025 | **Scalable Vision AI for Planogram Compliance** — NVIDIA GTC 2025 technical poster, selected by technical review. | |
| 2025 | **XView AI shipped** — markerless swing analysis running entirely on the phone. The 2D-to-3D lifting and the Core ML deployment are my work. | [App Store](https://apps.apple.com/us/app/xview-ai-golf-swing-analysis/id1616121788) |
| 2025 | **7,000+ stores** — the planogram-compliance system in *Scientific Reports* (Ou et al.). The detection-and-embedding architecture is mine; the paper is theirs. | [PubMed](https://pubmed.ncbi.nlm.nih.gov/41402356/) |
| 2026 | **Taiwan Expo Europe, Warsaw** — presented the motion-analysis work under the Taiwan Excellence banner. | [exhibitor listing](https://www.taiwanexpoeurope.com.tw/en/exhibitor/5655073AE4F501E7DDB9B191CD6B48F0/info.html) |

## Field notes

Three of six things I now build against, each learned from a specific failure written up in the case files.

- **A metric blind to the failure is not a metric.** A model once scored better while getting worse — the validation set only contained poses where the bias was correct.
- **Make the regression impossible, not unlikely.** Freezing a pathway so its output is bit-identical by construction is a guarantee. A penalty term is a hope with a coefficient.
- **Deterministic where it can be.** Where a confident wrong number causes harm, Python computes and the model narrates. That is a design decision, not a limitation.

[All six, with the case files they came from →](https://ajishpradeep.com/#notes)

## Lab

Independent builds. Most share one habit: a deterministic path that works with no model at all.

- [**CarbonPass**](https://github.com/Ajishpradeep/CarbonPass) — a local vision-language model turns a factory's photographed paperwork into EU CBAM carbon accounting, with MILP production scheduling. On-premise; documents never leave the building.
- [**Magic Shuffle**](https://github.com/Ajishpradeep/Magic-Shuffle) — a song picker that reads energy, sleep, stress, weather and calendar, chooses a track and explains why. Spotify verifies every track the model names; a deterministic path needs no API key at all.
- [**data_automation_pipeline**](https://github.com/Ajishpradeep/data_automation_pipeline) — PDFs, web pages and source files into clean Markdown for LLM consumption, LaTeX and code blocks preserved; parallelised, optional OCR.
- [**Pulse**](https://github.com/Ajishpradeep/pulse) — a shared 3D world on a projector at a live event: attendees scan a code, appear as characters, and their facial emotion drives the room. Emotion is computed on the phone; only the label crosses the network. Built in a day.

## Now

AI Research Engineer at IdeasLab Formosa, New Taipei City. Working on the pose-lifting stack, the coaching LLM, and the engineering team's rules for building with AI tools without giving up reproducibility. Based in Taiwan, open to relocation, EU Blue Card eligible.

Open to interesting problems, research collaborations, and conversations about where mathematics-first AI can go next.

<sub>The figure above is <code>scripts/build-figure.mjs</code>: 420 points, deterministic, animated with SMIL because a README can ship an image and nothing else. The live version, on WebGPU, is on <a href="https://ajishpradeep.com">the site</a>.</sub>
