# Scientific Skills Installation Instructions

## Goal

Install only the scientific skills needed for Sami's agent.

The agent will be used first to help create the OncoRT Academy app, then later as a daily clinical/scientific copilot.

Source repository:

```text
https://github.com/K-Dense-AI/scientific-agent-skills
```

Do not install the full repository.

## Rule Before Installing

Before installation:

1. Re-check the current repository HEAD.
2. Review each selected skill folder.
3. Do not overwrite an existing local skill without comparing.
4. Pin the install to a commit SHA, not a floating branch.

Planning reference already checked:

```text
K-Dense-AI/scientific-agent-skills
commit: ab2f84ab10597c59fac186ecda6d5edd5dcc8b92
README version observed: 2.61.0
```

Re-check before acting:

```bash
git ls-remote https://github.com/K-Dense-AI/scientific-agent-skills.git HEAD
```

## Install Pack 1 - Required For Academy Creation

Install these first:

```text
skills/scientific-writing
skills/paper-lookup
skills/research-lookup
skills/scientific-critical-thinking
skills/citation-management
skills/scientific-slides
skills/scientific-schematics
skills/infographics
skills/scientific-visualization
skills/markdown-mermaid-writing
skills/xlsx
skills/statistical-analysis
skills/exploratory-data-analysis
skills/networkx
```

Install command:

```bash
python /root/.openclaw/agents/main/agent/codex-home/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo K-Dense-AI/scientific-agent-skills \
  --ref ab2f84ab10597c59fac186ecda6d5edd5dcc8b92 \
  --path skills/scientific-writing \
  --path skills/paper-lookup \
  --path skills/research-lookup \
  --path skills/scientific-critical-thinking \
  --path skills/citation-management \
  --path skills/scientific-slides \
  --path skills/scientific-schematics \
  --path skills/infographics \
  --path skills/scientific-visualization \
  --path skills/markdown-mermaid-writing \
  --path skills/xlsx \
  --path skills/statistical-analysis \
  --path skills/exploratory-data-analysis \
  --path skills/networkx
```

## Install Pack 2 - Later Daily Clinical Copilot

Install only after Sami confirms the second phase.

```text
skills/clinical-decision-support
skills/clinical-reports
skills/treatment-plans
skills/pydicom
skills/imaging-data-commons
skills/statistical-power
skills/experimental-design
skills/peer-review
skills/venue-templates
skills/liteparse
```

Install command:

```bash
python /root/.openclaw/agents/main/agent/codex-home/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo K-Dense-AI/scientific-agent-skills \
  --ref ab2f84ab10597c59fac186ecda6d5edd5dcc8b92 \
  --path skills/clinical-decision-support \
  --path skills/clinical-reports \
  --path skills/treatment-plans \
  --path skills/pydicom \
  --path skills/imaging-data-commons \
  --path skills/statistical-power \
  --path skills/experimental-design \
  --path skills/peer-review \
  --path skills/venue-templates \
  --path skills/liteparse
```

## Do Not Install Initially

Avoid these unless Sami asks for a specific project:

```text
skills/scanpy
skills/anndata
skills/scvi-tools
skills/scvelo
skills/pydeseq2
skills/bulk-rnaseq
skills/rdkit
skills/deepchem
skills/diffdock
skills/datamol
skills/medchem
skills/molecular-dynamics
skills/stable-baselines3
skills/pufferlib
```

Also avoid broad lab/cloud integrations unless explicitly needed:

```text
skills/benchling-integration
skills/dnanexus-integration
skills/latchbio-integration
skills/omero-integration
skills/opentrons-integration
skills/labarchive-integration
```

## Do Not Duplicate Local Skills

These are already available locally and should not be replaced casually:

```text
/root/.openclaw/workspace/skills/word-docx
/root/.openclaw/workspace/skills/markdown-converter
/root/.openclaw/workspace/skills/data-analysis
/root/.openclaw/workspace/skills/qmd
/root/.openclaw/workspace/skills/humanizer
/root/.openclaw/workspace/skills/nano-pdf
```

Because of this, do not install these K-Dense skills unless there is a clear reason:

```text
skills/docx
skills/pdf
skills/markitdown
```

For PowerPoint, install `skills/scientific-slides` first. Install `skills/pptx` later only if the agent needs direct `.pptx` editing beyond the existing workflow.

## Verification After Install

After installation, list installed skill directories:

```bash
find "$CODEX_HOME/skills" -maxdepth 2 -name SKILL.md | sort
```

If installed into OpenClaw workspace skills instead:

```bash
find /root/.openclaw/workspace/skills -maxdepth 2 -name SKILL.md | sort
```

Create a short install log:

```text
Repo:
Commit:
Installed skills:
Skipped skills:
Existing local overlaps:
Date:
```
