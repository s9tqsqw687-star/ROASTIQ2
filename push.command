#!/bin/bash
cd /Users/spencersmith/roastiq
git add .
git commit -m "push all project files"
git push
echo ""
echo "Done! All files pushed to GitHub."
echo "Vercel will redeploy automatically in about 1-2 minutes."
read -p "Press Enter to close..."
