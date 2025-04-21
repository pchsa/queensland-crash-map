# QLD Crashes Database Setup Instructions

-- STEP 1: DOWNLOAD & PREPARE DATA

-- Install required Python libraries from the requirements file
pip install -r requirements.txt
-- Run the Python script to download, process, and save data to GeoPackage files
python download_data.py

-- STEP 2: SETUP DATABASE & ENABLE POSTGIS

-- Connect to the default 'postgres' database as the 'postgres' superuser.
psql -U postgres -d postgres
-- Create the database
CREATE DATABASE qld_crashes;
-- Connect to the new database
\c qld_crashes;
-- Enable the PostGIS extension within the qld_crashes database
CREATE EXTENSION IF NOT EXISTS postgis;
-- Exit psql
\q

-- STEP 3: LOAD DATA INTO DATABASE (using Python)

-- Run this script to load data using SQLAlchemy
python load_to_db.py

