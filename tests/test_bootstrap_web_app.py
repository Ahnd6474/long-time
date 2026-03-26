from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_package_scripts_and_dependencies_exist() -> None:
    package_json = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))

    assert package_json["scripts"]["dev"] == "vite"
    assert package_json["scripts"]["build"] == "tsc -b && vite build"
    assert package_json["dependencies"]["react"]
    assert package_json["dependencies"]["react-dom"]


def test_source_layout_matches_bootstrap_scope() -> None:
    expected_paths = [
        ROOT / "src" / "components",
        ROOT / "src" / "game",
        ROOT / "src" / "state",
        ROOT / "src" / "styles",
        ROOT / "src" / "tests",
        ROOT / "src" / "App.tsx",
        ROOT / "src" / "main.tsx",
        ROOT / "vite.config.ts",
        ROOT / "index.html",
    ]

    for path in expected_paths:
        assert path.exists(), f"Missing expected bootstrap path: {path}"


def test_frontend_unit_suite_passes() -> None:
    npm_command = "npm.cmd" if sys.platform.startswith("win") else "npm"
    result = subprocess.run(
        [npm_command, "test"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )

    assert result.returncode == 0, f"{result.stdout}\n{result.stderr}"


def test_readme_documents_current_run_and_usage_flow() -> None:
    readme = (ROOT / "README.md").read_text(encoding="utf-8")

    expected_sections = [
        "## Overview",
        "## Stack",
        "## Setup",
        "## Run Locally",
        "## Testing",
        "## Project Structure",
        "## Feature Summary",
        "## Known Limitations",
    ]
    expected_snippets = [
        "web app",
        "npm install",
        "npm run dev",
        "npm run build",
        "npm run preview",
        "npm test",
        "python -m pytest",
        "src/components",
        "src/game",
        "src/state",
        "src/styles",
        "src/tests",
        "tests/",
        "local two-player",
        "legal move",
        "undo",
        "reset board",
        "new game",
        "help modal",
        "no AI opponent",
        "no online play",
        "checkmate",
    ]

    for section in expected_sections:
        assert section in readme, f"README is missing section: {section}"

    for snippet in expected_snippets:
        assert snippet in readme, f"README is missing documented snippet: {snippet}"
