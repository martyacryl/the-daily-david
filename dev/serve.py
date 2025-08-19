#!/usr/bin/env python3
"""
Simple Python Development Server for The Daily David
Run this script to serve the development environment locally
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Configuration
PORT = 3001
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to the dev directory
    os.chdir(DIRECTORY)
    
    # Create server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print("🚀 The Daily David - Development Server")
        print("=" * 50)
        print(f"📁 Serving files from: {DIRECTORY}")
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"🔴 This is the DEVELOPMENT environment")
        print(f"📖 Open http://localhost:{PORT} in your browser")
        print(f"⏹️  Press Ctrl+C to stop the server")
        print("=" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Shutting down development server...")
            httpd.shutdown()
            print("✅ Server closed")

if __name__ == "__main__":
    main()
