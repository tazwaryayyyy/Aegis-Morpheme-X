#!/usr/bin/env python
"""
AMX Protocol - Project Verification Script

Comprehensive health check for the Aegis Morpheme-X project.
Validates environment, dependencies, code structure, tests, and documentation.

Usage:
    python scripts/verify_project.py          # Quick check (files + structure)
    python scripts/verify_project.py --full   # Full check (includes test discovery)
"""
import subprocess
import sys
from pathlib import Path


def run_command(cmd, cwd=None, timeout=30):
    """Run a shell command and return success/output"""
    try:
        result = subprocess.run(
            cmd, shell=True, cwd=cwd, capture_output=True,
            text=True, timeout=timeout, check=False
        )
        return result.returncode == 0, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return False, "TIMEOUT"
    except (OSError, subprocess.SubprocessError) as e:
        return False, str(e)


def check(name, condition, details=""):
    """Print check result"""
    status = "[PASS]" if condition else "[FAIL]"
    msg = f"{status} {name}"
    if details and not condition:
        msg += f" - {details}"
    print(msg)
    return condition


def main(full_check=False):
    """Run project verification checks.

    Args:
        full_check: If True, include test discovery (slower)
    """
    # Get the root directory (parent of scripts/)
    root_dir = Path(__file__).parent.parent
    backend_dir = root_dir / "backend"
    frontend_dir = root_dir / "frontend"

    print("\n" + "="*70)
    print("AMX PROTOCOL - PROJECT VERIFICATION")
    if full_check:
        print("MODE: Full (includes test discovery)")
    else:
        print("MODE: Quick (structure check only)")
    print("="*70 + "\n")

    all_passed = True

    # -----------------------------------------------------------------------
    # PHASE 1: ENVIRONMENT & DEPENDENCIES
    # -----------------------------------------------------------------------
    print("[PHASE 1] Environment & Dependency Audit")
    print("-" * 70)

    # Check Python version
    success, _ = run_command("python --version")
    all_passed &= check("Python installed", success)

    # Check Node.js version
    success, _ = run_command("node --version")
    all_passed &= check("Node.js installed", success)

    # Check backend requirements
    success, output = run_command(
        "pip list | findstr fastapi", cwd=str(backend_dir))
    all_passed &= check("FastAPI installed", success or "fastapi" in output)

    # Check frontend dependencies
    success, output = run_command(
        "npm list react --depth=0", cwd=str(frontend_dir), timeout=10)
    all_passed &= check("React installed in frontend", success,
                        output.split('\n')[0] if output else "")

    print()

    # -----------------------------------------------------------------------
    # PHASE 2: BACKEND CODE STRUCTURE
    # -----------------------------------------------------------------------
    print("[PHASE 2] Backend Code Structure")
    print("-" * 70)

    backend_files = [
        backend_dir / "main.py",
        backend_dir / "agents" / "graph.py",
        backend_dir / "agents" / "sentinel.py",
        backend_dir / "agents" / "finance.py",
        backend_dir / "hedera" / "hcs.py",
    ]

    for file_path in backend_files:
        exists = file_path.exists()
        all_passed &= check(f"File exists: {file_path.name}", exists)

    print()

    # -----------------------------------------------------------------------
    # PHASE 3: FRONTEND CODE STRUCTURE
    # -----------------------------------------------------------------------
    print("[PHASE 3] Frontend Code Structure")
    print("-" * 70)

    frontend_files = [
        frontend_dir / "src" / "App.tsx",
        frontend_dir / "src" / "Dashboard.js",
        frontend_dir / "src" / "websocket.js",
    ]

    for file_path in frontend_files:
        exists = file_path.exists()
        all_passed &= check(f"File exists: {file_path.name}", exists)

    print()

    # -----------------------------------------------------------------------
    # PHASE 4: TEST SUITE STATUS (Optional - slow)
    # -----------------------------------------------------------------------
    if full_check:
        print("[PHASE 4] Test Suite Status")
        print("-" * 70)

        success, output = run_command(
            "python -m pytest tests/ --co -q",
            cwd=str(backend_dir),
            timeout=10
        )
        test_count = output.count("test_")
        all_passed &= check(
            f"Backend tests discoverable ({test_count} tests)",
            success and test_count > 0,
            f"Found {test_count} tests"
        )

        success, output = run_command(
            "npm test -- --listTests --passWithNoTests",
            cwd=str(frontend_dir),
            timeout=15
        )
        all_passed &= check("Frontend tests discoverable",
                            "test_" in output or "MorphemeCard" in output)

        print()

    # -----------------------------------------------------------------------
    # PHASE 5: DOCUMENTATION
    # -----------------------------------------------------------------------
    print("[PHASE 5] Documentation")
    print("-" * 70)

    doc_files = [
        root_dir / "README.md",
        root_dir / "CONTRIBUTING.md",
        root_dir / "HEDERA_SETUP.md",
    ]

    for file_path in doc_files:
        exists = file_path.exists()
        all_passed &= check(f"Doc exists: {file_path.name}", exists)

    print()

    # -----------------------------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------------------------
    print("="*70)
    if all_passed:
        print("RESULT: ALL CHECKS PASSED")
        print("Project is healthy and ready for development!")
    else:
        print("RESULT: SOME CHECKS FAILED")
        print("Please fix the issues listed above.")
    print("="*70 + "\n")

    if not full_check:
        print("Tip: Run 'python scripts/verify_project.py --full' for extended checks")
        print()

    return 0 if all_passed else 1


if __name__ == "__main__":
    full_mode = "--full" in sys.argv
    sys.exit(main(full_check=full_mode))
