/** Single source for legal page “last updated” (ISO date string for metadata + display). */
export const LEGAL_LAST_UPDATED_ISO = "2026-03-27";

export function formatLegalLastUpdatedDisplay(iso: string): string {
    try {
        return new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(new Date(iso + "T12:00:00"));
    } catch {
        return iso;
    }
}
