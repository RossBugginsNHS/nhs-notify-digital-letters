# uk.nhs.notify.digital.letters.viewer.digital.letter.read.v1

**Event Type:** `uk.nhs.notify.digital.letters.viewer.digital.letter.read.v1`

**Source:** `/nhs/england/notify/development/secondary/data-plane/digitalletters/viewer`

**Subject:** `customer/f61adfae-fe5b-f501-05fc-e400c7fbb595/6m7ef2mkd/aae8a2a9-ab3d-cdca-17b8-f9db01fa0249/mwh1/kte-8/bd2a355c-f8a2-21f9-6796-5d1ab6cc2bb1/ce6d845f-7b51-fdeb-fdaf-da61865d6f7c/sltpt`

**Event ID:** `24db4086-dd2d-4ef7-92a2-09ad35e1bedb`

**Timestamp:** 2025-10-30T14:14:13.519Z

## Related Schema Documentation

- [Event Schema](../uk.nhs.notify.digital.letters.viewer.digital.letter.read.v1.schema.md)
- [Event Schema (Bundled)](../uk.nhs.notify.digital.letters.viewer.digital.letter.read.v1.bundle.schema.md)
- [Event Schema (Flattened)](../uk.nhs.notify.digital.letters.viewer.digital.letter.read.v1.flattened.schema.md)

## Complete Event Instance

```json
{
  "type": "uk.nhs.notify.digital.letters.viewer.digital.letter.read.v1",
  "source": "/nhs/england/notify/development/secondary/data-plane/digitalletters/viewer",
  "dataschema": "file://../data/digital-letter-base-data.schema.json",
  "data": {
    "something": "sit",
    "notify-payload": {
      "notify-data": {},
      "notify-metadata": {
        "teamResponsible": "Team 2",
        "notifyDomain": "Enquiries",
        "microservice": "KgY",
        "repositoryUrl": "https://WcYbnxJjl.lyguD1v1d",
        "accountId": "BmeQs8-Pwz",
        "environment": "testing",
        "instance": "wWap",
        "microserviceInstanceId": "A7ig3",
        "microserviceVersion": "0.0.0-0.15.8946949+9yyJ27Ul9VB.QhoDtt.kZmR2jaGQ.nmvsVcGn",
        "commitSha": "f1b3a40e",
        "buildTimestamp": "1962-08-24T12:02:07.0Z",
        "serviceTier": "standard",
        "region": "eu-central-1",
        "pseudonymisationLevel": "anonymised",
        "replayIndicator": false,
        "originalEventId": "15d2dbe5-962d-4e64-b49b-78de5fc3d2c5",
        "integrityHash": "sha256:19c4d9e224b8504cacd743856d4213bd5f1db85c309b75e66ce0c2ca350557ce",
        "producedByType": "container"
      }
    }
  },
  "profileversion": "1.0.0",
  "profilepublished": "2025-10",
  "specversion": "1.0",
  "id": "24db4086-dd2d-4ef7-92a2-09ad35e1bedb",
  "subject": "customer/f61adfae-fe5b-f501-05fc-e400c7fbb595/6m7ef2mkd/aae8a2a9-ab3d-cdca-17b8-f9db01fa0249/mwh1/kte-8/bd2a355c-f8a2-21f9-6796-5d1ab6cc2bb1/ce6d845f-7b51-fdeb-fdaf-da61865d6f7c/sltpt",
  "time": "2025-10-30T14:14:13.519Z",
  "datacontenttype": "application/json",
  "traceparent": "00-cc430ed6ac6f009a689ba1e8c65d163a-d937bf7bda678a07-01",
  "tracestate": "culpa ipsum eiusmod mollit",
  "partitionkey": "customer-f61adfae",
  "recordedtime": "2025-10-30T14:14:14.519Z",
  "sampledrate": 1,
  "sequence": "00000000000527807336",
  "severitytext": "DEBUG",
  "severitynumber": 1,
  "dataclassification": "public",
  "dataregulation": "CCPA",
  "datacategory": "non-sensitive"
}
```
