#!/usr/bin/env python3
"""Deterministic structural validation for an OncoRT disease-site pilot."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
VALID_STATUSES = {"draft", "needs_review", "validated", "deprecated"}


def load_json(path: Path, errors: list[str]) -> dict[str, Any]:
    try:
        with path.open(encoding="utf-8") as handle:
            value = json.load(handle)
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"{path.relative_to(ROOT)}: lecture JSON impossible: {exc}")
        return {}
    if not isinstance(value, dict):
        errors.append(f"{path.relative_to(ROOT)}: la racine JSON doit être un objet")
        return {}
    return value


def require_fields(
    item: dict[str, Any],
    fields: set[str],
    label: str,
    errors: list[str],
) -> None:
    missing = sorted(field for field in fields if field not in item)
    if missing:
        errors.append(f"{label}: champs obligatoires manquants: {', '.join(missing)}")


def validate_status(value: Any, label: str, errors: list[str]) -> None:
    if value not in VALID_STATUSES:
        errors.append(f"{label}: statut invalide {value!r}")


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    site_name = sys.argv[1] if len(sys.argv) > 1 else "endometrium"
    site = ROOT / "content" / site_name
    if not site.is_dir():
        print(f"ERROR: site de contenu inconnu: {site_name}")
        return 1

    curriculum = load_json(site / "curriculum.json", errors)
    course_map = load_json(site / "course_map.json", errors)
    graph = load_json(site / "prerequisite_graph.json", errors)
    cases_doc = load_json(site / "cases" / "seed_cases.json", errors)
    questions_doc = load_json(site / "questions" / "seed_questions.json", errors)
    sources_doc = load_json(site / "sources" / "index.json", errors)
    review_doc = load_json(site / "review" / "review_queue.json", errors)

    modules = curriculum.get("modules", [])
    curriculum_ids = {
        node
        for module in modules
        if isinstance(module, dict)
        for node in module.get("nodes", [])
        if isinstance(node, str)
    }
    concept_ids = {path.stem for path in (site / "concepts").glob("*.md")}
    known_concepts = curriculum_ids | concept_ids

    source_ids: set[str] = set()
    for source in sources_doc.get("sources", []):
        if not isinstance(source, dict):
            errors.append("sources/index.json: une source n'est pas un objet")
            continue
        require_fields(
            source,
            {"id", "title", "year", "url", "verification"},
            "source",
            errors,
        )
        source_id = source.get("id")
        if isinstance(source_id, str):
            if source_id in source_ids:
                errors.append(f"source dupliquée: {source_id}")
            source_ids.add(source_id)

    course_block_ids = {
        block.get("id")
        for block in course_map.get("blocks", [])
        if isinstance(block, dict) and isinstance(block.get("id"), str)
    }
    lesson_ids: set[str] = set()
    detailed_node_ids: set[str] = set()
    for learn_path in sorted((site / "learn").glob("*.json")):
        if learn_path.name == "block_overviews.json":
            continue
        learn_doc = load_json(learn_path, errors)
        require_fields(
            learn_doc,
            {"id", "blockId", "title", "version", "status", "lessons"},
            str(learn_path.relative_to(ROOT)),
            errors,
        )
        validate_status(
            learn_doc.get("status"),
            str(learn_path.relative_to(ROOT)),
            errors,
        )
        if learn_doc.get("blockId") not in course_block_ids:
            errors.append(
                f"{learn_path.relative_to(ROOT)}: blockId hors course_map: "
                f"{learn_doc.get('blockId')!r}"
            )

        lessons = learn_doc.get("lessons", [])
        if not isinstance(lessons, list) or not lessons:
            errors.append(f"{learn_path.relative_to(ROOT)}: lessons doit être une liste non vide")
            continue
        lesson_numbers: list[int] = []
        for lesson in lessons:
            if not isinstance(lesson, dict):
                errors.append(f"{learn_path.relative_to(ROOT)}: une leçon n'est pas un objet")
                continue
            require_fields(
                lesson,
                {
                    "id", "number", "title", "objectives", "sections", "causalChain",
                    "commonTrap", "checkpoint", "flashcards", "sources",
                },
                f"leçon {lesson.get('id')}",
                errors,
            )
            lesson_id = lesson.get("id")
            if isinstance(lesson_id, str):
                if lesson_id in lesson_ids:
                    errors.append(f"leçon dupliquée: {lesson_id}")
                lesson_ids.add(lesson_id)
            node_id = lesson.get("nodeId")
            if node_id is not None:
                if node_id not in curriculum_ids:
                    errors.append(f"leçon {lesson_id}: nodeId hors curriculum: {node_id}")
                elif node_id in detailed_node_ids:
                    errors.append(f"nodeId détaillé dupliqué: {node_id}")
                else:
                    detailed_node_ids.add(node_id)
            if isinstance(lesson.get("number"), int):
                lesson_numbers.append(lesson["number"])
            checkpoint = lesson.get("checkpoint", {})
            if not isinstance(checkpoint, dict):
                errors.append(f"leçon {lesson_id}: checkpoint invalide")
            else:
                options = checkpoint.get("options", [])
                answer_index = checkpoint.get("answerIndex")
                if not isinstance(options, list) or len(options) < 3:
                    errors.append(f"leçon {lesson_id}: checkpoint doit avoir au moins 3 options")
                if not isinstance(answer_index, int) or not 0 <= answer_index < len(options):
                    errors.append(f"leçon {lesson_id}: answerIndex invalide")
            if len(lesson.get("flashcards", [])) != 3:
                errors.append(f"leçon {lesson_id}: exactement 3 flashcards requises")
            for source in lesson.get("sources", []):
                if source not in source_ids:
                    errors.append(f"leçon {lesson_id}: source inconnue: {source}")

        if lesson_numbers != list(range(1, len(lessons) + 1)):
            errors.append(
                f"{learn_path.relative_to(ROOT)}: numérotation des leçons non séquentielle"
            )

        for anchor in learn_doc.get("evidenceScope", {}).get("anchors", []):
            if anchor.get("sourceId") not in source_ids:
                errors.append(
                    f"{learn_path.relative_to(ROOT)}: ancre vers source inconnue: "
                    f"{anchor.get('sourceId')}"
                )
            if not anchor.get("locator"):
                errors.append(f"{learn_path.relative_to(ROOT)}: ancre sans locator")

        case_study = learn_doc.get("caseStudy")
        if case_study is not None:
            if not isinstance(case_study, dict):
                errors.append(f"{learn_path.relative_to(ROOT)}: caseStudy invalide")
            else:
                require_fields(
                    case_study,
                    {
                        "id", "title", "status", "dataClassification", "vignette",
                        "decisionPoints", "expectedReasoning", "criticalErrors",
                        "checkpoint", "sources",
                    },
                    f"cas détaillé {case_study.get('id')}",
                    errors,
                )
                validate_status(
                    case_study.get("status"),
                    f"cas détaillé {case_study.get('id')}",
                    errors,
                )
                if case_study.get("dataClassification") != "synthetic":
                    errors.append(
                        f"cas détaillé {case_study.get('id')}: seule une vignette synthetic est admise"
                    )
                case_checkpoint = case_study.get("checkpoint", {})
                case_options = case_checkpoint.get("options", [])
                case_answer = case_checkpoint.get("answerIndex")
                if not isinstance(case_answer, int) or not 0 <= case_answer < len(case_options):
                    errors.append(
                        f"cas détaillé {case_study.get('id')}: answerIndex invalide"
                    )
                for source in case_study.get("sources", []):
                    if source not in source_ids:
                        errors.append(
                            f"cas détaillé {case_study.get('id')}: source inconnue: {source}"
                        )

    graph_ids: set[str] = set()
    for node in graph.get("nodes", []):
        if not isinstance(node, dict):
            errors.append("prerequisite_graph.json: un nœud n'est pas un objet")
            continue
        require_fields(node, {"id", "dependsOn", "unlocks"}, "nœud du graphe", errors)
        node_id = node.get("id")
        if isinstance(node_id, str):
            if node_id in graph_ids:
                errors.append(f"nœud du graphe dupliqué: {node_id}")
            graph_ids.add(node_id)
        for relation in ("dependsOn", "unlocks"):
            for target in node.get(relation, []):
                if target not in curriculum_ids:
                    errors.append(
                        f"graphe {node_id}.{relation}: identifiant hors curriculum: {target}"
                    )

    questions: dict[str, dict[str, Any]] = {}
    for question in questions_doc.get("questions", []):
        if not isinstance(question, dict):
            errors.append("seed_questions.json: une question n'est pas un objet")
            continue
        require_fields(
            question,
            {"id", "diseaseSite", "type", "linkedConcepts", "prompt", "status"},
            "question",
            errors,
        )
        question_id = question.get("id")
        if isinstance(question_id, str):
            if question_id in questions:
                errors.append(f"question dupliquée: {question_id}")
            questions[question_id] = question
        validate_status(question.get("status"), f"question {question_id}", errors)
        for concept in question.get("linkedConcepts", []):
            if concept not in known_concepts:
                errors.append(f"question {question_id}: concept inconnu: {concept}")
        for source in question.get("sources", []):
            if source not in source_ids:
                errors.append(f"question {question_id}: source inconnue: {source}")
        if not question.get("sources"):
            warnings.append(f"question {question_id}: aucune source déclarée")

    cases: dict[str, dict[str, Any]] = {}
    for case in cases_doc.get("cases", []):
        if not isinstance(case, dict):
            errors.append("seed_cases.json: un cas n'est pas un objet")
            continue
        require_fields(case, {"id", "title", "linkedConcepts", "status"}, "cas", errors)
        case_id = case.get("id")
        if isinstance(case_id, str):
            if case_id in cases:
                errors.append(f"cas dupliqué: {case_id}")
            cases[case_id] = case
        validate_status(case.get("status"), f"cas {case_id}", errors)
        for concept in case.get("linkedConcepts", []):
            if concept not in known_concepts:
                errors.append(f"cas {case_id}: concept inconnu: {concept}")
        for source in case.get("sources", []):
            if source not in source_ids:
                errors.append(f"cas {case_id}: source inconnue: {source}")
        if not case.get("sources"):
            warnings.append(f"cas {case_id}: aucune source déclarée")

    first_case_ids = {
        "endometrium": "endo_case_001_lvsi_reasoning",
        "prostate": "prostate_case_001_high_risk_m0",
    }
    first_case_id = first_case_ids.get(site_name)
    first_case = cases.get(first_case_id) if first_case_id else None
    if first_case is None:
        errors.append(f"première boucle: cas {first_case_id!r} absent")
    else:
        require_fields(
            first_case,
            {
                "diseaseSite",
                "learningObjective",
                "availableData",
                "tasks",
                "expectedReasoning",
                "acceptedAnswers",
                "gradingRubric",
                "commonErrors",
                "retestQuestionId",
                "sources",
            },
            f"cas {first_case_id}",
            errors,
        )
        retest = first_case.get("retestQuestionId")
        if retest not in questions:
            errors.append(f"première boucle: question de re-test absente: {retest}")
        axes = first_case.get("gradingRubric", {})
        if len(axes) != 5:
            errors.append(
                "première boucle: gradingRubric doit contenir exactement cinq axes"
            )
        for axis, definition in axes.items():
            if not isinstance(definition, dict) or definition.get("maxScore") != 2:
                errors.append(f"première boucle: axe {axis} doit définir maxScore=2")

    missing_capsules = sorted(curriculum_ids - concept_ids - detailed_node_ids)
    if missing_capsules:
        warnings.append(
            "nœuds curriculaires sans capsule: " + ", ".join(missing_capsules)
        )

    for label, document in (
        ("curriculum", curriculum),
        ("carte du cours", course_map),
        ("graphe", graph),
        ("cas", cases_doc),
        ("questions", questions_doc),
        ("sources", sources_doc),
    ):
        validate_status(document.get("status"), label, errors)

    if review_doc.get("status") != "open":
        warnings.append("file de revue: le statut global n'est pas open")

    for warning in warnings:
        print(f"WARNING: {warning}")
    for error in errors:
        print(f"ERROR: {error}")

    if errors:
        print(
            f"\nValidation échouée: {len(errors)} erreur(s), "
            f"{len(warnings)} avertissement(s)."
        )
        return 1

    print(
        f"\nValidation réussie pour {site_name}: "
        f"{len(cases)} cas, {len(questions)} questions, "
        f"{len(source_ids)} sources, {len(warnings)} avertissement(s)."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
