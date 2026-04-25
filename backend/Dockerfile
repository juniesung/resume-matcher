# ── Base image ────────────────────────────────────────────────────────────────
# python:3.11-slim is the official Python 3.11 image built on Debian, but with
# many non-essential system tools stripped out. "slim" images are smaller than
# the default image (~150 MB vs ~900 MB) while still including pip and the C
# runtime that native Python packages (like pdfplumber) need.
FROM python:3.11-slim

# ── Working directory ──────────────────────────────────────────────────────────
# All subsequent commands (COPY, RUN, CMD) resolve paths relative to /app.
# If /app doesn't exist, Docker creates it automatically.
# Using /app is a common convention; you could use /code or /srv — it's arbitrary.
WORKDIR /app

# ── Copy requirements first (layer-cache trick) ────────────────────────────────
# Docker builds each instruction as a separate, cached layer.
# A layer is only re-built when its instruction OR anything it depends on changes.
#
# If we copied ALL code first and then ran pip install, every single code change
# would bust the pip install cache — even changing a comment in main.py would
# trigger a full reinstall of all packages.
#
# By copying requirements.txt alone first, Docker caches the pip install layer
# separately. As long as requirements.txt hasn't changed, Docker reuses the
# cached layer and skips the slow pip install entirely on the next build.
COPY requirements.txt .

# ── Install dependencies ───────────────────────────────────────────────────────
# pip install -r requirements.txt reads every package pinned in requirements.txt
# and installs the exact versions.
#
# --no-cache-dir tells pip NOT to save downloaded wheels to its local cache on
# disk. At runtime we don't need that cache, so omitting it keeps the image
# smaller (pip's cache can be hundreds of MB).
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy application source code ───────────────────────────────────────────────
# Now copy everything else. This layer re-builds on every code change, but the
# expensive pip install layer above stays cached because it comes first.
# The .dockerignore file (in this same folder) controls what gets excluded.
COPY . .

# ── Declare the port ───────────────────────────────────────────────────────────
# EXPOSE is documentation — it tells Docker and anyone reading this file that
# the process inside the container will listen on port 8000.
# It does NOT open the port to the outside world on its own. Port publishing
# happens at runtime via -p 8000:8000 or in docker-compose.yml.
EXPOSE 8000

# ── Start the server ───────────────────────────────────────────────────────────
# CMD is the default command that runs when the container starts.
# We use the exec form (JSON array) rather than the shell form ("uvicorn ..."),
# because the exec form runs uvicorn directly as PID 1, so Docker signals like
# SIGTERM (used by `docker stop`) reach uvicorn immediately for a clean shutdown.
#
#   uvicorn        — the ASGI server that runs FastAPI
#   main:app       — find the FastAPI instance named `app` inside main.py
#   --host 0.0.0.0 — listen on ALL network interfaces, not just 127.0.0.1
#                    Without this, uvicorn only accepts connections from inside
#                    the container itself, so nothing outside could reach it.
#   --port 8000    — the port uvicorn binds to (matching EXPOSE above)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
