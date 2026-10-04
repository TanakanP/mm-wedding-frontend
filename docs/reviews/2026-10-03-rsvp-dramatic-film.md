# Dramatic RSVP film styling

The user requested a more dramatic film treatment matching the photographs. The film stock is now deep olive-charcoal (`#151b16`) with a darker base (`#101510`), warm ivory perforations (`#d9c7a4`), muted brass details (`#bba16d`), a fine static stock texture, and subtle aperture edges. Small decorative M + M / frame-number markings repeat identically with each photo in the duplicate loop group. Rails are 16px on mobile and 22px on desktop; aperture dimensions remain 16:9.

Film opacity is 1 and the pink wash remains at 0 as requested. The new styling is confined to the RSVP film classes, their layout rail size, and decorative frame metadata. Photo preparation, source selection, loading caps, animation speeds and pause conditions use the existing implementation.

Verification: 15 focused geometry, lifecycle and RSVP integration tests passed. Lint has zero errors and the inherited React Hook Form warning. Production build passed. Chrome browser checks at widths 320, 390, 768, 1440 and 2560 confirmed at least 48px corner clearance, full coverage, no horizontal overflow, 16:9 apertures, full film opacity, zero wash opacity, and no page errors. These visual/style checks do not replace the earlier real-photo performance measurements or physical-device testing.

[Desktop](assets/2026-10-03-rsvp-dramatic-desktop.png) · [Mobile](assets/2026-10-03-rsvp-dramatic-mobile.png) · [Browser checks](assets/2026-10-03-rsvp-dramatic-browser.json)

The settled desktop screenshots at zero and one complete animation period are byte-identical (zero differing pixel channels), including the new film markings.
