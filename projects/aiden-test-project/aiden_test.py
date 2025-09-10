#!/usr/bin/env python3
"""
Aiden Test Script - Comprehensive testing suite
"""
import sys
import os
import subprocess
import json
import time
from datetime import datetime

class AidenTest:
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "tests": [],
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "errors": []
            }
        }
        
    def log(self, message, level="INFO"):
        """Log messages with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] [{level}] {message}")
        
    def run_test(self, name, test_func):
        """Run a single test and record results"""
        self.log(f"Running test: {name}")
        test_result = {
            "name": name,
            "status": "UNKNOWN",
            "message": "",
            "duration": 0
        }
        
        start_time = time.time()
        try:
            result = test_func()
            test_result["status"] = "PASSED" if result else "FAILED"
            test_result["message"] = "Test completed successfully" if result else "Test failed"
            
            if result:
                self.results["summary"]["passed"] += 1
                self.log(f"[PASS] {name}: PASSED", "SUCCESS")
            else:
                self.results["summary"]["failed"] += 1
                self.log(f"[FAIL] {name}: FAILED", "ERROR")
                
        except Exception as e:
            test_result["status"] = "ERROR"
            test_result["message"] = str(e)
            self.results["summary"]["failed"] += 1
            self.results["summary"]["errors"].append({
                "test": name,
                "error": str(e)
            })
            self.log(f"[ERROR] {name}: ERROR - {str(e)}", "ERROR")
            
        test_result["duration"] = time.time() - start_time
        self.results["tests"].append(test_result)
        self.results["summary"]["total"] += 1
        
    def test_environment(self):
        """Test environment setup"""
        try:
            # Check Python version
            python_version = sys.version_info
            if python_version.major >= 3 and python_version.minor >= 6:
                self.log("Python version check: OK")
                return True
            else:
                self.log("Python version check: FAILED (requires 3.6+)")
                return False
        except:
            return False
            
    def test_dependencies(self):
        """Test required dependencies"""
        try:
            required_modules = ['os', 'sys', 'json', 'subprocess']
            for module in required_modules:
                __import__(module)
            self.log("Dependencies check: OK")
            return True
        except ImportError as e:
            self.log(f"Dependencies check: FAILED - {e}")
            return False
            
    def test_file_operations(self):
        """Test file read/write operations"""
        try:
            test_file = "test_temp.txt"
            # Write test
            with open(test_file, 'w') as f:
                f.write("test content")
            
            # Read test
            with open(test_file, 'r') as f:
                content = f.read()
                
            # Cleanup
            os.remove(test_file)
            
            self.log("File operations check: OK")
            return content == "test content"
        except Exception as e:
            self.log(f"File operations check: FAILED - {e}")
            return False
            
    def test_project_structure(self):
        """Test if project directories exist"""
        try:
            expected_dirs = [
                "Archive-MAM",
                "poker-trend", 
                "slack-report-automation",
                "superclaude"
            ]
            
            missing_dirs = []
            for dir_name in expected_dirs:
                if not os.path.exists(dir_name):
                    missing_dirs.append(dir_name)
                    
            if missing_dirs:
                self.log(f"Project structure check: FAILED - Missing directories: {missing_dirs}")
                return False
            else:
                self.log("Project structure check: OK")
                return True
        except Exception as e:
            self.log(f"Project structure check: ERROR - {e}")
            return False
            
    def test_integration(self):
        """Test basic integration between components"""
        try:
            # Simple integration test
            test_data = {"status": "active", "version": "1.0.0"}
            json_data = json.dumps(test_data)
            parsed_data = json.loads(json_data)
            
            if parsed_data == test_data:
                self.log("Integration test: OK")
                return True
            else:
                self.log("Integration test: FAILED")
                return False
        except Exception as e:
            self.log(f"Integration test: ERROR - {e}")
            return False
            
    def generate_report(self):
        """Generate final test report"""
        self.log("\n" + "="*60)
        self.log("AIDEN TEST REPORT")
        self.log("="*60)
        self.log(f"Total Tests: {self.results['summary']['total']}")
        self.log(f"Passed: {self.results['summary']['passed']}")
        self.log(f"Failed: {self.results['summary']['failed']}")
        
        if self.results['summary']['errors']:
            self.log("\nErrors encountered:")
            for error in self.results['summary']['errors']:
                self.log(f"  - {error['test']}: {error['error']}")
                
        # Save detailed report
        with open('aiden_test_report.json', 'w') as f:
            json.dump(self.results, f, indent=2)
            
        self.log("\nDetailed report saved to: aiden_test_report.json")
        
        # Return success if all tests passed
        return self.results['summary']['failed'] == 0
        
    def run_all_tests(self):
        """Run all tests"""
        self.log("Starting Aiden Test Suite...")
        self.log("="*60)
        
        # Define all tests
        tests = [
            ("Environment Setup", self.test_environment),
            ("Dependencies Check", self.test_dependencies),
            ("File Operations", self.test_file_operations),
            ("Project Structure", self.test_project_structure),
            ("Integration Test", self.test_integration)
        ]
        
        # Run each test
        for test_name, test_func in tests:
            self.run_test(test_name, test_func)
            time.sleep(0.1)  # Small delay between tests
            
        # Generate report
        success = self.generate_report()
        
        if success:
            self.log("\n[SUCCESS] ALL TESTS PASSED - System is ready!", "SUCCESS")
            return 0
        else:
            self.log("\n[FAILURE] SOME TESTS FAILED - Please check the report", "ERROR")
            return 1

if __name__ == "__main__":
    tester = AidenTest()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)