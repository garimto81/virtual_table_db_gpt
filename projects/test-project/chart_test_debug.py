#!/usr/bin/env python3
"""
Chart debugging test script
"""
import subprocess
import time
import webbrowser
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class ChartDebugTest:
    def __init__(self):
        self.server_process = None
        
    def start_local_server(self):
        """Start local development server for testing"""
        try:
            os.chdir("poker-online-analyze/frontend")
            print("Starting React development server...")
            print("This will take a moment to compile...")
            
            # Start npm start in background
            self.server_process = subprocess.Popen(
                ["npm", "start"],
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait for server to start
            print("Waiting for server to start...")
            time.sleep(15)  # Give React time to compile
            
            print("Opening browser...")
            webbrowser.open("http://localhost:3000")
            
            print("\n" + "="*60)
            print("LOCAL TEST SERVER STARTED")
            print("="*60)
            print("URL: http://localhost:3000")
            print("Check the Charts View tab to see chart type selection buttons")
            print("If buttons are visible locally but not online, it's a deployment issue")
            print("Press Ctrl+C to stop the server")
            print("="*60)
            
            # Keep server running
            try:
                self.server_process.wait()
            except KeyboardInterrupt:
                print("\nStopping server...")
                self.server_process.terminate()
                
        except Exception as e:
            print(f"Error starting local server: {e}")
            return False
            
    def test_build_artifacts(self):
        """Test if build artifacts contain our chart changes"""
        try:
            os.chdir("../../poker-online-analyze/frontend")
            
            # Check if build directory exists
            if not os.path.exists("build"):
                print("❌ Build directory not found. Running build...")
                build_result = subprocess.run(["npm", "run", "build"], 
                                           capture_output=True, text=True)
                if build_result.returncode != 0:
                    print(f"❌ Build failed: {build_result.stderr}")
                    return False
                print("✅ Build completed successfully")
            
            # Check main JS file for our chart type selection code
            js_files = []
            static_js_dir = "build/static/js"
            if os.path.exists(static_js_dir):
                js_files = [f for f in os.listdir(static_js_dir) if f.startswith("main.") and f.endswith(".js")]
            
            if not js_files:
                print("❌ No main JS file found in build")
                return False
                
            main_js_file = os.path.join(static_js_dir, js_files[0])
            
            with open(main_js_file, 'r', encoding='utf-8') as f:
                js_content = f.read()
                
            # Check for chart type selection features
            checks = [
                ("Chart type selection", "chartType" in js_content),
                ("Bar chart", "BarElement" in js_content or "Bar" in js_content),
                ("Stacked configuration", "stacked" in js_content),
                ("Line chart", "LineElement" in js_content or "Line" in js_content),
                ("Chart type buttons", "선형 차트" in js_content or "막대 차트" in js_content),
            ]
            
            print("\n" + "="*60)
            print("BUILD ARTIFACT VERIFICATION")
            print("="*60)
            print(f"Main JS file: {main_js_file}")
            print(f"File size: {len(js_content):,} characters")
            
            all_passed = True
            for check_name, check_result in checks:
                status = "✅ FOUND" if check_result else "❌ MISSING"
                print(f"{status} {check_name}")
                if not check_result:
                    all_passed = False
                    
            if all_passed:
                print("\n✅ All chart features found in build artifacts!")
                print("The deployment should include chart type selection.")
            else:
                print("\n❌ Some chart features missing from build!")
                print("This might be a compilation issue.")
                
            return all_passed
            
        except Exception as e:
            print(f"Error checking build artifacts: {e}")
            return False
            
    def run_debug_test(self):
        """Run comprehensive debugging test"""
        print("CHART TYPE SELECTION DEBUG TEST")
        print("="*60)
        
        # Test 1: Check build artifacts
        build_ok = self.test_build_artifacts()
        
        if build_ok:
            print("\n✅ Build verification passed - starting local test server...")
            self.start_local_server()
        else:
            print("\n❌ Build verification failed - check compilation issues")
            
if __name__ == "__main__":
    tester = ChartDebugTest()
    tester.run_debug_test()