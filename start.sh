
#!/bin/bash

echo "════════════════════════════════════════════════════════════════"
echo "   🚀 Starting Student Finance Tracker"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo " Python 3 found"
    echo " Starting server at http://localhost:8000"
    echo ""
    echo " Instructions:"
    echo "   1. Open browser: http://localhost:8000"
    echo "   2. Import seed.json from Settings"
    echo "   3. Explore the app!"
    echo ""
    echo "⏹  Press Ctrl+C to stop the server"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo " Python found"
    echo " Starting server at http://localhost:8000"
    echo ""
    echo " Instructions:"
    echo "   1. Open browser: http://localhost:8000"
    echo "   2. Import seed.json from Settings"
    echo "   3. Explore the app!"
    echo ""
    echo "⏹  Press Ctrl+C to stop the server"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    python -m SimpleHTTPServer 8000
else
    echo " Python not found!"
    echo ""
    echo "Please install Python or use one of these alternatives:"
    echo ""
    echo "Option 1 - Install Python:"
    echo "  https://www.python.org/downloads/"
    echo ""
    echo "Option 2 - Use Node.js (if installed):"
    echo "  npx http-server -p 8000"
    echo ""
    echo "Option 3 - Open directly:"
    echo "  Just double-click index.html"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
fi
