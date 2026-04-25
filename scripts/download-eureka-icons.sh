#!/bin/bash
# One-time download of job icons + material icons from xivapi CDN.
# Run: bash scripts/download-eureka-icons.sh
set -euo pipefail

cd "$(dirname "$0")/.."

JOB_ICON_DIR="src/assets/job-icons"
MAT_ICON_DIR="src/assets/material-icons"
mkdir -p "$JOB_ICON_DIR" "$MAT_ICON_DIR"

# FFXIV job icons: 062000 + ClassJob ID. Covers every job that can equip
# Eureka elemental armor (15 SB jobs + 7 post-SB jobs that share role
# categories per ClassJobCategory.csv).
declare -A JOBS=(
  [PLD]=062019
  [MNK]=062020
  [WAR]=062021
  [DRG]=062022
  [BRD]=062023
  [WHM]=062024
  [BLM]=062025
  [SCH]=062028
  [SMN]=062027
  [NIN]=062030
  [MCH]=062031
  [DRK]=062032
  [AST]=062033
  [SAM]=062034
  [RDM]=062035
  [BLU]=062036
  [GNB]=062037
  [DNC]=062038
  [RPR]=062039
  [SGE]=062040
  [VPR]=062041
  [PCT]=062042
)

for job in "${!JOBS[@]}"; do
  icon="${JOBS[$job]}"
  folder="062000"
  url="https://xivapi.com/i/${folder}/${icon}.png"
  dest="${JOB_ICON_DIR}/${job}.png"
  if [ ! -f "$dest" ]; then
    echo "job $job ← $url"
    curl -sL -o "$dest" "$url"
  fi
done

# Material icons: iconIds from public/data/eureka-materials.json
MATERIALS=(
  "20029 protean-crystal"
  "21910 pazuzu-feather"
  "20028 anemos-crystal"
  "21266 louhi-ice"
  "20030 pagos-crystal"
  "20031 frosted-protean"
  "20033 smoldering-protean"
  "25911 penthesilea-flame"
  "20032 pyros-crystal"
  "22265 crystalline-scale"
  "20037 hydatos-crystal"
  "26544 eureka-fragment"
)

for entry in "${MATERIALS[@]}"; do
  id="${entry%% *}"
  name="${entry#* }"
  folder=$(printf "%06d" $(( (id / 1000) * 1000 )))
  padded=$(printf "%06d" "$id")
  url="https://xivapi.com/i/${folder}/${padded}.png"
  dest="${MAT_ICON_DIR}/${id}.png"
  if [ ! -f "$dest" ]; then
    echo "mat $id ($name) ← $url"
    curl -sL -o "$dest" "$url"
  fi
done

echo "Done. Job icons: $JOB_ICON_DIR/, material icons: $MAT_ICON_DIR/"
