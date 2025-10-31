---

title: Report Recorder
parent:  Reporting
nav_order: 1
has_children: true
is_not_draft: false
last_modified_date: 2025-10-24
owner: Tom D'Roza
author: Tom D'Roza
diagrams: [c4code-tracker-listener, c4component-nhsapp-callback, sequence-nhsapp-callback]
events-raised: []
events-consumed: [
    print-status-updated,
    core-request-submitted,
    mesh-inbox-message-received,
    mesh-inbox-message-downloaded,
    pdm-resource-submitted,
    viewer-digital-letter-read,
    pdm-resource-retries-exceeded,
    reporting-daily-report-generated,
    mesh-status-report-sent]
description: Listens to all events and generates up the report
c4type: code

---
