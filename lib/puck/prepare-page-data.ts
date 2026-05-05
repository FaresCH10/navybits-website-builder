import type { Data } from "@puckeditor/core";
import { migrate } from "@puckeditor/core";
import { puckConfig } from "@/lib/puck-config";
import { mergeZonesIntoSlotProps } from "./merge-zones-into-slots";
import { repairLegacySlots } from "./repair-legacy-slots";
import { sanitizeUnmigratableZones } from "./sanitize-unmigratable-zones";

/** Normalize DB / AI payload for editor + public Render. */
export function preparePuckPageData(raw: Data): Data {
  const repaired = repairLegacySlots(raw);
  const hydrated = mergeZonesIntoSlotProps(repaired);
  const safeZones = sanitizeUnmigratableZones(hydrated);
  try {
    return migrate(safeZones, puckConfig);
  } catch (e) {
    console.warn(
      "[preparePuckPageData] migrate() failed; using hydrated page data without migrate.",
      e
    );
    return { ...hydrated, zones: {} } as Data;
  }
}
