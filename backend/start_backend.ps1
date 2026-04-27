$env:DEBUG = "true"
Set-Location $PSScriptRoot
& ".\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
