#!/usr/bin/env python3
"""
generate_dataset.py
====================
Reproducible generator for the Ripple "Gokul Milk" SAMPLE supply-chain dataset.

Project : Ripple - Intelligent Supply Chain Disruption & Recovery System
Case    : August 2019 Maharashtra floods (Kolhapur / Sangli)

DATA-INTEGRITY RULES ENFORCED BY THIS SCRIPT
--------------------------------------------
* Random values are drawn with a FIXED SEED (SEED = 2019), so re-running this
  script reproduces byte-identical CSV files.
* Every invented record (suppliers, centres, routes, stock, costs, demand,
  coordinates, scenarios) is written with data_source = RECONSTRUCTED_SAMPLE.
  These are NOT actual Gokul Dairy company records, real supplier identities,
  or verified facility locations.
* historical_events.csv contains only publicly documented facts; each row
  carries a real source_url and data_source = VERIFIED_PUBLIC_SOURCE.
  No row claims that a named facility was flooded.

Usage:  python3 generate_dataset.py
"""

from __future__ import annotations

import csv
import math
import os
import random

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SEED = 2019
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

SAMPLE_LABEL = "RECONSTRUCTED_SAMPLE"       # invented sample data
HISTORICAL_LABEL = "VERIFIED_PUBLIC_SOURCE"  # fact backed by a source_url

random.seed(SEED)

# Illustrative district anchor coordinates (public city centroids, jittered).
DISTRICT_ANCHORS = {
    "Kolhapur": (16.7050, 74.2433),
    "Sangli": (16.8524, 74.5678),
    "Satara": (17.6868, 73.9992),
}

# ---------------------------------------------------------------------------
# 1. Suppliers (30) - fictional sample names, labelled RECONSTRUCTED_SAMPLE
# ---------------------------------------------------------------------------
SUPPLIER_NAMES = [
    "Shri Balaji Dairy Farm", "Sai Krupa Milk Producers", "Mahalaxmi Dairy Group",
    "Shanti Sagar Milk Center", "Vitthal Dairy Farm", "Renuka Milk Producers",
    "Gokuleshwar Dairy Farm", "Dnyaneshwar Milk Center", "Sant Sai Dairy Farm",
    "Keshav Milk Producers", "Ambabai Dairy Group", "Bhagwati Dairy Farm",
    "Nanda Milk Producers", "Shivneri Milk Center", "Swarna Dairy Farm",
    "Indrayani Milk Producers", "Krishna Valley Dairy Group", "Tulsi Dairy Farm",
    "Annapurna Milk Center", "Someshwar Dairy Farm", "Sahyadri Milk Producers",
    "Shree Ganesh Milk Producers", "Panchganga Dairy Group", "Trimurti Dairy Farm",
    "Yashoda Milk Center", "Sahyadri Dairy Farm", "Shubham Milk Producers",
    "Rajmata Dairy Group", "Prasanna Milk Center", "Shree Ram Dairy Farm",
]

SUPPLIER_DISTRIBUTION = [
    ("Kolhapur", [
        "Kagal", "Panhala", "Gadhinglaj", "Ajra", "Hatkanangale", "Shirol",
        "Radhanagari", "Bhudargad", "Chandgad", "Gargoti", "Karveer",
        "Kolhapur Rural", "Shivapur", "Ardagad",
    ]),
    ("Sangli", [
        "Miraj", "Tasgaon", "Atpadi", "Jath", "Shirala", "Kavathemahankal",
        "Mangalvedhe", "Vita", "Kadegaon", "Sangli Rural",
    ]),
    ("Satara", [
        "Karad", "Wai", "Mahabaleshwar", "Phaltan", "Lonand", "Satara Rural",
    ]),
]

# ---------------------------------------------------------------------------
# 2. Network topology (fixed, so relationships are valid by construction)
# ---------------------------------------------------------------------------
CC_PLAN = [
    ("CC-01", "Kolhapur Central Collection Centre (Sample)", "Kolhapur"),
    ("CC-02", "Kolhapur West Collection Centre (Sample)", "Kolhapur"),
    ("CC-03", "Karveer Collection Centre (Sample)", "Kolhapur"),
    ("CC-04", "Kolhapur South Collection Centre (Sample)", "Kolhapur"),
    ("CC-05", "Sangli Central Collection Centre (Sample)", "Sangli"),
    ("CC-06", "Sangli East Collection Centre (Sample)", "Sangli"),
    ("CC-07", "Sangli West Collection Centre (Sample)", "Sangli"),
    ("CC-08", "Sangli North Collection Centre (Sample)", "Sangli"),
    ("CC-09", "Satara Collection Centre (Sample)", "Satara"),
    ("CC-10", "Satara South Collection Centre (Sample)", "Satara"),
]

CH_PLAN = [
    ("CH-01", "Kolhapur Chilling Centre-1 (Sample)", "Kolhapur"),
    ("CH-02", "Kolhapur Chilling Centre-2 (Sample)", "Kolhapur"),
    ("CH-03", "Sangli Chilling Centre-1 (Sample)", "Sangli"),
    ("CH-04", "Sangli Chilling Centre-2 (Sample)", "Sangli"),
    ("CH-05", "Satara Chilling Centre-1 (Sample)", "Satara"),
]

PL_PLAN = [
    ("PL-01", "Kolhapur Dairy Processing Plant (Sample)", "Kolhapur"),
    ("PL-02", "Sangli Dairy Processing Plant (Sample)", "Sangli"),
]

CC_TO_CH = {
    "CC-01": "CH-01", "CC-02": "CH-01", "CC-03": "CH-02", "CC-04": "CH-02",
    "CC-05": "CH-03", "CC-06": "CH-03", "CC-07": "CH-04", "CC-08": "CH-04",
    "CC-09": "CH-05", "CC-10": "CH-05",
}

CH_TO_PL = {
    "CH-01": "PL-01", "CH-02": "PL-01", "CH-05": "PL-01",
    "CH-03": "PL-02", "CH-04": "PL-02",
}

# District of every collection centre (used for supplier round-robin feeding).
CC_DISTRICT = {cid: dist for cid, _name, dist in CC_PLAN}
CH_DISTRICT = {cid: dist for cid, _name, dist in CH_PLAN}
PL_DISTRICT = {cid: dist for cid, _name, dist in PL_PLAN}

# Round-robin: each district's suppliers feed that district's centres.
DISTRICT_CCS = {}
for cid, _name, dist in CC_PLAN:
    DISTRICT_CCS.setdefault(dist, []).append(cid)

# ---------------------------------------------------------------------------
# 3. Transport route specifications
#    (route_id, origin, destination, distance range km, speed km/h, flood risk)
#    First-mile supplier pickup is represented by connected_supplier_ids in
#    collection_centres.csv; transport_routes.csv models the bulk legs.
# ---------------------------------------------------------------------------
ROUTE_SPECS = [
    ("RT-001", "CC-01", "CH-01", (8, 24), 35, "high"),
    ("RT-002", "CC-02", "CH-01", (10, 26), 35, "high"),
    ("RT-003", "CC-03", "CH-02", (8, 22), 35, "medium"),
    ("RT-004", "CC-04", "CH-02", (11, 28), 35, "high"),
    ("RT-005", "CC-05", "CH-03", (9, 25), 35, "high"),
    ("RT-006", "CC-06", "CH-03", (10, 24), 35, "high"),
    ("RT-007", "CC-07", "CH-04", (8, 20), 35, "medium"),
    ("RT-008", "CC-08", "CH-04", (12, 27), 35, "medium"),
    ("RT-009", "CC-09", "CH-05", (9, 23), 35, "medium"),
    ("RT-010", "CC-10", "CH-05", (10, 25), 35, "low"),
    ("RT-011", "CH-01", "PL-01", (12, 30), 40, "medium"),
    ("RT-012", "CH-02", "PL-01", (14, 34), 40, "medium"),
    ("RT-013", "CH-05", "PL-01", (85, 105), 45, "medium"),
    ("RT-014", "CH-03", "PL-02", (10, 28), 40, "high"),
    ("RT-015", "CH-04", "PL-02", (12, 32), 40, "medium"),
    ("RT-016", "PL-01", "DC-01", (10, 22), 35, "medium"),
    ("RT-017", "PL-01", "DC-03", (228, 245), 50, "medium"),
    ("RT-018", "PL-02", "DC-02", (30, 50), 40, "high"),
    ("RT-019", "PL-02", "DC-04", (375, 400), 55, "medium"),
    ("RT-020", "PL-02", "DC-03", (232, 250), 50, "low"),
]

# ---------------------------------------------------------------------------
# 4. Distribution centres (4 cities)
# ---------------------------------------------------------------------------
DC_PLAN = [
    ("DC-01", "Kolhapur", "Kolhapur", "high"),
    ("DC-02", "Sangli", "Sangli", "high"),
    ("DC-03", "Pune", "Pune", "medium"),
    ("DC-04", "Mumbai", "Mumbai", "medium"),
]
# Demand shares of daily processed output (sums to 0.95 -> buffer remains).
DC_DEMAND_SHARE = {
    "DC-01": 0.23, "DC-02": 0.15, "DC-03": 0.26, "DC-04": 0.31,
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def write_csv(filename, rows, fieldnames):
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return path


def round_up(value, multiple):
    return int(math.ceil(value / float(multiple))) * multiple


# ---------------------------------------------------------------------------
# Build: suppliers
# ---------------------------------------------------------------------------
suppliers = []
idx = 1
for district, villages in SUPPLIER_DISTRIBUTION:
    for village in villages:
        suppliers.append({
            "supplier_id": "SUP-%02d" % idx,
            "supplier_name": SUPPLIER_NAMES[idx - 1],
            "district": district,
            "village": village,
            "milk_type": random.choice(["Cow", "Buffalo", "Mixed"]),
            "daily_supply_litres": random.randint(1800, 5500),
            "reliability_score": "%.2f" % random.uniform(0.72, 0.98),
            "status": "active",
            "data_source": SAMPLE_LABEL,
        })
        idx += 1

assert len(suppliers) == 30, "expected 30 suppliers"

# ---------------------------------------------------------------------------
# Build: collection centres (capacity derived from connected supply)
# ---------------------------------------------------------------------------
supplier_by_id = {s["supplier_id"]: s for s in suppliers}
cc_connected = {cid: [] for cid, _n, _d in CC_PLAN}
district_cursor = {dist: 0 for dist in DISTRICT_CCS}

for sup in suppliers:
    centres = DISTRICT_CCS[sup["district"]]
    cid = centres[district_cursor[sup["district"]] % len(centres)]
    district_cursor[sup["district"]] += 1
    cc_connected[cid].append(sup["supplier_id"])

collection_centres = []
for cid, name, dist in CC_PLAN:
    total = sum(supplier_by_id[s]["daily_supply_litres"] for s in cc_connected[cid])
    lat, lon = DISTRICT_ANCHORS[dist]
    collection_centres.append({
        "centre_id": cid,
        "centre_name": name,
        "district": dist,
        "latitude": round(lat + random.uniform(-0.12, 0.12), 4),
        "longitude": round(lon + random.uniform(-0.14, 0.14), 4),
        "daily_collection_capacity": round_up(total * random.uniform(1.3, 1.6), 500),
        "current_collection": total,
        "connected_supplier_ids": ";".join(cc_connected[cid]),
        "status": "operational",
        "data_source": SAMPLE_LABEL,
    })

cc_current = {r["centre_id"]: r["current_collection"] for r in collection_centres}
cc_ids_by_ch = {cid: [] for cid, _n, _d in CH_PLAN}
for cc, ch in CC_TO_CH.items():
    cc_ids_by_ch[ch].append(cc)

# ---------------------------------------------------------------------------
# Build: chilling centres (stock <= capacity by construction)
# ---------------------------------------------------------------------------
chilling_centres = []
for ch_id, name, dist in CH_PLAN:
    inflow = sum(cc_current[cc] for cc in cc_ids_by_ch[ch_id])
    capacity = round_up(inflow * random.uniform(1.5, 1.9), 1000)
    stock = int(round(inflow * random.uniform(0.45, 0.68) / 100.0)) * 100
    chilling_centres.append({
        "chilling_id": ch_id,
        "centre_name": name,
        "district": dist,
        "storage_capacity_litres": capacity,
        "current_stock_litres": stock,
        "connected_collection_centres": ";".join(cc_ids_by_ch[ch_id]),
        "status": "operational",
        "data_source": SAMPLE_LABEL,
    })

ch_inflow = {}
for row in chilling_centres:
    inflow = sum(cc_current[cc] for cc in row["connected_collection_centres"].split(";"))
    ch_inflow[row["chilling_id"]] = inflow

ch_ids_by_pl = {pid: [] for pid, _n, _d in PL_PLAN}
for ch, pl in CH_TO_PL.items():
    ch_ids_by_pl[pl].append(ch)

# ---------------------------------------------------------------------------
# Build: processing plants (capacity >= feed, utilisation <= 100%)
# ---------------------------------------------------------------------------
processing_plants = []
plant_processed = {}
for pl_id, name, dist in PL_PLAN:
    feed = sum(ch_inflow[ch] for ch in ch_ids_by_pl[pl_id])
    capacity = round_up(feed * random.uniform(1.12, 1.30), 1000)
    processed = feed * random.uniform(0.90, 0.97)
    plant_processed[pl_id] = processed
    processing_plants.append({
        "plant_id": pl_id,
        "plant_name": name,
        "district": dist,
        "processing_capacity_litres_per_day": capacity,
        "current_capacity_utilisation": round(processed / capacity * 100.0, 1),
        "connected_chilling_centres": ";".join(ch_ids_by_pl[pl_id]),
        "status": "operational",
        "data_source": SAMPLE_LABEL,
    })

total_processed = sum(plant_processed.values())

# ---------------------------------------------------------------------------
# Build: distribution centres (demand derived from processed output)
# ---------------------------------------------------------------------------
distribution_centres = []
for did, city, dist, priority in DC_PLAN:
    demand = int(total_processed * DC_DEMAND_SHARE[did] / 500.0) * 500
    stock = int(demand * random.uniform(0.35, 0.72) / 50.0) * 50
    distribution_centres.append({
        "distribution_id": did,
        "city": city,
        "district": dist,
        "daily_demand_litres": demand,
        "current_stock_litres": stock,
        "priority": priority,
        "data_source": SAMPLE_LABEL,
    })

# ---------------------------------------------------------------------------
# Build: transport routes
# ---------------------------------------------------------------------------
transport_routes = []
for rid, origin, dest, dist_range, speed, risk in ROUTE_SPECS:
    distance = random.randint(dist_range[0], dist_range[1])
    travel_hours = round(max(distance / float(speed), 0.5), 1)
    cost_inr = int(round((800 + 45 * distance) / 100.0)) * 100
    transport_routes.append({
        "route_id": rid,
        "origin_id": origin,
        "destination_id": dest,
        "distance_km": distance,
        "estimated_travel_time_hours": travel_hours,
        "transport_cost": cost_inr,
        "flood_risk_level": risk,
        "route_status": "operational",
        "data_source": SAMPLE_LABEL,
    })

# ---------------------------------------------------------------------------
# Build: historical events - VERIFIED facts only, each with a source_url.
# ---------------------------------------------------------------------------
historical_events = [
    {
        "event_id": "HE-01",
        "event_name": "Extreme monsoon rainfall over the Krishna basin",
        "event_date": "2019-07-27",
        "affected_region": "Sangli, Kolhapur and Satara districts, Maharashtra",
        "disruption_type": "extreme_rainfall",
        "historical_description": (
            "Mongabay India reported that Sangli, Kolhapur and Satara districts "
            "received 1,918 mm of rainfall against a normal average of 333 mm "
            "during the late-July to August 2019 spell, seeding the Krishna "
            "basin flood situation."
        ),
        "source_url": "https://india.mongabay.com/2024/06/the-forgotten-victims-of-maharashtras-2019-floods",
        "data_source": HISTORICAL_LABEL,
    },
    {
        "event_id": "HE-02",
        "event_name": "Panchganga crosses danger mark at Kolhapur",
        "event_date": "2019-08-03",
        "affected_region": "Kolhapur city and Panchganga river belt, Maharashtra",
        "disruption_type": "river_flooding",
        "historical_description": (
            "The Maharashtra Water Resources Department Krishna sub-basin "
            "report records that the Panchganga at Rajaram K.T. weir, Kolhapur, "
            "exceeded its danger level of 543.30 m on 3 August 2019; the report "
            "states the Kolhapur city area remained inundated from 3 to 14 August 2019."
        ),
        "source_url": "https://wrd.maharashtra.gov.in/Upload/PDF/Vol%201%20Main%20Report.pdf",
        "data_source": HISTORICAL_LABEL,
    },
    {
        "event_id": "HE-03",
        "event_name": "Krishna crosses danger mark at Irwin Bridge, Sangli",
        "event_date": "2019-08-05",
        "affected_region": "Sangli city and Krishna river belt, Maharashtra",
        "disruption_type": "river_flooding",
        "historical_description": (
            "The Maharashtra Water Resources Department report records that the "
            "Krishna at Irwin Bridge, Sangli, exceeded its danger level of "
            "540.77 m on 5 August 2019 and reached a maximum level of 544.57 m "
            "on 9 August 2019, receding below danger level from 14 August 2019."
        ),
        "source_url": "https://wrd.maharashtra.gov.in/Upload/PDF/Vol%201%20Main%20Report.pdf",
        "data_source": HISTORICAL_LABEL,
    },
    {
        "event_id": "HE-04",
        "event_name": "NH-4 damaged by landslide at Karnataka-Maharashtra border",
        "event_date": "2019-08-05",
        "affected_region": "NH-4 corridor (Pune-Bengaluru highway)",
        "disruption_type": "transport_disruption",
        "historical_description": (
            "The New Indian Express reported that a vast stretch of NH-4 "
            "connecting Pune and Bengaluru was badly damaged by a landslide "
            "caused by incessant rain on the Karnataka-Maharashtra border, "
            "a key western freight corridor."
        ),
        "source_url": "https://www.newindianexpress.com/cities/bengaluru/2019/Aug/05/national-highway-4-between-pune-bengaluru-damaged-2014648.html",
        "data_source": HISTORICAL_LABEL,
    },
    {
        "event_id": "HE-05",
        "event_name": "Mass evacuation in Sangli and Kolhapur",
        "event_date": "2019-08-07",
        "affected_region": "Sangli and Kolhapur districts, Maharashtra",
        "disruption_type": "evacuation",
        "historical_description": (
            "Wikipedia's chronology of 2019 in India records that over 132,000 "
            "people were evacuated in Sangli and Kolhapur districts on 7 August "
            "2019 due to heavy rain and rising rivers."
        ),
        "source_url": "https://en.wikipedia.org/wiki/2019_in_India",
        "data_source": HISTORICAL_LABEL,
    },
    {
        "event_id": "HE-06",
        "event_name": "Krishna, Warna and Panchganga breach Highest Flood Levels",
        "event_date": "2019-08-08",
        "affected_region": "Kurundwad, Arjunwad, Samdoli and Terwad (Kolhapur-Sangli reach)",
        "disruption_type": "river_flooding",
        "historical_description": (
            "Scroll.in reported that on 8 August 2019 the Krishna breached its "
            "Highest Flood Level at Kurundwad and Arjunwad, and that the Warna "
            "and Panchganga rivers also crossed their Highest Flood Levels at "
            "Samdoli and Terwad."
        ),
        "source_url": "https://scroll.in/article/943463/in-photos-the-long-lasting-effects-of-the-great-maharashtrian-deluge-of-2019",
        "data_source": HISTORICAL_LABEL,
    },
    {
        "event_id": "HE-07",
        "event_name": "Multi-agency rescue and relief deployment",
        "event_date": "2019-08-09",
        "affected_region": "Flood-affected districts of Maharashtra",
        "disruption_type": "emergency_response",
        "historical_description": (
            "Wikipedia's article on the 2019 Indian floods states that 70 teams "
            "comprising NDRF, Navy, Coast Guard and SDRF personnel were deployed, "
            "and that about 400,000 people were evacuated in western Maharashtra."
        ),
        "source_url": "https://en.wikipedia.org/wiki/2019_Indian_floods",
        "data_source": HISTORICAL_LABEL,
    },
    {
        "event_id": "HE-08",
        "event_name": "NH-4 closed, vehicles stranded during flood peak",
        "event_date": "2019-08-10",
        "affected_region": "NH-4 corridor, western Maharashtra",
        "disruption_type": "transport_disruption",
        "historical_description": (
            "India Today reported on 10 August 2019 that the NH-4 "
            "(Mumbai-Bengaluru national highway) was closed after a landslide, "
            "stranding about 18,000 vehicles on the highway."
        ),
        "source_url": "https://www.indiatoday.in/india/story/monsoon-floods-kerala-karnataka-maharashtra-gujarat-madhya-pradesh-1579318-2019-08-10",
        "data_source": HISTORICAL_LABEL,
    },
    {
        "event_id": "HE-09",
        "event_name": "Over four lakh moved to safety, water receding",
        "event_date": "2019-08-11",
        "affected_region": "Sangli and Kolhapur districts, Maharashtra",
        "disruption_type": "recovery",
        "historical_description": (
            "The New Indian Express reported that over four lakh people had been "
            "moved to safety and that water was receding in Sangli and Kolhapur."
        ),
        "source_url": "https://www.newindianexpress.com/nation/2019/Aug/11/maharashtra-floods-over-four-lakh-people-moved-to-safety-water-receding-in-sangli-and-kolhapur-2017334.html",
        "data_source": HISTORICAL_LABEL,
    },
    {
        "event_id": "HE-10",
        "event_name": "Aerial survey and displacement survey of affected districts",
        "event_date": "2019-08-11",
        "affected_region": "Kolhapur and Sangli districts, Maharashtra",
        "disruption_type": "administrative_response",
        "historical_description": (
            "FloodList reported that Union Home Minister Amit Shah carried out "
            "an aerial survey of the flood-affected areas of Kolhapur and Sangli "
            "on 11 August 2019, and that flooding in Maharashtra had affected "
            "761 villages and displaced over 400,000 people."
        ),
        "source_url": "https://floodlist.com/asia/india-kerala-karnataka-maharashtra-gujarat-floods-august-2019",
        "data_source": HISTORICAL_LABEL,
    },
    {
        "event_id": "HE-11",
        "event_name": "River levels recede below danger marks",
        "event_date": "2019-08-14",
        "affected_region": "Kolhapur and Sangli river observation points, Maharashtra",
        "disruption_type": "recovery",
        "historical_description": (
            "The Maharashtra Water Resources Department report records that "
            "water levels at Irwin Bridge (Sangli) and Rajaram K.T. weir "
            "(Kolhapur) started receding below their danger levels from "
            "14 August 2019."
        ),
        "source_url": "https://wrd.maharashtra.gov.in/Upload/PDF/Vol%201%20Main%20Report.pdf",
        "data_source": HISTORICAL_LABEL,
    },
]

# ---------------------------------------------------------------------------
# Build: disruption scenarios - reconstructed simulations, clearly labelled
# ---------------------------------------------------------------------------
disruption_scenarios = [
    {
        "scenario_id": "DS-01",
        "scenario_name": "Flood blocks a milk transport route",
        "affected_region": "Kolhapur district, Maharashtra",
        "disruption_type": "route_blockage",
        "affected_node_ids": "RT-002",
        "disruption_start": "2019-08-07T06:00:00+05:30",
        "disruption_duration_hours": 36,
        "capacity_reduction_percentage": 100,
        "data_source": SAMPLE_LABEL,
    },
    {
        "scenario_id": "DS-02",
        "scenario_name": "Collection centre temporarily unavailable",
        "affected_region": "Sangli district, Maharashtra",
        "disruption_type": "facility_outage",
        "affected_node_ids": "CC-05",
        "disruption_start": "2019-08-08T05:30:00+05:30",
        "disruption_duration_hours": 18,
        "capacity_reduction_percentage": 100,
        "data_source": SAMPLE_LABEL,
    },
    {
        "scenario_id": "DS-03",
        "scenario_name": "Chilling centre loses operating capacity",
        "affected_region": "Kolhapur district, Maharashtra",
        "disruption_type": "capacity_loss",
        "affected_node_ids": "CH-02",
        "disruption_start": "2019-08-08T09:00:00+05:30",
        "disruption_duration_hours": 24,
        "capacity_reduction_percentage": 70,
        "data_source": SAMPLE_LABEL,
    },
    {
        "scenario_id": "DS-04",
        "scenario_name": "Multiple transport routes become unavailable",
        "affected_region": "Kolhapur-Sangli corridor, Maharashtra",
        "disruption_type": "multi_route_closure",
        "affected_node_ids": "RT-005;RT-006;RT-014",
        "disruption_start": "2019-08-09T06:00:00+05:30",
        "disruption_duration_hours": 48,
        "capacity_reduction_percentage": 100,
        "data_source": SAMPLE_LABEL,
    },
]

# ---------------------------------------------------------------------------
# Write all CSV files
# ---------------------------------------------------------------------------
files = {}

files["suppliers.csv"] = write_csv(
    "suppliers.csv", suppliers,
    ["supplier_id", "supplier_name", "district", "village", "milk_type",
     "daily_supply_litres", "reliability_score", "status", "data_source"])

files["collection_centres.csv"] = write_csv(
    "collection_centres.csv", collection_centres,
    ["centre_id", "centre_name", "district", "latitude", "longitude",
     "daily_collection_capacity", "current_collection",
     "connected_supplier_ids", "status", "data_source"])

files["chilling_centres.csv"] = write_csv(
    "chilling_centres.csv", chilling_centres,
    ["chilling_id", "centre_name", "district", "storage_capacity_litres",
     "current_stock_litres", "connected_collection_centres", "status",
     "data_source"])

files["processing_plants.csv"] = write_csv(
    "processing_plants.csv", processing_plants,
    ["plant_id", "plant_name", "district", "processing_capacity_litres_per_day",
     "current_capacity_utilisation", "connected_chilling_centres", "status",
     "data_source"])

files["transport_routes.csv"] = write_csv(
    "transport_routes.csv", transport_routes,
    ["route_id", "origin_id", "destination_id", "distance_km",
     "estimated_travel_time_hours", "transport_cost", "flood_risk_level",
     "route_status", "data_source"])

files["distribution_centres.csv"] = write_csv(
    "distribution_centres.csv", distribution_centres,
    ["distribution_id", "city", "district", "daily_demand_litres",
     "current_stock_litres", "priority", "data_source"])

files["historical_events.csv"] = write_csv(
    "historical_events.csv", historical_events,
    ["event_id", "event_name", "event_date", "affected_region",
     "disruption_type", "historical_description", "source_url", "data_source"])

files["disruption_scenarios.csv"] = write_csv(
    "disruption_scenarios.csv", disruption_scenarios,
    ["scenario_id", "scenario_name", "affected_region", "disruption_type",
     "affected_node_ids", "disruption_start", "disruption_duration_hours",
     "capacity_reduction_percentage", "data_source"])

# ---------------------------------------------------------------------------
# Aggregate totals -> dataset_summary.txt
# ---------------------------------------------------------------------------
total_supply = sum(s["daily_supply_litres"] for s in suppliers)
total_collection_capacity = sum(r["daily_collection_capacity"] for r in collection_centres)
total_collection_now = sum(r["current_collection"] for r in collection_centres)
total_chilling_capacity = sum(r["storage_capacity_litres"] for r in chilling_centres)
total_chilling_stock = sum(r["current_stock_litres"] for r in chilling_centres)
total_plant_capacity = sum(r["processing_capacity_litres_per_day"] for r in processing_plants)
total_demand = sum(r["daily_demand_litres"] for r in distribution_centres)
total_dc_stock = sum(r["current_stock_litres"] for r in distribution_centres)

summary = """\
RIPPLE - GOKUL MILK SAMPLE SUPPLY-CHAIN DATASET (gokul_2019)
============================================================
Generated by generate_dataset.py with fixed random seed = {seed}
All invented rows carry data_source = {sample}
All historical rows carry data_source = {hist} (each has a source_url)
NO record in this dataset is an actual Gokul Dairy company record.

FILE INVENTORY
--------------
suppliers.csv             {n_sup:3d} rows   sample milk suppliers (Kolhapur/Sangli/Satara)
collection_centres.csv    {n_cc:3d} rows   first-mile collection centres
chilling_centres.csv      {n_ch:3d} rows   chilled-storage nodes
processing_plants.csv     {n_pl:3d} rows   dairy processing plants
transport_routes.csv      {n_rt:3d} rows   bulk transport legs (CC->CH->PL->DC)
distribution_centres.csv  {n_dc:3d} rows   city demand points
historical_events.csv     {n_he:3d} rows   VERIFIED August 2019 flood facts
disruption_scenarios.csv  {n_ds:3d} rows   reconstructed simulation scenarios

BALANCE TOTALS (litres/day unless noted)
----------------------------------------
Total daily milk supply           : {supply:>10,d}
Total collection capacity         : {ccap:>10,d}
Total milk currently collected    : {ccur:>10,d}
Total chilling storage capacity   : {chcap:>10,d}
Total chilled milk in stock       : {chstock:>10,d}
Total processing capacity         : {plcap:>10,d}
Total processed output (est.)     : {proc:>10,.0f}
Total daily distribution demand   : {demand:>10,d}
Total stock at distribution       : {dcstock:>10,d}

CONSISTENCY STATEMENTS
----------------------
* current_collection equals the sum of connected suppliers' daily supply.
* daily_collection_capacity > current_collection at every centre.
* storage_capacity_litres > current_stock_litres at every chilling centre.
* processing capacity >= total supply; utilisation <= 100% at every plant.
* processed output >= total demand (0.95 utilisation target + flooring).
* No negative stock, demand, capacity, distance, time or cost values.

NETWORK TOPOLOGY
----------------
30 suppliers -> 10 collection centres -> 5 chilling centres -> 2 plants
2 plants -> 4 distribution centres (Kolhapur, Sangli, Pune, Mumbai)
Every transport route connects two existing nodes on adjacent tiers.
""".format(
    seed=SEED, sample=SAMPLE_LABEL, hist=HISTORICAL_LABEL,
    n_sup=len(suppliers), n_cc=len(collection_centres), n_ch=len(chilling_centres),
    n_pl=len(processing_plants), n_rt=len(transport_routes),
    n_dc=len(distribution_centres), n_he=len(historical_events),
    n_ds=len(disruption_scenarios),
    supply=total_supply, ccap=total_collection_capacity, ccur=total_collection_now,
    chcap=total_chilling_capacity, chstock=total_chilling_stock,
    plcap=total_plant_capacity, proc=total_processed, demand=total_demand,
    dcstock=total_dc_stock,
)

with open(os.path.join(OUT_DIR, "dataset_summary.txt"), "w", encoding="utf-8") as fh:
    fh.write(summary)

print("generate_dataset.py: seed=%d wrote %d CSV files + dataset_summary.txt" % (
    SEED, len(files)))
print("total supply=%d L/day | collection capacity=%d L/day | chilling capacity=%d L"
      % (total_supply, total_collection_capacity, total_chilling_capacity))
print("processing capacity=%d L/day | processed=%.0f L/day | demand=%d L/day"
      % (total_plant_capacity, total_processed, total_demand))
