# Ripple Sample Dataset: Gokul Milk Supply Chain — August 2019 Maharashtra Floods

**Folder:** `datasets/gokul_2019/`
**Project:** Ripple — Intelligent Supply Chain Disruption & Recovery System
**Case study:** The August 2019 floods that hit Kolhapur, Sangli and Satara
districts in western Maharashtra.

---

## ⚠️ Data integrity notice — read first

This is a **sample dataset built for a hackathon prototype**, not a company data
dump.

| | |
|---|---|
| **NOT real** | No record here is an actual Gokul Dairy (or any dairy company) record. Supplier names, villages attached to suppliers, capacities, stock levels, routes, travel times, costs, coordinates, demand figures and scenarios are **invented**. |
| **Labelled** | Every invented row carries `data_source = RECONSTRUCTED_SAMPLE`. |
| **Verified** | Only `historical_events.csv` contains real-world facts. Every row there carries `data_source = VERIFIED_PUBLIC_SOURCE` **plus** a working `source_url`, and describes regional events only. |
| **No false claims** | No row claims that a named collection centre, chilling centre, plant, supplier or route was flooded or damaged. Facility-level impacts appear only as clearly-labelled *reconstructed* scenarios in `disruption_scenarios.csv`. |

`validate_dataset.py` enforces these rules mechanically — see
[Validation](#validation).

---

## Files

| File | Rows | What it contains |
|---|---:|---|
| `suppliers.csv` | 30 | Sample milk suppliers across Kolhapur (14), Sangli (10) and Satara (6): fictional names, milk type (Cow/Buffalo/Mixed), daily supply (L/day), reliability score 0–1, status. |
| `collection_centres.csv` | 10 | First-mile collection centres with illustrative lat/long, daily collection capacity vs. current collection, `connected_supplier_ids` (semicolon-separated), status. |
| `chilling_centres.csv` | 5 | Chilled-storage nodes: storage capacity (L), current stock (L), `connected_collection_centres`, status. |
| `processing_plants.csv` | 2 | Two sample dairy plants: processing capacity (L/day), current utilisation (%), `connected_chilling_centres`, status. |
| `transport_routes.csv` | 20 | Bulk transport legs `collection → chilling → plant → distribution`: distance (km), estimated travel time (hours), transport cost (INR), flood-risk level, route status. |
| `distribution_centres.csv` | 4 | City demand points — Kolhapur, Sangli, Pune, Mumbai — with daily demand (L), current stock (L), replenishment priority. |
| `historical_events.csv` | 11 | **Verified** August 2019 flood facts (dates, rivers, evacuations, highway closures, recovery) each with a `source_url`. |
| `disruption_scenarios.csv` | 4 | Reconstructed simulation scenarios (see below). |
| `dataset_summary.txt` | — | Machine-generated inventory, totals and consistency statements. |
| `generate_dataset.py` | — | Reproducible generator (fixed seed = `2019`). |
| `validate_dataset.py` | — | 53-check validation report. |

### Network topology

```
30 suppliers ──▶ 10 collection centres ──▶ 5 chilling centres ──▶ 2 plants
                                                                      │
                                              4 distribution centres ◀┘
                                          (Kolhapur, Sangli, Pune, Mumbai)
```

Every ID resolves, every route joins two existing nodes on adjacent tiers, and
first-mile supplier pickup is expressed through `connected_supplier_ids`.

### Disruption scenarios (all `RECONSTRUCTED_SAMPLE`)

| ID | Scenario | Affected | Duration | Capacity cut |
|---|---|---|---:|---:|
| `DS-01` | Flood blocks a milk transport route | `RT-002` | 36 h | 100 % |
| `DS-02` | Collection centre temporarily unavailable | `CC-05` | 18 h | 100 % |
| `DS-03` | Chilling centre loses operating capacity | `CH-02` | 24 h | 70 % |
| `DS-04` | Multiple transport routes unavailable | `RT-005;RT-006;RT-014` | 48 h | 100 % |

Scenario timings are anchored to the verified flood window (7–9 August 2019),
but the *affected sample nodes* are invented, not real facilities.

---

## What is historically verified vs. reconstructed

### Verified (`historical_events.csv`, `data_source = VERIFIED_PUBLIC_SOURCE`)

Facts drawn from public sources, each row carrying its own `source_url`:

- Sangli, Kolhapur and Satara received 1,918 mm rainfall vs. a 333 mm normal
  for the period *(Mongabay India)*.
- Panchganga crossed its danger level at Rajaram K.T. weir, Kolhapur, on
  3 Aug 2019; Kolhapur city area inundated 3–14 Aug *(Maharashtra Water
  Resources Department, Krishna sub-basin report)*.
- Krishna crossed its danger level at Irwin Bridge, Sangli, on 5 Aug; peak
  544.57 m on 9 Aug; receding below danger from 14 Aug *(same WRD report)*.
- NH-4 (Pune–Bengaluru) landslide damage and later closure stranding ~18,000
  vehicles *(New Indian Express; India Today)*.
- 132,000+ evacuated in Sangli and Kolhapur on 7 Aug *(Wikipedia, 2019 in India)*.
- Krishna/Warna/Panchganga breached Highest Flood Levels at Kurundwad,
  Arjunwad, Samdoli and Terwad on 8 Aug *(Scroll.in)*.
- 70 NDRF/Navy/Coast Guard/SDRF teams deployed *(Wikipedia, 2019 Indian floods)*.
- Over four lakh moved to safety; water receding *(New Indian Express)*.
- Aerial survey of Kolhapur and Sangli on 11 Aug; 761 villages affected in
  Maharashtra *(FloodList)*.

### Reconstructed (`data_source = RECONSTRUCTED_SAMPLE`)

Everything else: all suppliers, collection/chilling/plant identities and
coordinates, capacities, current stock and collection, every route (distance,
time, cost, risk level), all city demand and stock figures, and all four
disruption scenarios. Districts, cities and rivers are real places; the
**records attached to them are invented**.

---

## Limitations

1. **Not company data.** Sizes are plausible for a mid-sized district dairy
   network (~106,000 L/day supply) but are not Gokul's actual figures.
2. **Illustrative coordinates.** Collection-centre lat/longs are jittered
   district anchors — good for map visualisation, not for navigation or
   facility identification.
3. **Single snapshot.** One point in time; no time series, seasonality,
   price data, spoilage, payment or quality (fat/SNF) fields.
4. **Simplified logistics.** Uniform speeds, flat per-km costs, no vehicle
   fleet, no capacity constraints on roads, no return-load economics.
5. **Scenarios are stylised.** Impact durations and capacity cuts are
   assumptions chosen for simulation, not measured outcomes.
6. **Verified events are regional.** Flood facts describe districts and
   rivers; they deliberately do not attribute flooding to any named facility.
7. **Historical facts may be incomplete.** Source URLs were public at time of
   writing; some may move or rot.

---

## Loading with pandas

```python
import pandas as pd

BASE = "datasets/gokul_2019/"

suppliers    = pd.read_csv(BASE + "suppliers.csv")
collections  = pd.read_csv(BASE + "collection_centres.csv")
chilling     = pd.read_csv(BASE + "chilling_centres.csv")
plants       = pd.read_csv(BASE + "processing_plants.csv")
routes       = pd.read_csv(BASE + "transport_routes.csv")
distribution = pd.read_csv(BASE + "distribution_centres.csv")
events       = pd.read_csv(BASE + "historical_events.csv")
scenarios    = pd.read_csv(BASE + "disruption_scenarios.csv")

# Split semicolon-separated connection columns into lists:
collections["connected_supplier_ids"] = (
    collections["connected_supplier_ids"].str.split(";")
)

# Keep verified history separate from reconstructed records:
verified = events[events["data_source"] == "VERIFIED_PUBLIC_SOURCE"]
sample   = suppliers[suppliers["data_source"] == "RECONSTRUCTED_SAMPLE"]

# Quick network balance:
print("Supply L/day :", suppliers["daily_supply_litres"].sum())
print("Demand L/day :", distribution["daily_demand_litres"].sum())
print("Supply covers demand:",
      suppliers["daily_supply_litres"].sum()
      >= distribution["daily_demand_litres"].sum())
```

---

## Validation

```bash
python3 datasets/gokul_2019/validate_dataset.py
```

Exit code `0` = all 53 checks passed; `1` = failures (each printed with its
row ID). Checks cover: required columns, unique IDs, relationship integrity,
no negative/impossible values, valid route connections, correct
`data_source` labelling, and logical balance (collection equals connected
supply, stock ≤ capacity, demand ≤ processed output).

To regenerate the CSVs from scratch with the fixed seed:

```bash
python3 datasets/gokul_2019/generate_dataset.py   # seed = 2019, byte-identical
```

---

## Why this dataset suits Ripple

- **Real disruption window.** The verified events give Ripple a genuine
  timeline (7–14 Aug 2019) to replay against, rather than a made-up crisis.
- **Multi-tier network.** Suppliers → collection → chilling → plant →
  distribution means a single blocked node forces cascade and rerouting logic —
  exactly what an interruption-and-recovery system must reason about.
- **Traversable graph for simulation.** Every route joins real adjacent tiers,
  so shortest-path rerouting, capacity rebalancing and knock-on delay
  calculations all run without data repair.
- **Comparable recovery strategies.** Baseline flows are internally balanced
  (supply 106,519 L/day ≥ demand 91,500 L/day), so scenario outcomes can be
  compared against a clean baseline: reroute via alternate chilling centres,
  prioritise high-priority cities, or hold inventory at plants.
- **Integrity built in.** The `data_source` column and validator let Ripple
  demo confidently — verified history and reconstructed assumptions are never
  silently mixed.
