"""Small helper to inspect which data source the backend DataLoader will use
and print a small preview. Run from the repo root or backend folder.
"""
import os
import sys
from pathlib import Path

# Ensure backend package is on sys.path so 'app' can be imported when running the script
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.data_loader import DataLoader


def main():
    # Allow overriding via DATA_SOURCE env var
    ds = os.getenv('DATA_SOURCE', 'auto')
    print(f"DATA_SOURCE={ds}")

    loader = DataLoader()
    print(f"Resolved data_path: {loader.data_path} (is_zip={loader.is_zip})")

    try:
        df = loader.load_data()
        print(f"Loaded dataframe shape: {df.shape}")
        print("Columns:", list(df.columns))
        print("Preview (first 5 rows):")
        # print first 5 rows safely
        print(df.head(5).to_string(index=False))
    except Exception as e:
        print(f"Error loading data: {e}")


if __name__ == '__main__':
    # Ensure working dir is backend so relative paths resolve similarly to uvicorn
    try:
        main()
    except Exception as exc:
        print('Unhandled error:', exc)
        sys.exit(1)
#!/usr/bin/env python3
"""Simple helper to show which data file DataLoader uses and preview the data.

Run from project root or backend folder. Example (PowerShell):
$env:DATA_SOURCE = 'csv'; Set-Location -Path 'd:\Stormchaser_Datastorm_Submission\backend'; python .\scripts\inspect_data.py
"""
import os
import traceback

try:
    # Import here so the script can be run from the backend folder
    from app.services.data_loader import DataLoader
except Exception:
    # If run from project root, adjust path
    import sys
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, project_root)
    from app.services.data_loader import DataLoader


def main():
    print(f"Inspecting data loader (DATA_SOURCE={os.getenv('DATA_SOURCE', 'auto')})")

    dl = DataLoader()
    print("Data path:", getattr(dl, 'data_path', None))
    print("Is zip:", getattr(dl, 'is_zip', None))

    try:
        df = dl.load_data()
        print("Loaded DataFrame shape:", getattr(df, 'shape', None))
        print("Columns:", list(df.columns) if hasattr(df, 'columns') else None)
        print("\nFirst 10 rows:")
        # Use to_string for readable console output
        try:
            print(df.head(10).to_string(index=False))
        except Exception:
            # Fallback to repr
            print(repr(df.head(10)))
    except Exception as e:
        print("Error while loading data:", str(e))
        traceback.print_exc()


if __name__ == '__main__':
    main()
