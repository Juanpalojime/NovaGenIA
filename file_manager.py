import os
import shutil
import zipfile
import glob
from typing import List, Optional
from datetime import datetime

DRIVE_MOUNT_PATH = "/content/drive/MyDrive"
DRIVE_OUTPUT_FOLDER = "NovaGen_Outputs"
LOCAL_OUTPUT_FOLDER = "outputs"

def is_drive_mounted() -> bool:
    """Check if Google Drive is mounted."""
    return os.path.exists(DRIVE_MOUNT_PATH)

def ensure_drive_folder():
    """Ensure the output folder exists in Drive."""
    if not is_drive_mounted():
        return None
    
    drive_path = os.path.join(DRIVE_MOUNT_PATH, DRIVE_OUTPUT_FOLDER)
    os.makedirs(drive_path, exist_ok=True)
    return drive_path

def save_to_drive(local_filename: str) -> bool:
    """
    Copy a generated file from local outputs to Google Drive.
    
    Args:
        local_filename: Name of the file in the 'outputs' directory.
        
    Returns:
        True if successful, False otherwise.
    """
    if not is_drive_mounted():
        return False
        
    source_path = os.path.join(LOCAL_OUTPUT_FOLDER, local_filename)
    if not os.path.exists(source_path):
        print(f"⚠️ File to copy not found: {source_path}")
        return False
        
    try:
        drive_path = ensure_drive_folder()
        if not drive_path:
            return False
            
        # Create a day-based subfolder in Drive to organize outputs
        today = datetime.now().strftime("%Y-%m-%d")
        day_folder = os.path.join(drive_path, today)
        os.makedirs(day_folder, exist_ok=True)
        
        destination_path = os.path.join(day_folder, local_filename)
        shutil.copy2(source_path, destination_path)
        print(f"✅ Saved to Drive: {destination_path}")
        return True
    except Exception as e:
        print(f"❌ Error saving to Drive: {e}")
        return False

def create_batch_zip(filenames: List[str]) -> Optional[str]:
    """
    Create a ZIP file containing the specified images.
    
    Args:
        filenames: List of filenames in the 'outputs' directory.
        
    Returns:
        Path to the created ZIP file, or None if failed.
    """
    if not filenames:
        return None
        
    timestamp = int(datetime.now().timestamp())
    zip_filename = f"novagen_batch_{timestamp}.zip"
    zip_path = os.path.join(LOCAL_OUTPUT_FOLDER, zip_filename)
    
    try:
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for filename in filenames:
                file_path = os.path.join(LOCAL_OUTPUT_FOLDER, filename)
                if os.path.exists(file_path):
                    zipf.write(file_path, arcname=filename)
                else:
                    print(f"⚠️ Warning: File not found for ZIP: {filename}")
        
        print(f"📦 Batch ZIP created: {zip_path}")
        return zip_filename
    except Exception as e:
        print(f"❌ Error creating ZIP: {e}")
        return None
