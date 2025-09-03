#!/usr/bin/env python3
"""
Simple HTTP server to host the Hydropower Calculator locally.
Run this script and navigate to http://localhost:8080 in your browser.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class HydroToolHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

def main():
    print(f"Starting Hydropower Calculator server...")
    print(f"Server will run at http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server")
    
    with socketserver.TCPServer(("", PORT), HydroToolHandler) as httpd:
        print(f"Server started successfully!")
        
        # Automatically open the browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
            print("Opening browser automatically...")
        except:
            print("Could not open browser automatically. Please navigate to the URL above.")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)

if __name__ == "__main__":
    main()
