from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import os

router = APIRouter()


@router.post('/upload-data')
async def upload_data(file: UploadFile = File(...)):
    """Upload a CSV or ZIP to be used as the modeling_ready_data source.

    Saves the file to the project root as `modeling_ready_data.csv` or
    `modeling_ready_data.csv.zip` depending on uploaded filename. Clears
    router-level DataLoader singletons so the next request picks up the new file.
    """
    try:
        project_root = Path(__file__).parent.parent.parent
        filename = Path(file.filename)
        if filename.suffix.lower() == '.zip':
            dest = project_root / 'modeling_ready_data.csv.zip'
        else:
            # default to .csv
            dest = project_root / 'modeling_ready_data.csv'

        # Write uploaded file to destination
        with open(dest, 'wb') as out_f:
            shutil.copyfileobj(file.file, out_f)

        # Try to clear existing router-level data_loader singletons so next request reloads
        try:
            from app.routers import dashboard as dashboard_router
            from app.routers import promotions as promotions_router
            from app.routers import supply_chain as supply_chain_router

            dashboard_router._data_loader = None
            promotions_router._data_loader = None
            supply_chain_router._data_loader = None
        except Exception:
            # Not critical
            pass

        return {"detail": f"Saved data to {dest}", "path": str(dest)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
