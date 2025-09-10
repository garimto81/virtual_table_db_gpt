#!/usr/bin/env python3
"""
Test script to verify stacked area chart implementation
"""
import os
import json
import time
from datetime import datetime

class ChartUpdateTest:
    def __init__(self):
        self.test_results = {
            "timestamp": datetime.now().isoformat(),
            "chart_update": {
                "status": "UNKNOWN",
                "checks": [],
                "issues": []
            }
        }
        
    def log(self, message, level="INFO"):
        """Log messages with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] [{level}] {message}")
        
    def check_file_changes(self):
        """Check if TrendChart.tsx has been updated correctly"""
        chart_file = "poker-online-analyze/frontend/src/components/TrendChart.tsx"
        
        if not os.path.exists(chart_file):
            self.test_results["chart_update"]["issues"].append("TrendChart.tsx file not found")
            return False
            
        with open(chart_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check for required changes
        checks = [
            ("Filler import", "Filler" in content and "from 'chart.js'" in content),
            ("Filler registration", "ChartJS.register" in content and "Filler" in content),
            ("Fill property", "fill:" in content and ("'-1'" in content or "'origin'" in content)),
            ("Stacked scales", "stacked: true" in content),
            ("Background color", "backgroundColor:" in content and "40" in content),
            ("Border width", "borderWidth: 1" in content)
        ]
        
        all_passed = True
        for check_name, check_result in checks:
            self.test_results["chart_update"]["checks"].append({
                "name": check_name,
                "passed": check_result
            })
            if check_result:
                self.log(f"[PASS] {check_name}: PASSED", "SUCCESS")
            else:
                self.log(f"[FAIL] {check_name}: FAILED", "ERROR")
                all_passed = False
                
        return all_passed
        
    def check_build_success(self):
        """Check if the build was successful"""
        build_dir = "poker-online-analyze/frontend/build"
        
        if os.path.exists(build_dir):
            # Check for main files
            main_js = os.path.exists(os.path.join(build_dir, "static/js"))
            main_css = os.path.exists(os.path.join(build_dir, "static/css"))
            index_html = os.path.exists(os.path.join(build_dir, "index.html"))
            
            if main_js and main_css and index_html:
                self.log("[PASS] Build artifacts found", "SUCCESS")
                return True
            else:
                self.log("[FAIL] Build artifacts incomplete", "ERROR")
                self.test_results["chart_update"]["issues"].append("Build artifacts incomplete")
                return False
        else:
            self.log("[FAIL] Build directory not found", "ERROR")
            self.test_results["chart_update"]["issues"].append("Build directory not found")
            return False
            
    def verify_chart_implementation(self):
        """Verify the chart implementation details"""
        # Read the updated file
        chart_file = "poker-online-analyze/frontend/src/components/TrendChart.tsx"
        
        try:
            with open(chart_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                
            # Find the dataset configuration
            in_dataset = False
            fill_config_found = False
            
            for i, line in enumerate(lines):
                if "return {" in line and "label:" in lines[i+1] if i+1 < len(lines) else False:
                    in_dataset = True
                    
                if in_dataset and "fill:" in line:
                    if "index === 0 ? 'origin' : '-1'" in line:
                        fill_config_found = True
                        self.log("[PASS] Correct fill configuration found", "SUCCESS")
                    else:
                        self.log("[FAIL] Incorrect fill configuration", "ERROR")
                        self.test_results["chart_update"]["issues"].append("Fill configuration is not correct for stacking")
                        
            if not fill_config_found:
                self.log("[FAIL] Fill configuration not found", "ERROR")
                self.test_results["chart_update"]["issues"].append("Fill configuration missing")
                return False
                
            return True
            
        except Exception as e:
            self.log(f"[FAIL] Error verifying implementation: {e}", "ERROR")
            self.test_results["chart_update"]["issues"].append(f"Verification error: {str(e)}")
            return False
            
    def run_tests(self):
        """Run all chart update tests"""
        self.log("="*60)
        self.log("CHART UPDATE TEST")
        self.log("="*60)
        
        # Run checks
        file_check = self.check_file_changes()
        build_check = self.check_build_success()
        impl_check = self.verify_chart_implementation()
        
        # Determine overall status
        if file_check and build_check and impl_check:
            self.test_results["chart_update"]["status"] = "PASSED"
            self.log("\n[SUCCESS] Chart has been successfully updated to stacked area chart!", "SUCCESS")
            result_msg = """
[SUCCESS] Chart update completed!

Implemented features:
- Filler plugin added and registered
- Stacked area chart configuration (fill: 'origin' / '-1')
- X-axis, Y-axis stacked options enabled
- 40% transparency background color applied
- Build completed successfully

Charts now display as Stacked Area Charts.
"""
        else:
            self.test_results["chart_update"]["status"] = "FAILED"
            self.log("\n[FAILURE] Chart update has issues", "ERROR")
            result_msg = f"""
[FAILURE] Chart update failed

Issues found:
{chr(10).join('- ' + issue for issue in self.test_results["chart_update"]["issues"])}

Please check the issues above.
"""
            
        print(result_msg)
        
        # Save detailed report
        with open('chart_update_test_report.json', 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
            
        return self.test_results["chart_update"]["status"] == "PASSED"

if __name__ == "__main__":
    tester = ChartUpdateTest()
    success = tester.run_tests()
    exit(0 if success else 1)