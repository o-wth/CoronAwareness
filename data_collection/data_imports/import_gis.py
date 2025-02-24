import re
import sys
import json
import json_extractor
import upload
import geometry
import requests
import traceback
from defaults import get_defaults

def import_gis(gis_url, table_labels, use_geometry=False, geometry_precision=6):
    query_url = gis_url + "/query?f=geojson&outFields=*&where=1%3D1"

    if use_geometry == True:
        query_url += "&returnGeometry=true&outSR=4326&geometryPrecision=" + str(geometry_precision)
    else:
        query_url += "&returnGeometry=false"
        
    return import_geojson(query_url=query_url, table_labels=table_labels, use_geometry=use_geometry)

def import_geojson(query_url, table_labels, use_geometry=True):
    content = {}

    geojson = requests.get(query_url, timeout=10).json()

    defaults = get_defaults()
    for table in table_labels.keys():
        content[table] = []
        labels = {**defaults[table], **table_labels[table]}
        for feature in geojson['features']:
            row = json_extractor.extract_json_row(feature['properties'], labels)
            if 'geometry' in feature and feature['geometry'] and table == 'location':
                if 'latitude' not in table_labels['location']:
                    lng, lat = geometry.get_center_long_lat(feature['geometry'])
                    row['longitude'] = lng
                    row['latitude'] = lat

            content[table].append(row)
    return content
