import { notFound } from "next/navigation";
import casesDocument from "../../../content/prostate/cases/seed_cases.json";
import questionsDocument from "../../../content/prostate/questions/seed_questions.json";
import { RcpWorkspace } from "../../../components/rcp-workspace";

export function generateStaticParams() {
  return [{ site: "prostate" }];
}

export default async function CasesPage({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  if (site !== "prostate") notFound();
  const caseItem = casesDocument.cases.find((item) => item.id === "prostate_case_001_high_risk_m0");
  const retest = questionsDocument.questions.find((item) => item.id === "q_prostate_high_risk_retest_001");
  if (!caseItem || !retest) notFound();
  return <RcpWorkspace caseItem={caseItem} retestPrompt={retest.prompt} />;
}
