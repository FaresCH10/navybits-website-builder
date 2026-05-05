"use client";

import type { Data } from "@puckeditor/core";
import { Render } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { puckConfig } from "@/lib/puck-config";

/** Client Render matches the studio iframe; the RSC entry can miss slot/nested trees vs editor. */
export function PuckSiteRender({ data }: { data: Data }) {
  return <Render config={puckConfig} data={data} />;
}
