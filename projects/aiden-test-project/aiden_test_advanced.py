#!/usr/bin/env python3
"""
Advanced Aiden Test Script - Comprehensive testing suite for all projects
"""
import sys
import os
import subprocess
import json
import time
import importlib.util
from datetime import datetime
from pathlib import Path

class AdvancedAidenTest:
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "tests": [],
            "projects": {},
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "warnings": [],
                "errors": []
            }
        }
        self.projects = {
            "Archive-MAM": {
                "path": "Archive-MAM",
                "type": "poker-analyzer",
                "main_files": ["poker_analyzer_app.py", "run_api.py"]
            },
            "poker-trend": {
                "path": "poker-trend", 
                "type": "trend-analyzer",
                "main_files": ["poker_trend_analyzer.log", "enhanced_analyzer.py"]
            },
            "slack-report-automation": {
                "path": "slack-report-automation",
                "type": "typescript-app",
                "main_files": ["package.json", "src/index.ts"]
            },
            "superclaude": {
                "path": "superclaude/SuperClaude",
                "type": "python-package",
                "main_files": ["setup.py", "pyproject.toml"]
            }
        }
        
    def log(self, message, level="INFO"):
        """Log messages with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] [{level}] {message}")
        
    def run_test(self, name, test_func, category="general"):
        """Run a single test and record results"""
        self.log(f"Running test: {name}")
        test_result = {
            "name": name,
            "category": category,
            "status": "UNKNOWN",
            "message": "",
            "duration": 0
        }
        
        start_time = time.time()
        try:
            result, message = test_func()
            test_result["status"] = "PASSED" if result else "FAILED"
            test_result["message"] = message
            
            if result:
                self.results["summary"]["passed"] += 1
                self.log(f"[PASS] {name}: {message}", "SUCCESS")
            else:
                self.results["summary"]["failed"] += 1
                self.log(f"[FAIL] {name}: {message}", "ERROR")
                
        except Exception as e:
            test_result["status"] = "ERROR"
            test_result["message"] = str(e)
            self.results["summary"]["failed"] += 1
            self.results["summary"]["errors"].append({
                "test": name,
                "error": str(e)
            })
            self.log(f"[ERROR] {name}: {str(e)}", "ERROR")
            
        test_result["duration"] = time.time() - start_time
        self.results["tests"].append(test_result)
        self.results["summary"]["total"] += 1
        
    def test_project_exists(self, project_name):
        """Test if a specific project exists"""
        project_info = self.projects.get(project_name)
        if not project_info:
            return False, "Project not defined"
            
        if os.path.exists(project_info["path"]):
            return True, f"Project directory exists at {project_info['path']}"
        else:
            return False, f"Project directory not found at {project_info['path']}"
            
    def test_project_files(self, project_name):
        """Test if project main files exist"""
        project_info = self.projects.get(project_name)
        if not project_info:
            return False, "Project not defined"
            
        missing_files = []
        for file_name in project_info["main_files"]:
            file_path = os.path.join(project_info["path"], file_name)
            if not os.path.exists(file_path):
                missing_files.append(file_name)
                
        if missing_files:
            return False, f"Missing files: {', '.join(missing_files)}"
        else:
            return True, "All main files present"
            
    def test_python_project(self, project_path):
        """Test Python project setup"""
        try:
            # Check for requirements.txt
            req_path = os.path.join(project_path, "requirements.txt")
            if os.path.exists(req_path):
                with open(req_path, 'r', encoding='utf-8', errors='ignore') as f:
                    requirements = f.read()
                return True, "requirements.txt found and readable"
            
            # Check for pyproject.toml (modern Python packaging)
            pyproject_path = os.path.join(project_path, "pyproject.toml")
            if os.path.exists(pyproject_path):
                return True, "pyproject.toml found (modern Python packaging)"
                
            # Check for setup.py (legacy Python packaging)
            setup_path = os.path.join(project_path, "setup.py")
            if os.path.exists(setup_path):
                return True, "setup.py found (legacy Python packaging)"
                
            return False, "No Python dependency file found (requirements.txt, pyproject.toml, or setup.py)"
        except Exception as e:
            return False, f"Error checking Python project: {e}"
            
    def test_node_project(self, project_path):
        """Test Node.js project setup"""
        try:
            # Check for package.json
            pkg_path = os.path.join(project_path, "package.json")
            if os.path.exists(pkg_path):
                with open(pkg_path, 'r') as f:
                    package_data = json.load(f)
                
                # Check if node_modules exists
                modules_path = os.path.join(project_path, "node_modules")
                if os.path.exists(modules_path):
                    return True, "package.json valid and node_modules present"
                else:
                    self.results["summary"]["warnings"].append(
                        f"{project_path}: node_modules not found - run 'npm install'"
                    )
                    return True, "package.json valid but node_modules missing (warning)"
            else:
                return False, "No package.json found"
        except Exception as e:
            return False, f"Error checking Node.js project: {e}"
            
    def test_docker_setup(self):
        """Test if Docker files are present"""
        docker_files = []
        for root, dirs, files in os.walk("."):
            for file in files:
                if file.startswith("Dockerfile") or file == "docker-compose.yml":
                    docker_files.append(os.path.join(root, file))
                    
        if docker_files:
            return True, f"Found {len(docker_files)} Docker-related files"
        else:
            return False, "No Docker files found"
            
    def test_git_repository(self):
        """Test if projects are Git repositories"""
        git_repos = []
        for project_name, project_info in self.projects.items():
            git_path = os.path.join(project_info["path"], ".git")
            if os.path.exists(git_path):
                git_repos.append(project_name)
                
        if git_repos:
            return True, f"Git repositories found: {', '.join(git_repos)}"
        else:
            return False, "No Git repositories found"
            
    def test_executable_scripts(self):
        """Test for executable scripts"""
        scripts = {
            "bat": [],
            "py": [],
            "sh": []
        }
        
        for ext, script_list in scripts.items():
            for root, dirs, files in os.walk("."):
                for file in files:
                    if file.endswith(f".{ext}"):
                        script_list.append(os.path.join(root, file))
                        
        total_scripts = sum(len(s) for s in scripts.values())
        if total_scripts > 0:
            details = f"Found {len(scripts['bat'])} .bat, {len(scripts['py'])} .py, {len(scripts['sh'])} .sh scripts"
            return True, details
        else:
            return False, "No executable scripts found"
            
    def generate_report(self):
        """Generate final test report"""
        self.log("\n" + "="*70)
        self.log("ADVANCED AIDEN TEST REPORT")
        self.log("="*70)
        self.log(f"Total Tests: {self.results['summary']['total']}")
        self.log(f"Passed: {self.results['summary']['passed']}")
        self.log(f"Failed: {self.results['summary']['failed']}")
        
        if self.results['summary']['warnings']:
            self.log("\nWarnings:")
            for warning in self.results['summary']['warnings']:
                self.log(f"  [!] {warning}", "WARNING")
                
        if self.results['summary']['errors']:
            self.log("\nErrors encountered:")
            for error in self.results['summary']['errors']:
                self.log(f"  [X] {error['test']}: {error['error']}", "ERROR")
                
        # Project-specific summary
        self.log("\nProject Status:")
        for project_name in self.projects:
            project_tests = [t for t in self.results['tests'] if project_name in t['name']]
            if project_tests:
                passed = sum(1 for t in project_tests if t['status'] == 'PASSED')
                total = len(project_tests)
                status = "OK" if passed == total else "ISSUES"
                self.log(f"  - {project_name}: {status} ({passed}/{total} tests passed)")
                
        # Save detailed report
        with open('aiden_test_report_advanced.json', 'w') as f:
            json.dump(self.results, f, indent=2)
            
        self.log("\nDetailed report saved to: aiden_test_report_advanced.json")
        
        # Return success if all tests passed
        return self.results['summary']['failed'] == 0
        
    def run_all_tests(self):
        """Run all tests"""
        self.log("Starting Advanced Aiden Test Suite...")
        self.log("="*70)
        
        # General environment tests
        general_tests = [
            ("Python Environment", lambda: (sys.version_info >= (3, 6), f"Python {sys.version.split()[0]}")),
            ("Working Directory", lambda: (os.getcwd().endswith("claude"), f"Current dir: {os.getcwd()}")),
            ("Docker Configuration", self.test_docker_setup),
            ("Git Repositories", self.test_git_repository),
            ("Executable Scripts", self.test_executable_scripts)
        ]
        
        self.log("\n--- General Tests ---")
        for test_name, test_func in general_tests:
            self.run_test(test_name, test_func, "general")
            
        # Project-specific tests
        self.log("\n--- Project-Specific Tests ---")
        for project_name, project_info in self.projects.items():
            # Test project existence
            self.run_test(
                f"{project_name} - Directory Exists",
                lambda pn=project_name: self.test_project_exists(pn),
                project_name
            )
            
            # Test project files
            self.run_test(
                f"{project_name} - Main Files",
                lambda pn=project_name: self.test_project_files(pn),
                project_name
            )
            
            # Type-specific tests
            if project_info["type"] in ["poker-analyzer", "trend-analyzer", "python-package"]:
                self.run_test(
                    f"{project_name} - Python Setup",
                    lambda pp=project_info["path"]: self.test_python_project(pp),
                    project_name
                )
            elif project_info["type"] == "typescript-app":
                self.run_test(
                    f"{project_name} - Node.js Setup",
                    lambda pp=project_info["path"]: self.test_node_project(pp),
                    project_name
                )
                
        # Generate report
        success = self.generate_report()
        
        if success:
            self.log("\n[SUCCESS] ALL TESTS PASSED - All systems operational!", "SUCCESS")
            return 0
        else:
            self.log("\n[FAILURE] SOME TESTS FAILED - Review the report for details", "ERROR")
            return 1

if __name__ == "__main__":
    tester = AdvancedAidenTest()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)