import logging
import os
import sys

import geopandas as gpd
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, ProgrammingError

# --- Basic Logging Configuration ---
log_format = '%(asctime)s - %(levelname)s - %(message)s'
logging.basicConfig(level=logging.INFO, format=log_format)
# To see DEBUG messages, change level=logging.DEBUG

# --- Configuration ---
DB_USER = 'postgres'
DB_PASSWORD = 'password'
DB_HOST = 'localhost'
DB_PORT = '5432'
DB_NAME = 'qld_crashes'

# --- File and Table Mapping ---
FILES_TO_LOAD = [
    ('qld_crashes_processed.gpkg', 'crashes'),
    ('qld_localities_cleaned.gpkg', 'localities'),
]

# --- Target Geometry Column Name ---
TARGET_GEOMETRY_COLUMN_NAME = 'geom'

# --- Load Behavior ---
IF_EXISTS_MODE = 'replace' # 'replace', 'append', 'fail'

# --- Construct Database URL ---
db_url = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
# db_url = f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}" # for psycopg driver

logging.info(f"Attempting to connect to database: {DB_NAME} on {DB_HOST}:{DB_PORT}")

# --- Create SQLAlchemy Engine ---
engine = None
try:
    engine = create_engine(db_url)
    with engine.connect() as connection:
        logging.info("Database connection successful.")
        try:
            result = connection.execute(text("SELECT PostGIS_Version()"))
            pg_version = result.scalar()
            logging.info(f"PostGIS extension found: {pg_version}")
        except (OperationalError, ProgrammingError) as postgis_err:
            logging.error("Could not detect PostGIS extension.", exc_info=False)
            logging.error("Please ensure PostGIS is installed and enabled in your database:")
            logging.error(f"  psql -d {DB_NAME} -c 'CREATE EXTENSION IF NOT EXISTS postgis;'")
            logging.error(f"Original error: {postgis_err}")
            sys.exit(1)

except OperationalError as e:
    logging.error("Database connection failed.", exc_info=True)
    logging.error("Please check your database connection details (host, port, user, password, dbname) and ensure the server is running.")
    sys.exit(1)
except ImportError as e:
    if 'psycopg' in str(e).lower():
         logging.error("Missing PostgreSQL database driver.", exc_info=False)
         logging.error(f"Error detail: {e}")
         logging.error("Please install the required driver:")
         logging.error("  pip install psycopg2-binary")
         logging.error("  OR (for newer SQLAlchemy/psycopg3)")
         logging.error("  pip install psycopg")
    else:
        logging.error("An import error occurred.", exc_info=True)
        logging.error("Please ensure all required libraries (geopandas, sqlalchemy, geoalchemy2) are installed.")
    sys.exit(1)
except Exception as e:
    logging.critical(f"An unexpected error occurred during database engine creation.", exc_info=True)
    sys.exit(1)


# --- Load Data ---
logging.info(f"Starting data loading process (if_exists='{IF_EXISTS_MODE}')...")

for gpkg_file, table_name in FILES_TO_LOAD:
    logging.info(f"Processing file: {gpkg_file} -> Table: {table_name}")

    if not os.path.exists(gpkg_file):
        logging.warning(f"File not found: {gpkg_file}. Skipping.")
        continue

    try:
        # 1. Read GeoPackage file using GeoPandas
        logging.info(f"Reading {gpkg_file}...")
        gdf = gpd.read_file(gpkg_file)
        logging.info(f"Read {len(gdf)} features from {gpkg_file}.")
        logging.debug(f"Original columns: {gdf.columns.tolist()}")

        source_geom_col = gdf.geometry.name
        logging.info(f"Detected geometry column in source file: '{source_geom_col}'")

        # 2. RENAME Geometry Column in GeoDataFrame if necessary
        if source_geom_col != TARGET_GEOMETRY_COLUMN_NAME:
            logging.info(f"Renaming GeoDataFrame geometry column from '{source_geom_col}' to '{TARGET_GEOMETRY_COLUMN_NAME}' before writing to DB.")
            gdf = gdf.rename_geometry(TARGET_GEOMETRY_COLUMN_NAME)
            # Verify rename (optional debug)
            logging.debug(f"GeoDataFrame geometry column is now: '{gdf.geometry.name}'")
        else:
             logging.info(f"GeoDataFrame geometry column is already named '{TARGET_GEOMETRY_COLUMN_NAME}'. No rename needed.")

        # 3. Write to PostGIS using GeoPandas' to_postgis
        logging.info(f"Writing {len(gdf)} features to table '{table_name}'...")
        gdf.to_postgis(
            name=table_name,
            con=engine,
            if_exists=IF_EXISTS_MODE,
            index=False  # Don't write the GeoDataFrame index as a column
            # REMOVED the unsupported 'geometry=' keyword argument
        )
        # The geometry column name used will be gdf.geometry.name, which we ensured is TARGET_GEOMETRY_COLUMN_NAME
        logging.info(f"Successfully loaded data into table '{table_name}' with geometry column '{gdf.geometry.name}'.") # Use gdf.geometry.name here

    except FileNotFoundError:
        logging.error(f"File not found error during processing: {gpkg_file}. Make sure it's accessible.")
    except Exception as e:
        logging.error(f"Failed to load {gpkg_file} into table {table_name}.", exc_info=True)
        # Optionally: stop script on first error
        # logging.critical("Stopping script due to error.")
        # sys.exit(1)

logging.info("Script finished.")