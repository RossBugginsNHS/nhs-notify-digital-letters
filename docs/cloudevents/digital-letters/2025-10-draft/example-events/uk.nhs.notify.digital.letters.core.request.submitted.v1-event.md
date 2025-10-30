# uk.nhs.notify.digital.letters.core.request.submitted.v1

**Event Type:** `uk.nhs.notify.digital.letters.core.request.submitted.v1`

**Source:** `/nhs/england/notify/uat/secondary/data-plane/digitalletters/coresystemnotifier`

**Subject:** `customer/f049e3da-bea3-6801-cba2-37ca66f1d676/411d8b05-db9d-9be2-bee2-9a28f9acc3bb/dfcc0b4a-2ca5-9ec6-3ca2-fee2d88df7c8/98e8dcaa-2dd8-a42f-b3e4-778f685e7a55/ffd846b9-c4e6-98f2-f75b-c7cba64ab457/az75ixm/42jt366kl/qt8jsw/shb9e/2fbd53fc-cd31-a1a9-3d4e-7188df9917d2/q1drz99l`

**Event ID:** `d06111ec-10d2-4781-994f-cbd92669fc15`

**Timestamp:** 2025-10-30T14:14:12.212Z

## Related Schema Documentation

- [Event Schema](../uk.nhs.notify.digital.letters.core.request.submitted.v1.schema.md)
- [Event Schema (Bundled)](../uk.nhs.notify.digital.letters.core.request.submitted.v1.bundle.schema.md)
- [Event Schema (Flattened)](../uk.nhs.notify.digital.letters.core.request.submitted.v1.flattened.schema.md)

## Complete Event Instance

```json
{
  "type": "uk.nhs.notify.digital.letters.core.request.submitted.v1",
  "source": "/nhs/england/notify/uat/secondary/data-plane/digitalletters/coresystemnotifier",
  "dataschema": "file://../data/digital-letter-base-data.schema.json",
  "data": {
    "something": "aliqua sit Lorem",
    "notify-payload": {
      "notify-data": {},
      "notify-metadata": {
        "teamResponsible": "Team 1",
        "notifyDomain": "Enquiries",
        "microservice": "jMO",
        "repositoryUrl": "http://JBofXtwxSXOPYFpgoqxWmcTwewDggBMm.xzwXj1.4rycmCN5GZQYBk-QlMDZ5pZDSpvVIJQOZaoIrfeXyZMH",
        "accountId": "qj8W7wYa",
        "environment": "development",
        "instance": "x-mAn",
        "microserviceInstanceId": "wQhCp1m7IwI",
        "microserviceVersion": "0.103132418.0-816.21612jXsa.0.0.57644ZWtVKgxhKR",
        "commitSha": "bb2a302ec1519129476ee945d5bbd",
        "buildTimestamp": "1914-11-06T05:34:24.0Z",
        "serviceTier": "standard",
        "region": "eu-west-1",
        "pseudonymisationLevel": "pseudonymised",
        "replayIndicator": true,
        "originalEventId": "d102289f-c66b-4379-a984-34cbfc129e69",
        "integrityHash": "sha256:0092e1d033c2555a077e4384e25ac44dd65d914b9582bd66255eaa4b00e33912",
        "producedByType": "vm"
      }
    }
  },
  "profileversion": "1.0.0",
  "profilepublished": "2025-10",
  "specversion": "1.0",
  "id": "d06111ec-10d2-4781-994f-cbd92669fc15",
  "subject": "customer/f049e3da-bea3-6801-cba2-37ca66f1d676/411d8b05-db9d-9be2-bee2-9a28f9acc3bb/dfcc0b4a-2ca5-9ec6-3ca2-fee2d88df7c8/98e8dcaa-2dd8-a42f-b3e4-778f685e7a55/ffd846b9-c4e6-98f2-f75b-c7cba64ab457/az75ixm/42jt366kl/qt8jsw/shb9e/2fbd53fc-cd31-a1a9-3d4e-7188df9917d2/q1drz99l",
  "time": "2025-10-30T14:14:12.212Z",
  "datacontenttype": "application/json",
  "traceparent": "00-a27b50b22204e47a1c084603e0c933eb-c92312fb3c17f032-01",
  "tracestate": "aliqua ipsum ut Lorem",
  "partitionkey": "customer-f049e3da",
  "recordedtime": "2025-10-30T14:14:13.212Z",
  "sampledrate": 1,
  "sequence": "00000000000981140964",
  "severitytext": "DEBUG",
  "severitynumber": 1,
  "dataclassification": "confidential",
  "dataregulation": "HIPAA",
  "datacategory": "non-sensitive"
}
```
