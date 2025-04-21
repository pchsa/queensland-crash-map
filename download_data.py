import io
import logging
import os
import shutil
import tempfile
import zipfile

import geopandas as gpd
import pandas as pd
import requests

# --- Shared Configuration ---
CRS_GDA2020 = "EPSG:7844"
OUTPUT_GEOM_COLUMN_NAME = 'geom' # Explicitly define the target geometry column name

# --- Localities Configuration ---
LOCALITIES_ZIP_URL = "https://spatial-gis.information.qld.gov.au/arcgis/rest/directories/arcgisoutput/QSC_Extract/QSC_Extracted_Data_20250420_220514325118-9388.zip"
LOCALITIES_SHAPEFILE_INTERNAL_PATH = "QSC_Extracted_Data_20250420_220514325118-9388/Locality_Boundaries.shp"
LOCALITIES_OUTPUT_FILENAME = "qld_localities_cleaned.gpkg"
# Define required columns AFTER cleaning but BEFORE final selection/lowercasing
LOCALITIES_CLEANED_COLS = ['locality', 'geometry'] # Use 'geometry' here as it's the standard name before rename

# --- Crashes Configuration ---
CRASHES_CSV_URL = "https://www.data.qld.gov.au/dataset/f3e0ca94-2d7b-44ee-abef-d6b06e9b0729/resource/e88943c0-5968-4972-a15f-38e120d72ec0/download/_1_crash_locations.csv"
CRASHES_COLUMNS_TO_KEEP_ORIGINAL_CASE = [ # Keep original case for initial selection
    'Crash_Ref_Number', 'Crash_Severity', 'Crash_Year', 'Crash_Month',
    'Crash_Day_Of_Week', 'Crash_Hour', 'Crash_Nature', 'Crash_Type',
    'Crash_Longitude', 'Crash_Latitude', 'Crash_Roadway_Feature',
    'Crash_Traffic_Control', 'Crash_Speed_Limit', 'Crash_Road_Surface_Condition',
    'Crash_Atmospheric_Condition', 'Crash_Lighting_Condition'
]
CRASHES_OUTPUT_FILENAME = "qld_crashes_processed.gpkg"

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

# =============================================================================
# Helper Function: Lowercase Columns (except geometry)
# =============================================================================
def lowercase_columns(gdf, geom_col_name):
    """Lowercases all columns in a GeoDataFrame except the specified geometry column."""
    new_columns = {}
    current_geom_name = gdf.geometry.name # Get the actual current geometry column name

    for col in gdf.columns:
        if col == current_geom_name:
            new_columns[col] = geom_col_name # Ensure the target geom name is used
        else:
            new_columns[col] = col.lower()

    gdf.rename(columns=new_columns, inplace=True)
    # Ensure the correct geometry column is still active after rename
    if geom_col_name in gdf.columns and gdf.geometry.name != geom_col_name:
         gdf.set_geometry(geom_col_name, inplace=True)
         logging.debug(f"Re-activated geometry column '{geom_col_name}' after renaming.")
    elif geom_col_name not in gdf.columns:
        logging.warning(f"Target geometry column '{geom_col_name}' not found after renaming columns. Current columns: {gdf.columns.tolist()}")

    return gdf


# =============================================================================
# Helper Function for Localities Data: Download & Extract (Unchanged)
# =============================================================================
def download_and_extract_shapefile(zip_url, internal_shp_path, temp_dir):
    """Downloads a zip file and extracts shapefile components to a temp directory."""
    log_prefix = "[Localities]"
    logging.info(f"{log_prefix} Downloading ZIP...")
    try:
        response = requests.get(zip_url, stream=True)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        logging.error(f"{log_prefix} Failed to download ZIP file: {e}")
        raise

    logging.info(f"{log_prefix} Extracting shapefile components...")
    shapefile_basename = os.path.splitext(os.path.basename(internal_shp_path))[0]
    zip_internal_dir = os.path.dirname(internal_shp_path)
    extracted_shp_path = None
    extracted_files_count = 0

    try:
        with zipfile.ZipFile(io.BytesIO(response.content)) as zip_ref:
            for member in zip_ref.namelist():
                # Adjusted path joining for robustness
                member_parts = member.split('/')
                if len(member_parts) > 1 and member_parts[0] == os.path.basename(zip_internal_dir) and \
                   os.path.splitext(os.path.basename(member))[0] == shapefile_basename:

                    target_filename = os.path.basename(member)
                    target_path = os.path.join(temp_dir, target_filename)

                    # Ensure subdirectories are created if they exist in the zip path
                    os.makedirs(os.path.dirname(target_path), exist_ok=True)

                    with zip_ref.open(member) as source, open(target_path, "wb") as target:
                        shutil.copyfileobj(source, target)
                    extracted_files_count += 1
                    if member.lower().endswith(".shp"):
                        extracted_shp_path = target_path
            if not extracted_shp_path:
                raise FileNotFoundError(f"'{shapefile_basename}.shp' not found within '{zip_internal_dir}' in the zip file.")

            for ext in ['.dbf', '.shx', '.prj']:
                companion_path = os.path.splitext(extracted_shp_path)[0] + ext
                if not os.path.exists(companion_path):
                    logging.warning(f"{log_prefix} Companion file {ext} not found for shapefile at {companion_path}")
        return extracted_shp_path
    except zipfile.BadZipFile:
        logging.error(f"{log_prefix} Downloaded file is not a valid ZIP archive.")
        raise
    except Exception as e:
        logging.error(f"{log_prefix} An error occurred during extraction: {e}")
        raise


# =============================================================================
# Helper Function for Localities Data: Clean Attributes (Unchanged)
# =============================================================================
def clean_locality_attributes(gdf):
    """Cleans the 'locality' column in the localities GeoDataFrame."""
    log_prefix = "[Localities]"
    gdf_cleaned = gdf.copy()
    gdf_cleaned.columns = gdf_cleaned.columns.str.lower()

    required_cols = ['locality', 'adminarean']
    if not all(col in gdf_cleaned.columns for col in required_cols):
        missing = [col for col in required_cols if col not in gdf_cleaned.columns]
        logging.error(f"{log_prefix} GeoDataFrame missing required columns for cleaning: {missing}")
        raise ValueError(f"Missing required columns for cleaning: {missing}")

    if 'locality' not in gdf_cleaned.columns:
        raise ValueError("Required 'locality' column not found before cleaning.")
    original_null_or_empty_mask = gdf_cleaned['locality'].isna() | \
                                  (gdf_cleaned['locality'].astype(str).str.strip() == '')
    num_nulls_or_empty = original_null_or_empty_mask.sum()
    if num_nulls_or_empty > 0:
        logging.info(f"{log_prefix} Found {num_nulls_or_empty} rows with original null or empty locality values.")

    gdf_cleaned['locality'] = gdf_cleaned['locality'].fillna('').astype(str).str.strip()
    gdf_cleaned['adminarean'] = gdf_cleaned['adminarean'].fillna('').astype(str).str.strip()

    locality_counts = gdf_cleaned.groupby('locality')['locality'].transform('size')
    duplicate_mask = (locality_counts > 1) & (gdf_cleaned['locality'] != '')
    duplicate_indices = gdf_cleaned.index[duplicate_mask]
    num_duplicates = len(duplicate_indices)

    if num_duplicates > 0:
        admin_part2 = gdf_cleaned.loc[duplicate_indices, 'adminarean'].str.split(',', n=1, expand=True)[1].fillna('').str.strip()
        admin_part2_cleaned = admin_part2.str.replace(r'\s+\w+$', '', regex=True).str.strip()
        admin_part2_title = admin_part2_cleaned.str.title()
        locality_title = gdf_cleaned.loc[duplicate_indices, 'locality'].str.title()
        new_locality_series = locality_title + ' - ' + admin_part2_title
        new_locality_series[admin_part2_title == ''] = locality_title[admin_part2_title == '']
        gdf_cleaned.loc[duplicate_indices, 'locality'] = new_locality_series
        logging.info(f"{log_prefix} Updated {num_duplicates} duplicate locality names.")

    if num_nulls_or_empty > 0:
        gdf_cleaned.loc[original_null_or_empty_mask, 'locality'] = 'Gulf of Carpentaria'
        logging.info(f"{log_prefix} Assigned 'Gulf of Carpentaria' to {num_nulls_or_empty} originally NULL/empty localities.")

    return gdf_cleaned

# =============================================================================
# Main Processing Function for Localities Data
# =============================================================================
def process_locality_data():
    """Downloads, extracts, cleans, selects columns, renames geometry, lowercases columns, and saves locality boundaries."""
    log_prefix = "[Localities]"
    logging.info("--- Starting Locality Boundary Processing ---")
    temp_dir = None
    success = False
    try:
        temp_dir = tempfile.mkdtemp(prefix="locality_shp_")
        extracted_shp_path = download_and_extract_shapefile(LOCALITIES_ZIP_URL, LOCALITIES_SHAPEFILE_INTERNAL_PATH, temp_dir)

        logging.info(f"{log_prefix} Reading shapefile: {os.path.basename(extracted_shp_path)}")
        gdf_original = gpd.read_file(extracted_shp_path)
        logging.info(f"{log_prefix} Loaded {len(gdf_original)} locality features.")

        if gdf_original.crs is None:
            logging.warning(f"{log_prefix} Original CRS missing. Assuming {CRS_GDA2020}.")
            gdf_original.crs = CRS_GDA2020
        elif gdf_original.crs != CRS_GDA2020:
            logging.info(f"{log_prefix} Reprojecting localities from {gdf_original.crs} to {CRS_GDA2020}...")
            gdf_original = gdf_original.to_crs(CRS_GDA2020)

        cleaned_gdf = clean_locality_attributes(gdf_original)

        # Select final columns (using the names after clean_locality_attributes lowercased them)
        required_final_lower = [col.lower() for col in LOCALITIES_CLEANED_COLS]
        missing_final = [col for col in required_final_lower if col not in cleaned_gdf.columns]
        if missing_final:
             logging.error(f"{log_prefix} Cleaned data missing required output columns: {missing_final}")
             raise ValueError(f"Missing required output columns after cleaning: {missing_final}")
        gdf_selected = cleaned_gdf[required_final_lower].copy()
        gdf_selected.crs = CRS_GDA2020 # Ensure CRS is preserved

        # Rename Geometry Column to the target name
        # The geometry column name at this point should be 'geometry' (lowercase from clean_locality_attributes)
        current_geom_col = gdf_selected.geometry.name
        if not gdf_selected.empty and current_geom_col != OUTPUT_GEOM_COLUMN_NAME:
            logging.info(f"{log_prefix} Renaming geometry column from '{current_geom_col}' to '{OUTPUT_GEOM_COLUMN_NAME}'...")
            gdf_selected = gdf_selected.rename_geometry(OUTPUT_GEOM_COLUMN_NAME)
            if gdf_selected.geometry.name == OUTPUT_GEOM_COLUMN_NAME:
                logging.info(f"{log_prefix} Geometry column successfully renamed to '{gdf_selected.geometry.name}'.")
            else:
                 logging.error(f"{log_prefix} FAILED TO RENAME GEOMETRY COLUMN! Current name: '{gdf_selected.geometry.name}'")
                 raise RuntimeError(f"Failed to rename geometry column to {OUTPUT_GEOM_COLUMN_NAME}")
        elif gdf_selected.geometry.name == OUTPUT_GEOM_COLUMN_NAME:
             logging.info(f"{log_prefix} Geometry column already named '{OUTPUT_GEOM_COLUMN_NAME}'.")
        elif not gdf_selected.empty:
            logging.warning(f"{log_prefix} Could not find geometry column '{current_geom_col}' to rename.")

        # Lowercase all OTHER columns BEFORE saving
        logging.info(f"{log_prefix} Ensuring all non-geometry column names are lowercase...")
        gdf_final = lowercase_columns(gdf_selected, OUTPUT_GEOM_COLUMN_NAME)
        logging.debug(f"{log_prefix} Final columns before saving: {gdf_final.columns.tolist()}")

        # Save Output
        logging.info(f"{log_prefix} Saving {len(gdf_final)} features to GeoPackage: {LOCALITIES_OUTPUT_FILENAME}...")
        if not gdf_final.empty:
            gdf_final.to_file(LOCALITIES_OUTPUT_FILENAME, driver="GPKG")
            success = True
        else:
            logging.warning(f"{log_prefix} Final localities GeoDataFrame is empty. Skipping save.")
            success = True

    except FileNotFoundError as fnf_err:
        logging.error(f"{log_prefix} File not found during processing: {fnf_err}")
    except ValueError as val_err:
         logging.error(f"{log_prefix} Value error (e.g., missing columns): {val_err}")
    except Exception as e:
        logging.exception(f"{log_prefix} An unexpected error occurred: {e}")
    finally:
        if temp_dir and os.path.exists(temp_dir):
            try:
                shutil.rmtree(temp_dir)
            except Exception as e_clean:
                logging.error(f"{log_prefix} Error removing temporary directory {temp_dir}: {e_clean}")
        return success


# =============================================================================
# Main Processing Function for Crash Data
# =============================================================================
def process_crash_data():
    """Downloads, processes, renames geometry, lowercases columns, and saves crash location data."""
    log_prefix = "[Crashes]"
    logging.info("--- Starting Crash Data Processing ---")
    success = False
    try:
        logging.info(f"{log_prefix} Downloading CSV data...")
        df = pd.read_csv(CRASHES_CSV_URL)
        logging.info(f"{log_prefix} Downloaded {len(df)} rows.")

        # Filter Columns using original case names
        missing_cols = [col for col in CRASHES_COLUMNS_TO_KEEP_ORIGINAL_CASE if col not in df.columns]
        if missing_cols:
             logging.error(f"{log_prefix} Source CSV missing required columns: {missing_cols}")
             raise ValueError(f"Missing required columns: {missing_cols}")
        df_selected = df.loc[:, CRASHES_COLUMNS_TO_KEEP_ORIGINAL_CASE].copy()

        # Create Date Column
        try:
            # Ensure year and month are strings for concatenation, handle potential non-string types
            df_selected['Crash_Date'] = pd.to_datetime(
                df_selected['Crash_Year'].astype(str) + '-' + df_selected['Crash_Month'].astype(str),
                format='%Y-%B', errors='coerce'
            )
        except Exception as date_err:
            logging.error(f"{log_prefix} Error converting Year/Month to Date: {date_err}")
            raise
        nat_count = df_selected['Crash_Date'].isna().sum()
        if nat_count > 0:
             logging.warning(f"{log_prefix} {nat_count} rows had invalid date combinations (resulted in NaT).")

        # Filter by Date (>= 2011)
        cutoff_date = pd.to_datetime('2011-01-01')
        df_filtered = df_selected[df_selected['Crash_Date'].notna() & (df_selected['Crash_Date'] >= cutoff_date)].copy()

        # Handle Null Coordinates
        initial_rows = len(df_filtered)
        df_no_null_coords = df_filtered.dropna(subset=['Crash_Longitude', 'Crash_Latitude']).copy()
        rows_dropped = initial_rows - len(df_no_null_coords)
        if rows_dropped > 0:
            logging.info(f"{log_prefix} Removed {rows_dropped} rows due to null coordinates.")

        # Create Geometry
        if df_no_null_coords.empty:
            logging.warning(f"{log_prefix} DataFrame is empty after filtering. No geometry to create.")
            # Create an empty GeoDataFrame with correct CRS and geometry name structure
            gdf_with_geom = gpd.GeoDataFrame(geometry=[], crs=CRS_GDA2020)
            # Manually add the target geometry column if empty
            if OUTPUT_GEOM_COLUMN_NAME not in gdf_with_geom.columns:
                gdf_with_geom[OUTPUT_GEOM_COLUMN_NAME] = None
                gdf_with_geom = gdf_with_geom.set_geometry(OUTPUT_GEOM_COLUMN_NAME)
        else:
            geometry = gpd.points_from_xy(df_no_null_coords['Crash_Longitude'], df_no_null_coords['Crash_Latitude'])
            # Create GeoDataFrame, default geometry name is 'geometry'
            gdf_with_geom = gpd.GeoDataFrame(df_no_null_coords, geometry=geometry, crs=CRS_GDA2020)


        # Rename Geometry Column to the target name
        current_geom_col = gdf_with_geom.geometry.name
        if not gdf_with_geom.empty and current_geom_col != OUTPUT_GEOM_COLUMN_NAME:
             logging.info(f"{log_prefix} Renaming geometry column from '{current_geom_col}' to '{OUTPUT_GEOM_COLUMN_NAME}'...")
             gdf_with_geom = gdf_with_geom.rename_geometry(OUTPUT_GEOM_COLUMN_NAME)
             if gdf_with_geom.geometry.name == OUTPUT_GEOM_COLUMN_NAME:
                  logging.info(f"{log_prefix} Geometry column successfully renamed to '{gdf_with_geom.geometry.name}'.")
             else:
                  logging.error(f"{log_prefix} FAILED TO RENAME GEOMETRY COLUMN! Current name: '{gdf_with_geom.geometry.name}'")
                  raise RuntimeError(f"Failed to rename geometry column to {OUTPUT_GEOM_COLUMN_NAME}")
        elif gdf_with_geom.geometry.name == OUTPUT_GEOM_COLUMN_NAME:
             logging.info(f"{log_prefix} Geometry column already named '{OUTPUT_GEOM_COLUMN_NAME}'.")
        elif not gdf_with_geom.empty:
             logging.warning(f"{log_prefix} Could not find geometry column '{current_geom_col}' to rename.")


        # Lowercase all OTHER columns BEFORE saving
        logging.info(f"{log_prefix} Ensuring all non-geometry column names are lowercase...")
        gdf_final = lowercase_columns(gdf_with_geom, OUTPUT_GEOM_COLUMN_NAME)
        logging.debug(f"{log_prefix} Final columns before saving: {gdf_final.columns.tolist()}")


        # Save Output
        logging.info(f"{log_prefix} Saving {len(gdf_final)} features to GeoPackage: {CRASHES_OUTPUT_FILENAME}...")
        if not gdf_final.empty or (gdf_final.empty and len(gdf_final.columns)>0): # Save even if empty but has columns defined
             # Ensure schema consistency even for empty frames if possible
             gdf_final.to_file(CRASHES_OUTPUT_FILENAME, driver='GPKG')
             success = True
        else:
             logging.warning(f"{log_prefix} Final crashes GeoDataFrame is completely empty (no rows, no columns). Skipping save.")
             # If you want to save an empty file anyway, you might need more complex schema handling here.
             success = True # Count as success if empty is expected


    except pd.errors.EmptyDataError:
        logging.error(f"{log_prefix} Downloaded file from {CRASHES_CSV_URL} is empty or invalid.")
    except requests.exceptions.RequestException as req_err:
         logging.error(f"{log_prefix} Error during download: {req_err}")
    except ValueError as val_err:
        logging.error(f"{log_prefix} Value error (e.g., missing columns): {val_err}")
    except Exception as e:
        logging.exception(f"{log_prefix} An unexpected error occurred: {e}")
    finally:
        return success


# =============================================================================
# Main Execution Orchestration (Unchanged)
# =============================================================================
def main():
    """Runs the processing for both localities and crash datasets."""
    logging.info("===== Starting All Data Processing Pipeline =====")
    results = {}
    results['localities'] = process_locality_data()
    results['crashes'] = process_crash_data()
    logging.info("===== Data Processing Pipeline Finished =====")
    successful_tasks = [k for k, v in results.items() if v]
    failed_tasks = [k for k, v in results.items() if not v]
    if successful_tasks:
         logging.info(f"Successfully processed: {', '.join(successful_tasks)}")
    if failed_tasks:
         logging.error(f"Failed to process: {', '.join(failed_tasks)}")

if __name__ == "__main__":
    main()