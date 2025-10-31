# uk.nhs.notify.digital.letters.reporting.daily.report.timer.expired.v1

**Event Type:** `uk.nhs.notify.digital.letters.reporting.daily.report.timer.expired.v1`

**Source:** `/nhs/england/notify/development/dev-491114/data-plane/digitalletters/reporting`

**Subject:** `customer/22fbfe04-687c-ce39-a0b5-edebf5dbc096`

**Event ID:** `01e4baa7-e891-4535-a563-519aab716ea2`

**Timestamp:** 2025-10-31T11:27:31.702Z

## Related Schema Documentation

- [Event Schema](../uk.nhs.notify.digital.letters.reporting.daily.report.timer.expired.v1.schema.md)
- [Event Schema (Bundled)](../uk.nhs.notify.digital.letters.reporting.daily.report.timer.expired.v1.bundle.schema.md)
- [Event Schema (Flattened)](../uk.nhs.notify.digital.letters.reporting.daily.report.timer.expired.v1.flattened.schema.md)

## Complete Event Instance

```json
{
  "type": "uk.nhs.notify.digital.letters.reporting.daily.report.timer.expired.v1",
  "source": "/nhs/england/notify/development/dev-491114/data-plane/digitalletters/reporting",
  "dataschema": "file://../data/digital-letter-base-data.schema.json",
  "data": {
    "something": "sunt pariatur et Lorem",
    "notify-payload": {
      "notify-data": {
        "laboris_5d": 99812057.10132319,
        "suntb95": false
      },
      "notify-metadata": {
        "teamResponsible": "Team 3",
        "notifyDomain": "Enquiries",
        "microservice": "ezsxBI",
        "repositoryUrl": "https://GRVnjkOCKLsNgtcccsfQiyuyuLgLddfyv.yqmwoMrtTEgr47QZp1mtY",
        "accountId": "S",
        "environment": "staging",
        "instance": "kH9ZybF6-H",
        "microserviceInstanceId": "offI11",
        "microserviceVersion": "0.3123822.782354",
        "commitSha": "e42d1214386482776d08b467",
        "buildTimestamp": "1935-04-15T22:46:47.0Z",
        "serviceTier": "standard",
        "region": "eu-central-1",
        "pseudonymisationLevel": "tokenised",
        "replayIndicator": true,
        "originalEventId": "50dec8b7-d97e-4de6-9700-1d74c56a6922",
        "integrityHash": "sha256:5cfd7b2c72e588b7c75a5e94d21c67a2493f061ed6d8b22b3f2ddfd002d1cfab",
        "producedByType": "vm"
      }
    }
  },
  "profileversion": "1.0.0",
  "profilepublished": "2025-10",
  "specversion": "1.0",
  "id": "01e4baa7-e891-4535-a563-519aab716ea2",
  "subject": "customer/22fbfe04-687c-ce39-a0b5-edebf5dbc096",
  "time": "2025-10-31T11:27:31.702Z",
  "datacontenttype": "application/json",
  "traceparent": "00-0f91f2040ffad72c2902eb770546af30-376576b3e298d36e-01",
  "tracestate": "nostrud eiusmod Duis adipisicing quis",
  "partitionkey": "customer-22fbfe04",
  "recordedtime": "2025-10-31T11:27:32.702Z",
  "sampledrate": 1,
  "sequence": "00000000000953237729",
  "severitytext": "ERROR",
  "severitynumber": 4,
  "dataclassification": "internal",
  "dataregulation": "GDPR",
  "datacategory": "non-sensitive"
}
```
