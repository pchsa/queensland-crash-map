CREATE DATABASE qld_crashes;
\c qld_crashes;
CREATE EXTENSION postgis;

-- Create table for crash data
CREATE TABLE crashes (
    crash_ref_number TEXT,
    crash_severity TEXT,
    crash_year TEXT,
    crash_month TEXT,
    crash_day_of_week TEXT,
    crash_hour SMALLINT,
    crash_nature TEXT,
    crash_type TEXT,
    crash_longitude DOUBLE PRECISION,
    crash_latitude DOUBLE PRECISION,
    crash_street TEXT,
    crash_street_intersecting TEXT,
    state_road_name TEXT,
    loc_suburb TEXT,
    loc_local_government_area TEXT,
    loc_post_code TEXT,
    loc_police_division TEXT,
    loc_police_district TEXT,
    loc_police_region TEXT,
    loc_queensland_transport_region TEXT,
    loc_main_roads_region TEXT,
    loc_abs_statistical_area_2 TEXT,
    loc_abs_statistical_area_3 TEXT,
    loc_abs_statistical_area_4 TEXT,
    loc_abs_remoteness TEXT,
    loc_state_electorate TEXT,
    loc_federal_electorate TEXT,
    crash_controlling_authority TEXT,
    crash_roadway_feature TEXT,
    crash_traffic_control TEXT,
    crash_speed_limit TEXT,
    crash_road_surface_condition TEXT,
    crash_atmospheric_condition TEXT,
    crash_lighting_condition TEXT,
    crash_road_horiz_align TEXT,
    crash_road_vert_align TEXT,
    crash_dca_code TEXT,
    crash_dca_description TEXT,
    crash_dca_group_description TEXT,
    dca_key_approach_dir TEXT,
    count_casualty_fatality SMALLINT,
    count_casualty_hospitalised SMALLINT,
    count_casualty_medicallytreated SMALLINT,
    count_casualty_minorinjury SMALLINT,
    count_casualty_total SMALLINT,
    count_unit_car SMALLINT,
    count_unit_motorcycle_moped SMALLINT,
    count_unit_truck SMALLINT,
    count_unit_bus SMALLINT,
    count_unit_bicycle SMALLINT,
    count_unit_pedestrian SMALLINT,
    count_unit_other SMALLINT
);

-- load data
\COPY crashes FROM 'C:/Users/pchsa/Downloads/_1_crash_locations.csv' DELIMITER ',' CSV HEADER;

-- add column for geom
ALTER TABLE crashes
ADD COLUMN geom geometry(Point, 7844);
UPDATE crashes
SET geom = ST_SetSRID(ST_MakePoint(crash_longitude, crash_latitude), 7844);

CREATE INDEX crashes_geom_idx ON crashes USING GIST (geom);

-- add column for date
ALTER TABLE crashes
ADD COLUMN crash_date DATE;
UPDATE crashes
SET crash_date = TO_DATE(crash_month || ' ' || crash_year, 'Month YYYY');

CREATE INDEX idx_crash_date ON crashes(crash_date);

-- load suburbs
shp2pgsql -s 7844 -I Locality_Boundaries.shp localities | psql -h localhost -U postgres -d qld_crashes

