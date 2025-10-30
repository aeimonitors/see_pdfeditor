Developer setup — see_pdfeditor

Prerequisites (Windows, PowerShell / pwsh):

- Node.js LTS (>=18)
- Git
- VS Code (recommended) + extensions: ESLint, Prettier, Tailwind CSS IntelliSense
- Python 3.10+ (optional, for backend or running a quick static server)

Quick local steps (PowerShell):

```powershell
# Clone the repo (replace <repo-url>)
git clone <repo-url> d:\Projects\see_pdfeditor
cd d:\Projects\see_pdfeditor

# If prototype uses a static server: use Python's http.server (no install needed if Python is present)
cd prototype
python -m http.server 5173

# Then open http://localhost:5173 in your browser and load a PDF.
```

Notes:
- For full-stack development (if you later add a FastAPI backend), create a Python venv and install requirements.
- We recommend using `pnpm` or `npm` for frontend package management if you scaffold a Next.js app later.
