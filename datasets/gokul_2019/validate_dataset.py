#!/usr/bin/env python3
"""
validate_dataset.py
===================
Validation report for the Ripple "Gokul Milk" sample supply-chain dataset
located in datasets/gokul_2019/.

Checks
------
1.  Required files and required columns exist.
2.  IDs are unique within every file.
3.  Relationships between nodes are valid (supplier -> collection ->
    chilling -> plant -> distribution connections all resolve to real IDs).
4.  No negative stock, demand or capacity values; ranges are sane
    (utilisation 0-100, reliability 0-1, coordinates within world bounds).
5.  No invalid route connections (every route links two existing nodes on
    adjacent tiers of the network; no self-loops).
6.  Labelling: every reconstructed row carries data_source =
    RECONSTRUCTED_SAMPLE; every historical row carries
    data_source = VERIFIED_PUBLIC_SOURCE and a source_url.
7.  Logical balance: per-centre collection equals the sum of its suppliers,
    stock never exceeds capacity, processed output covers total demand.

Usage:  python3 validate_dataset.py
Exit code 0 = all checks passed, 1 = at least one failure.
"""

from __future__ import annotations

import csv
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLE_LABEL = "RECONSTRUCTED_SAMPLE"
HISTORICAL_LABEL = "VERIFIED_PUBLIC_SOURCE"

# ---------------------------------------------------------------------------
# Schema contract
# ---------------------------------------------------------------------------
REQUIRED_COLUMNS = {
    "suppliers.csv": [
        "supplier_id", "supplier_name", "district", "village", "milk_type",
        "daily_supply_litres", "reliability_score", "status", "data_source",
    ],
    "collection_centres.csv": [
        "centre_id", "centre_name", "district", "latitude", "longitude",
        "daily_collection_capacity", "current_collection",
        "connected_supplier_ids", "status", "data_source",
    ],
    "chilling_centres.csv": [
        "chilling_id", "centre_name", "district", "storage_capacity_litres",
        "current_stock_litres", "connected_collection_centres", "status",
        "data_source",
    ],
    "processing_plants.csv": [
        "plant_id", "plant_name", "district",
        "processing_capacity_litres_per_day",
        "current_capacity_utilisation", "connected_chilling_centres", "status",
        "data_source",
    ],
    "transport_routes.csv": [
        "route_id", "origin_id", "destination_id", "distance_km",
        "estimated_travel_time_hours", "transport_cost", "flood_risk_level",
        "route_status", "data_source",
    ],
    "distribution_centres.csv": [
        "distribution_id", "city", "district", "daily_demand_litres",
        "current_stock_litres", "priority", "data_source",
    ],
    "historical_events.csv": [
        "event_id", "event_name", "event_date", "affected_region",
        "disruption_type", "historical_description", "source_url",
        "data_source",
    ],
    "disruption_scenarios.csv": [
        "scenario_id", "scenario_name", "affected_region", "disruption_type",
        "affected_node_ids", "disruption_start", "disruption_duration_hours",
        "capacity_reduction_percentage", "data_source",
    ],
}

ID_COLUMNS = {
    "suppliers.csv": "supplier_id",
    "collection_centres.csv": "centre_id",
    "chilling_centres.csv": "chilling_id",
    "processing_plants.csv": "plant_id",
    "transport_routes.csv": "route_id",
    "distribution_centres.csv": "distribution_id",
    "historical_events.csv": "event_id",
    "disruption_scenarios.csv": "scenario_id",
}

# Files whose rows are invented and must be labelled RECONSTRUCTED_SAMPLE.
RECONSTRUCTED_FILES = [
    "suppliers.csv", "collection_centres.csv", "chilling_centres.csv",
    "processing_plants.csv", "transport_routes.csv",
    "distribution_centres.csv", "disruption_scenarios.csv",
]

# Numeric columns that must never be negative.
NON_NEGATIVE_COLUMNS = {
    "suppliers.csv": ["daily_supply_litres", "reliability_score"],
    "collection_centres.csv": ["latitude", "longitude",
                               "daily_collection_capacity",
                               "current_collection"],
    "chilling_centres.csv": ["storage_capacity_litres",
                             "current_stock_litres"],
    "processing_plants.csv": ["processing_capacity_litres_per_day",
                              "current_capacity_utilisation"],
    "transport_routes.csv": ["distance_km",
                             "estimated_travel_time_hours", "transport_cost"],
    "distribution_centres.csv": ["daily_demand_litres",
                                 "current_stock_litres"],
    "disruption_scenarios.csv": ["disruption_duration_hours",
                                 "capacity_reduction_percentage"],
}

# Numeric columns that represent capacity/flow and must be strictly positive.
STRICTLY_POSITIVE = {
    "suppliers.csv": ["daily_supply_litres"],
    "collection_centres.csv": ["daily_collection_capacity"],
    "chilling_centres.csv": ["storage_capacity_litres"],
    "processing_plants.csv": ["processing_capacity_litres_per_day"],
    "transport_routes.csv": ["distance_km",
                             "estimated_travel_time_hours", "transport_cost"],
    "distribution_centres.csv": ["daily_demand_litres"],
}


# ---------------------------------------------------------------------------
# Report helpers
# ---------------------------------------------------------------------------
class Report:
    def __init__(self):
        self.sections = []  # (name, passed_count, total_count, failures)

    def add(self, name, passed, total, failures):
        self.sections.append((name, passed, total, failures))

    @property
    def total_passed(self):
        return sum(s[1] for s in self.sections)

    @property
    def total_checks(self):
        return sum(s[2] for s in self.sections)

    @property
    def failed(self):
        return [f for s in self.sections for f in s[3]]


def load(filename):
    path = os.path.join(BASE_DIR, filename)
    with open(path, newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def split_ids(value):
    return [tok for tok in value.split(";") if tok]


def to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------
def check_files_and_columns(report):
    failures, passed, total = [], 0, 0
    for filename, columns in REQUIRED_COLUMNS.items():
        total += 1
        if not os.path.exists(os.path.join(BASE_DIR, filename)):
            failures.append("missing file: %s" % filename)
            continue
        header = load(filename)[0].keys() if os.path.getsize(
            os.path.join(BASE_DIR, filename)) else []
        missing = [c for c in columns if c not in header]
        if missing:
            failures.append("%s missing columns: %s" % (filename,
                                                        ", ".join(missing)))
        else:
            passed += 1
    report.add("Files and required columns", passed, total, failures)


def check_unique_ids(report):
    failures, passed, total = [], 0, 0
    for filename, id_col in ID_COLUMNS.items():
        rows = load(filename)
        total += 1
        ids = [r[id_col] for r in rows]
        dupes = sorted({i for i in ids if ids.count(i) > 1})
        if dupes:
            failures.append("%s duplicate ids: %s" % (filename,
                                                      ", ".join(dupes)))
        elif any(not i for i in ids):
            failures.append("%s contains an empty %s" % (filename, id_col))
        else:
            passed += 1
    report.add("ID uniqueness", passed, total, failures)


def check_relationships(report):
    failures, passed, total = [], 0, 0

    supplier_ids = {r["supplier_id"] for r in load("suppliers.csv")}
    cc_ids = {r["centre_id"] for r in load("collection_centres.csv")}
    ch_ids = {r["chilling_id"] for r in load("chilling_centres.csv")}
    pl_ids = {r["plant_id"] for r in load("processing_plants.csv")}
    dc_ids = {r["distribution_id"] for r in load("distribution_centres.csv")}
    route_ids = {r["route_id"] for r in load("transport_routes.csv")}

    # collection centres -> suppliers
    total += 1
    connected = set()
    for r in load("collection_centres.csv"):
        ids = split_ids(r["connected_supplier_ids"])
        if not ids:
            failures.append("%s has no connected suppliers" % r["centre_id"])
        for sid in ids:
            if sid not in supplier_ids:
                failures.append("%s references unknown supplier %s"
                                % (r["centre_id"], sid))
            connected.add(sid)
    uncovered = supplier_ids - connected
    if uncovered:
        failures.append("suppliers not connected to any centre: %s"
                        % ", ".join(sorted(uncovered)))
    if not failures:
        passed += 1

    # chilling centres -> collection centres
    total += 1
    cc_bad = False
    for r in load("chilling_centres.csv"):
        for cid in split_ids(r["connected_collection_centres"]):
            if cid not in cc_ids:
                failures.append("%s references unknown centre %s"
                                % (r["chilling_id"], cid))
                cc_bad = True
    if not cc_bad:
        passed += 1

    # plants -> chilling centres
    total += 1
    ch_bad = False
    for r in load("processing_plants.csv"):
        for cid in split_ids(r["connected_chilling_centres"]):
            if cid not in ch_ids:
                failures.append("%s references unknown chilling centre %s"
                                % (r["plant_id"], cid))
                ch_bad = True
    if not ch_bad:
        passed += 1

    # scenarios -> nodes and routes
    total += 1
    known = (supplier_ids | cc_ids | ch_ids | pl_ids | dc_ids | route_ids)
    sc_bad = False
    for r in load("disruption_scenarios.csv"):
        for nid in split_ids(r["affected_node_ids"]):
            if nid not in known:
                failures.append("%s references unknown node/route %s"
                                % (r["scenario_id"], nid))
                sc_bad = True
    if not sc_bad:
        passed += 1

    report.add("Relationship integrity", passed, total, failures)


def check_numeric_ranges(report):
    failures, passed, total = [], 0, 0

    for filename, columns in NON_NEGATIVE_COLUMNS.items():
        rows = load(filename)
        total += 1
        bad = []
        for r in rows:
            for col in columns:
                val = to_float(r.get(col, ""))
                if val is None:
                    bad.append("%s: %s is not numeric (%r)"
                               % (r.get(ID_COLUMNS[filename], "?"), col,
                                  r.get(col, "")))
                elif val < 0:
                    bad.append("%s: %s = %s is negative"
                               % (r.get(ID_COLUMNS[filename], "?"), col, val))
        failures.extend(bad)
        if not bad:
            passed += 1

    for filename, columns in STRICTLY_POSITIVE.items():
        rows = load(filename)
        total += 1
        bad = ["%s: %s = %s must be > 0"
               % (r.get(ID_COLUMNS[filename], "?"), col, r.get(col, ""))
               for r in rows for col in columns
               if (to_float(r.get(col, "")) or 0) <= 0]
        failures.extend(bad)
        if not bad:
            passed += 1

    # Utilisation, reliability, coordinates and scenario percentages.
    total += 4
    bad = ["%s: utilisation %s outside 0-100"
           % (r["plant_id"], r["current_capacity_utilisation"])
           for r in load("processing_plants.csv")
           if not 0 <= to_float(r["current_capacity_utilisation"]) <= 100]
    if bad:
        failures.extend(bad)
    else:
        passed += 1

    bad = ["%s: reliability %s outside 0-1"
           % (r["supplier_id"], r["reliability_score"])
           for r in load("suppliers.csv")
           if not 0 <= to_float(r["reliability_score"]) <= 1]
    if bad:
        failures.extend(bad)
    else:
        passed += 1

    bad = []
    for r in load("collection_centres.csv"):
        lat, lon = to_float(r["latitude"]), to_float(r["longitude"])
        if lat is None or lon is None or not -90 <= lat <= 90 \
                or not -180 <= lon <= 180:
            bad.append("%s: invalid coordinates %s,%s"
                       % (r["centre_id"], r["latitude"], r["longitude"]))
    if bad:
        failures.extend(bad)
    else:
        passed += 1

    bad = ["%s: capacity reduction %s outside 0-100"
           % (r["scenario_id"], r["capacity_reduction_percentage"])
           for r in load("disruption_scenarios.csv")
           if not 0 <= to_float(r["capacity_reduction_percentage"]) <= 100]
    if bad:
        failures.extend(bad)
    else:
        passed += 1

    report.add("Numeric ranges (no negative/impossible values)",
               passed, total, failures)


def check_routes(report):
    failures, passed, total = [], 0, 0

    cc_ids = {r["centre_id"] for r in load("collection_centres.csv")}
    ch_ids = {r["chilling_id"] for r in load("chilling_centres.csv")}
    pl_ids = {r["plant_id"] for r in load("processing_plants.csv")}
    dc_ids = {r["distribution_id"] for r in load("distribution_centres.csv")}
    tiers = {"CC": cc_ids, "CH": ch_ids, "PL": pl_ids, "DC": dc_ids}

    def tier_of(node_id):
        prefix = node_id.split("-")[0]
        for key, id_set in tiers.items():
            if node_id in id_set:
                return key
        return prefix  # unknown prefix -> will fail adjacency check

    allowed_pairs = {("CC", "CH"), ("CH", "PL"), ("PL", "DC")}
    all_known = set(cc_ids) | set(ch_ids) | set(pl_ids) | set(dc_ids)

    total += 1
    route_failures = []
    routes = load("transport_routes.csv")
    for r in routes:
        origin, dest = r["origin_id"], r["destination_id"]
        rid = r["route_id"]
        if origin == dest:
            route_failures.append("%s is a self-loop (%s)" % (rid, origin))
            continue
        if origin not in all_known:
            route_failures.append("%s origin %s does not exist" % (rid, origin))
        if dest not in all_known:
            route_failures.append("%s destination %s does not exist"
                                  % (rid, dest))
        if (tier_of(origin), tier_of(dest)) not in allowed_pairs:
            route_failures.append(
                "%s connects %s -> %s (invalid tier pair)"
                % (rid, origin, dest))
    failures.extend(route_failures)
    if not route_failures:
        passed += 1

    # Every node on the transport network must be reachable by at least one route.
    total += 1
    reached = {n for r in routes
               for n in (r["origin_id"], r["destination_id"])}
    unreachable = all_known - reached
    if unreachable:
        failures.append("nodes with no route: %s"
                        % ", ".join(sorted(unreachable)))
    else:
        passed += 1

    report.add("Route connections", passed, total, failures)


def check_labelling(report):
    failures, passed, total = [], 0, 0

    for filename in RECONSTRUCTED_FILES:
        rows = load(filename)
        total += 1
        bad = ["%s row %s has data_source=%r"
               % (filename, r.get(ID_COLUMNS[filename], "?"),
                  r.get("data_source", ""))
               for r in rows if r.get("data_source") != SAMPLE_LABEL]
        if bad:
            failures.extend(bad)
        else:
            passed += 1

    total += 1
    rows = load("historical_events.csv")
    bad = []
    for r in rows:
        if r["data_source"] != HISTORICAL_LABEL:
            bad.append("historical_events row %s has data_source=%r (expected %r)"
                       % (r["event_id"], r["data_source"], HISTORICAL_LABEL))
        if not r["source_url"].startswith(("http://", "https://")):
            bad.append("historical_events row %s has no usable source_url"
                       % r["event_id"])
    if bad:
        failures.extend(bad)
    else:
        passed += 1

    # Guard against invented records pretending to be historical facts.
    total += 1
    bad = [f + " must not be labelled %s" % HISTORICAL_LABEL
           for f in RECONSTRUCTED_FILES
           if any(r["data_source"] == HISTORICAL_LABEL
                  for r in load(f))]
    if bad:
        failures.extend(bad)
    else:
        passed += 1

    report.add("Data-source labelling", passed, total, failures)


def check_balance(report):
    failures, passed, total = [], 0, 0

    suppliers = {r["supplier_id"]: r for r in load("suppliers.csv")}
    collection = load("collection_centres.csv")
    chilling = load("chilling_centres.csv")
    plants = load("processing_plants.csv")
    distribution = load("distribution_centres.csv")

    # Per-centre: current_collection == sum(connected suppliers) and <= capacity.
    total += 1
    bad = []
    for r in collection:
        missing = [s for s in split_ids(r["connected_supplier_ids"])
                   if s not in suppliers]
        if missing:
            bad.append("%s references unknown supplier(s): %s"
                       % (r["centre_id"], ", ".join(missing)))
        else:
            want = sum(int(suppliers[s]["daily_supply_litres"])
                       for s in split_ids(r["connected_supplier_ids"]))
            if int(r["current_collection"]) != want:
                bad.append("%s current_collection=%s but connected supply=%d"
                           % (r["centre_id"], r["current_collection"], want))
        if int(r["current_collection"]) > int(r["daily_collection_capacity"]):
            bad.append("%s collection exceeds capacity (%s > %s)"
                       % (r["centre_id"], r["current_collection"],
                          r["daily_collection_capacity"]))
    failures.extend(bad)
    if not bad:
        passed += 1

    # Per chilling centre: stock <= capacity.
    total += 1
    bad = ["%s stock %s exceeds capacity %s"
           % (r["chilling_id"], r["current_stock_litres"],
              r["storage_capacity_litres"])
           for r in chilling
           if int(r["current_stock_litres"])
           > int(r["storage_capacity_litres"])]
    failures.extend(bad)
    if not bad:
        passed += 1

    # System-wide: supply <= collection capacity, demand <= processed output.
    total += 2
    total_supply = sum(int(r["daily_supply_litres"])
                       for r in suppliers.values())
    total_cc_cap = sum(int(r["daily_collection_capacity"])
                       for r in collection)
    if total_supply > total_cc_cap:
        failures.append("total supply %d exceeds collection capacity %d"
                        % (total_supply, total_cc_cap))
    else:
        passed += 1

    total_processed = sum(
        int(r["processing_capacity_litres_per_day"])
        * float(r["current_capacity_utilisation"]) / 100.0
        for r in plants)
    total_demand = sum(int(r["daily_demand_litres"]) for r in distribution)
    if total_demand > total_processed:
        failures.append("total demand %d exceeds processed output %.0f"
                        % (total_demand, total_processed))
    else:
        passed += 1

    # Stock <= 3 days of demand (sanity upper bound).
    total += 1
    bad = ["%s stock %s exceeds 3 days of demand %s"
           % (r["distribution_id"], r["current_stock_litres"],
              r["daily_demand_litres"])
           for r in distribution
           if int(r["current_stock_litres"])
           > 3 * int(r["daily_demand_litres"])]
    failures.extend(bad)
    if not bad:
        passed += 1

    report.add("Logical balance and consistency", passed, total, failures)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    report = Report()

    for fn in check_files_and_columns, check_unique_ids, \
            check_relationships, check_numeric_ranges, check_routes, \
            check_labelling, check_balance:
        fn(report)

    line = "=" * 68
    print(line)
    print("RIPPLE DATASET VALIDATION REPORT - datasets/gokul_2019/")
    print(line)

    for name, passed, total, failures in report.sections:
        status = "PASS" if passed == total else "FAIL"
        print("[%s] %-45s %d/%d" % (status, name, passed, total))
        for f in failures:
            print("        - %s" % f)

    print(line)
    verdict = "PASSED" if not report.failed else "FAILED"
    print("RESULT: %s  (%d/%d checks passed)"
          % (verdict, report.total_passed, report.total_checks))
    print(line)
    return 0 if not report.failed else 1


if __name__ == "__main__":
    sys.exit(main())
