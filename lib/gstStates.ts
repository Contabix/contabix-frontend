import { GST_STATE_CODES } from "./gstStateCodes";

/* =====================================
   GST States (UI list)
===================================== */

export const GST_STATES = Object.keys(GST_STATE_CODES)
  .map((s) =>
    s.replace(/\b\w/g, (c) => c.toUpperCase()) // Title Case
  )
  .sort();
