from __future__ import annotations

import json
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
