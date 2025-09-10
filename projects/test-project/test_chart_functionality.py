#!/usr/bin/env python3
"""
Chart functionality test script
"""
import subprocess
import time
import webbrowser
import threading
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socketserver

class ChartFunctionalityTest:
    def __init__(self):
        self.server_process = None
        
    def test_build_artifacts(self):
        """Test if our chart functionality is in the build"""
        try:
            os.chdir("poker-online-analyze/frontend")
            
            # Check if build exists
            if not os.path.exists("build"):
                print("[INFO] Build directory not found. Creating build...")
                result = subprocess.run(["npm", "run", "build"], 
                                      capture_output=True, text=True)
                if result.returncode != 0:
                    print(f"[ERROR] Build failed: {result.stderr}")
                    return False
                print("[SUCCESS] Build completed")
            
            # Check main JS file
            js_dir = "build/static/js"
            if os.path.exists(js_dir):
                js_files = [f for f in os.listdir(js_dir) if f.startswith("main.") and f.endswith(".js")]
                if js_files:
                    main_js = os.path.join(js_dir, js_files[0])
                    
                    with open(main_js, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Look for chart-related code (minified)
                    checks = [
                        ("Chart components", "Chart" in content),
                        ("React hooks", "useState" in content or "hooks" in content.lower()),
                        ("Button elements", "button" in content.lower()),
                        ("Chart.js", "chartjs" in content.lower() or "chart" in content.lower()),
                        ("Bar/Line elements", any(x in content.lower() for x in ["bar", "line", "stacked"]))
                    ]
                    
                    print("\n" + "="*50)
                    print("BUILD ARTIFACT ANALYSIS")
                    print("="*50)
                    
                    for check_name, result in checks:
                        status = "[FOUND]" if result else "[MISSING]"
                        print(f"{status} {check_name}")
                    
                    return all(result for _, result in checks[:3])  # Basic React checks
            
            return False
            
        except Exception as e:
            print(f"[ERROR] Build test failed: {e}")
            return False
    
    def start_static_server(self):
        """Start static file server for build directory"""
        try:
            os.chdir("build")
            
            class CustomHandler(SimpleHTTPRequestHandler):
                def end_headers(self):
                    self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                    self.send_header('Pragma', 'no-cache')
                    self.send_header('Expires', '0')
                    super().end_headers()
            
            # Find available port
            port = 8080
            while port < 8090:
                try:
                    with socketserver.TCPServer(("", port), CustomHandler) as httpd:
                        print(f"\n" + "="*50)
                        print("LOCAL TEST SERVER STARTED")
                        print("="*50)
                        print(f"URL: http://localhost:{port}")
                        print("Opening browser...")
                        print("Check for chart type selection buttons!")
                        print("Press Ctrl+C to stop server")
                        print("="*50)
                        
                        # Open browser
                        webbrowser.open(f"http://localhost:{port}")
                        
                        # Start server
                        httpd.serve_forever()
                        break
                except OSError:
                    port += 1
                    continue
            
        except Exception as e:
            print(f"[ERROR] Server start failed: {e}")
            return False
    
    def run_functionality_test(self):
        """Run complete functionality test"""
        print("CHART FUNCTIONALITY TEST")
        print("="*50)
        
        # Test 1: Build artifacts
        print("\n[STEP 1] Checking build artifacts...")
        build_ok = self.test_build_artifacts()
        
        if build_ok:
            print("\n[STEP 2] Starting test server...")
            try:
                self.start_static_server()
            except KeyboardInterrupt:
                print("\n[INFO] Server stopped by user")
        else:
            print("\n[ERROR] Build verification failed")
            
        print("\n[COMPLETED] Test finished")

if __name__ == "__main__":
    os.chdir("C:/claude")
    tester = ChartFunctionalityTest()
    tester.run_functionality_test()