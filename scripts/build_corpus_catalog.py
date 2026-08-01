#!/usr/bin/env python3
"""Build and validate the Academy guideline corpus catalogue.

The JSON manifest is the reviewable source of truth. SQLite is a generated
index used by the application and by update/audit tooling.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / "corpus" / "source_manifest.json"
DEFAULT_CURRICULUM = ROOT / "content" / "master_curriculum.json"
DEFAULT_DATABASE = ROOT / "corpus" / "catalog.sqlite"
DEFAULT_REPORT = ROOT / "corpus" / "catalog_report.json"
DEFAULT_COVERAGE = ROOT / "corpus" / "course_coverage.json"


SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT,
    scope TEXT,
    official_url TEXT
);

CREATE TABLE courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    track_id TEXT NOT NULL,
    track_title TEXT NOT NULL,
    priority INTEGER NOT NULL
);

CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    organization_id TEXT NOT NULL REFERENCES organizations(id),
    jurisdiction TEXT NOT NULL,
    source_type TEXT NOT NULL,
    version_label TEXT,
    publication_date TEXT,
    doi TEXT,
    pmid TEXT,
    isbn TEXT,
    last_verified TEXT NOT NULL,
    canonical_url TEXT NOT NULL,
    access_level TEXT NOT NULL,
    redistribution TEXT NOT NULL,
    use_policy TEXT NOT NULL,
    local_path TEXT,
    media_type TEXT,
    file_size INTEGER,
    sha256 TEXT,
    status TEXT NOT NULL,
    notes TEXT
);

CREATE TABLE document_courses (
    document_id TEXT NOT NULL REFERENCES documents(id),
    course_id TEXT NOT NULL REFERENCES courses(id),
    relevance TEXT NOT NULL,
    PRIMARY KEY (document_id, course_id)
);

CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_document_courses_course ON document_courses(course_id);
"""


def read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def media_type(path: Path) -> str:
    with path.open("rb") as handle:
        header = handle.read(8)
    if header.startswith(b"%PDF-"):
        return "application/pdf"
    if header.lstrip().lower().startswith((b"<!doc", b"<html")):
        return "text/html"
    return "application/octet-stream"


def flatten_courses(curriculum: dict[str, Any]) -> list[dict[str, Any]]:
    titles = curriculum.get("moduleTitles", {})
    rows: list[dict[str, Any]] = []
    for track in curriculum["tracks"]:
        for module_id in track["modules"]:
            rows.append(
                {
                    "id": module_id,
                    "title": titles.get(module_id, module_id.replace("_", " ").title()),
                    "track_id": track["id"],
                    "track_title": track["title"],
                    "priority": track["priority"],
                }
            )
    return rows


def build(
    manifest_path: Path,
    curriculum_path: Path,
    database_path: Path,
    report_path: Path,
    coverage_path: Path,
) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    curriculum = read_json(curriculum_path)
    courses = flatten_courses(curriculum)
    course_ids = {row["id"] for row in courses}
    organization_ids = {row["id"] for row in manifest["organizations"]}

    errors: list[str] = []
    warnings: list[str] = []
    document_ids: set[str] = set()
    normalized_documents: list[dict[str, Any]] = []

    for source in manifest["documents"]:
        document_id = source["id"]
        if document_id in document_ids:
            errors.append(f"duplicate document id: {document_id}")
        document_ids.add(document_id)

        if source["organization_id"] not in organization_ids:
            errors.append(
                f"{document_id}: unknown organization {source['organization_id']}"
            )

        unknown_courses = sorted(set(source["courses"]) - course_ids)
        if unknown_courses:
            errors.append(
                f"{document_id}: unknown courses {', '.join(unknown_courses)}"
            )

        row = dict(source)
        row.setdefault("doi", None)
        row.setdefault("pmid", None)
        row.setdefault("isbn", None)
        local_path = source.get("local_path")
        row["media_type"] = None
        row["file_size"] = None
        row["sha256"] = None
        if local_path:
            absolute = ROOT / local_path
            if not absolute.exists():
                errors.append(f"{document_id}: missing local file {local_path}")
            else:
                detected_type = media_type(absolute)
                row["media_type"] = detected_type
                row["file_size"] = absolute.stat().st_size
                row["sha256"] = sha256(absolute)
                expected_type = source.get("expected_media_type")
                if expected_type and detected_type != expected_type:
                    errors.append(
                        f"{document_id}: expected {expected_type}, got {detected_type}"
                    )
                if (
                    source["access_level"] == "full_text_local"
                    and detected_type != "application/pdf"
                ):
                    errors.append(
                        f"{document_id}: local full text is not a validated PDF"
                    )
        elif source["access_level"] == "full_text_local":
            errors.append(f"{document_id}: full_text_local without local_path")

        if source["status"] == "current" and not source.get("publication_date"):
            warnings.append(f"{document_id}: current source has no publication_date")

        normalized_documents.append(row)

    if errors:
        raise SystemExit("Catalogue validation failed:\n- " + "\n- ".join(errors))

    database_path.parent.mkdir(parents=True, exist_ok=True)
    if database_path.exists():
        database_path.unlink()
    connection = sqlite3.connect(database_path)
    try:
        connection.executescript(SCHEMA)
        connection.executemany(
            "INSERT INTO metadata(key, value) VALUES (?, ?)",
            [
                ("schema_version", manifest["schema_version"]),
                ("manifest_updated", manifest["updated_at"]),
                ("generated_at", datetime.now(timezone.utc).isoformat()),
            ],
        )
        connection.executemany(
            """
            INSERT INTO organizations(id, name, country, scope, official_url)
            VALUES (:id, :name, :country, :scope, :official_url)
            """,
            manifest["organizations"],
        )
        connection.executemany(
            """
            INSERT INTO courses(id, title, track_id, track_title, priority)
            VALUES (:id, :title, :track_id, :track_title, :priority)
            """,
            courses,
        )
        for source in normalized_documents:
            connection.execute(
                """
                INSERT INTO documents(
                    id, title, organization_id, jurisdiction, source_type,
                    version_label, publication_date, doi, pmid, isbn, last_verified,
                    canonical_url, access_level, redistribution, use_policy, local_path,
                    media_type, file_size, sha256, status, notes
                ) VALUES (
                    :id, :title, :organization_id, :jurisdiction, :source_type,
                    :version_label, :publication_date, :doi, :pmid, :isbn,
                    :last_verified, :canonical_url, :access_level, :redistribution,
                    :use_policy, :local_path, :media_type, :file_size, :sha256,
                    :status, :notes
                )
                """,
                source,
            )
            connection.executemany(
                """
                INSERT INTO document_courses(document_id, course_id, relevance)
                VALUES (?, ?, ?)
                """,
                [
                    (source["id"], course_id, source["relevance"])
                    for course_id in source["courses"]
                ],
            )
        connection.commit()
    finally:
        connection.close()

    mapped_course_ids = {
        course_id
        for source in manifest["documents"]
        for course_id in source["courses"]
    }
    core_course_ids = {
        course_id
        for source in manifest["documents"]
        if source["relevance"] == "core"
        for course_id in source["courses"]
    }
    by_access: dict[str, int] = {}
    for source in manifest["documents"]:
        access = source["access_level"]
        by_access[access] = by_access.get(access, 0) + 1

    coverage_by_priority: dict[str, dict[str, int]] = {}
    for priority in sorted({row["priority"] for row in courses}):
        priority_courses = {row["id"] for row in courses if row["priority"] == priority}
        any_source = priority_courses & mapped_course_ids
        core_source = priority_courses & core_course_ids
        coverage_by_priority[str(priority)] = {
            "with_any_source": len(any_source),
            "with_core_source": len(core_source),
            "total": len(priority_courses),
        }

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "schema_version": manifest["schema_version"],
        "organizations": len(manifest["organizations"]),
        "documents": len(manifest["documents"]),
        "local_full_texts": by_access.get("full_text_local", 0),
        "documents_by_access": by_access,
        "courses_total": len(courses),
        "courses_with_any_source": len(mapped_course_ids),
        "courses_with_core_source": len(core_course_ids),
        "coverage_by_priority": coverage_by_priority,
        "courses_without_any_source": sorted(course_ids - mapped_course_ids),
        "courses_without_core_source": sorted(course_ids - core_course_ids),
        "warnings": warnings,
    }
    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    coverage_rows: list[dict[str, Any]] = []
    for course in courses:
        linked = [
            {
                "document_id": source["id"],
                "organization_id": source["organization_id"],
                "relevance": source["relevance"],
                "access_level": source["access_level"],
                "status": source["status"],
            }
            for source in manifest["documents"]
            if course["id"] in source["courses"]
        ]
        core = [row for row in linked if row["relevance"] == "core"]
        if core:
            coverage_status = "core_started"
        elif linked:
            coverage_status = "context_or_discovery_only"
        else:
            coverage_status = "uncovered"
        coverage_rows.append(
            {
                **course,
                "coverage_status": coverage_status,
                "core_document_count": len(core),
                "linked_documents": linked,
            }
        )
    coverage_path.write_text(
        json.dumps(
            {
                "generated_at": report["generated_at"],
                "definition": {
                    "core_started": "At least one core guideline is indexed; exhaustiveness is not implied.",
                    "context_or_discovery_only": "Only context, framework, or discovery sources are indexed.",
                    "uncovered": "No source is indexed yet."
                },
                "courses": coverage_rows,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--curriculum", type=Path, default=DEFAULT_CURRICULUM)
    parser.add_argument("--database", type=Path, default=DEFAULT_DATABASE)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--coverage", type=Path, default=DEFAULT_COVERAGE)
    args = parser.parse_args()
    report = build(
        args.manifest,
        args.curriculum,
        args.database,
        args.report,
        args.coverage,
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
