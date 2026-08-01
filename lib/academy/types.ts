export type ReviewStatus = "draft" | "needs_review" | "validated" | string;

export type Checkpoint = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type Flashcard = {
  front: string;
  back: string;
};

export type LessonVisualKind =
  | "anatomy"
  | "comparison"
  | "pathway"
  | "decision"
  | "matrix"
  | "ladder"
  | "evidence"
  | "balance";

export type LessonVisual = {
  kind: LessonVisualKind;
  title: string;
  imageSrc?: string;
  altText: string;
  caption: string;
  items: Array<{
    label: string;
    detail: string;
  }>;
};

export type Lesson = {
  id: string;
  number: number;
  nodeId?: string | string[];
  title: string;
  durationMinutes: number;
  objectives: string[];
  keyTakeaways?: string[];
  visual?: LessonVisual;
  sections: Array<{ title: string; body: string }>;
  clinicalLens?: { title: string; body: string };
  deepDive?: Array<{ title: string; body: string }>;
  causalChain: string[];
  commonTrap: string;
  checkpoint: Checkpoint;
  flashcards: Flashcard[];
  sources: string[];
};

export type IntegrativeCase = {
  id: string;
  title: string;
  status: ReviewStatus;
  dataClassification: string;
  vignette: string;
  decisionPoints: string[];
  expectedReasoning: string[];
  criticalErrors: string[];
  checkpoint: Checkpoint;
  sources: string[];
};

export type LearningDocument = {
  id: string;
  blockId: string;
  title: string;
  version: string;
  status: ReviewStatus;
  lastUpdated: string;
  estimatedMinutes: number;
  learningPromise: string;
  evidenceScope?: {
    provenanceNote: string;
    anchors: Array<{ sourceId: string; locator: string }>;
  };
  lessons: Lesson[];
  caseStudy?: IntegrativeCase;
};

export type CourseBlock = {
  number: number;
  id: string;
  title: string;
  level: "foundations" | "clinical_competence" | "expert_rcp" | string;
  objective: string;
  nodeIds: string[];
  sourceIds: string[];
  assessment: string;
};

export type BlockOverview = {
  blockId: string;
  title: string;
  summary: string;
  outcomes: string[];
  pillars: Array<{ title: string; body: string }>;
  commonTrap: string;
  checkpoint: Checkpoint;
  sourceIds: string[];
};

export type Source = {
  id: string;
  title: string;
  publisher: string;
  year: number;
  jurisdiction?: string;
  url: string;
  fullTextUrl?: string;
  verification?: string;
};

export type SiteModule = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  audience: string;
  status: ReviewStatus;
  accent: string;
  blocks: CourseBlock[];
  overviews: Record<string, BlockOverview>;
  documents: Record<string, LearningDocument>;
  sources: Record<string, Source>;
};

export type BlockProgress = {
  siteId: string;
  blockId: string;
  completedLessonIds: string[];
  checkpointAttempts: Record<string, number>;
  caseCompleted: boolean;
  updatedAt: string;
};
