cd ..

# Open uvicorn in a new terminal
osascript -e 'tell app "Terminal" to do script "cd \"'"$(pwd)"'\" && source venv/bin/activate && cd api && uvicorn main:app"'

# Open npm in a new terminal
osascript -e 'tell app "Terminal" to do script "cd \"'"$(pwd)"'\" && npm run dev"'