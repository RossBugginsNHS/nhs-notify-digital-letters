# uk.nhs.notify.digital.letters.core.request.submitted.v1

**Event Type:** `uk.nhs.notify.digital.letters.core.request.submitted.v1`

**Source:** `/nhs/england/notify/uat/primary/data-plane/digitalletters/coresystemnotifier`

**Subject:** `customer/7f6e1c4b-b5cc-824f-fd9d-5e8eacccbcdb/xn/16adbaba-181b-a0d4-ef6a-e36c6390c3e8/g7e78g3nwci/42eff9c6-8a70-34f6-b5ee-976af63f38b6/tkl/19ec0c7e-db39-cf97-ef0e-ef54dfecac33/d4ebbe1f-e3dd-0adf-7745-72143984f2ad`

**Event ID:** `846499fc-7e47-4ce9-8b96-e128cc92f261`

**Timestamp:** 2025-10-31T11:27:30.551Z

## Related Schema Documentation

- [Event Schema](../uk.nhs.notify.digital.letters.core.request.submitted.v1.schema.md)
- [Event Schema (Bundled)](../uk.nhs.notify.digital.letters.core.request.submitted.v1.bundle.schema.md)
- [Event Schema (Flattened)](../uk.nhs.notify.digital.letters.core.request.submitted.v1.flattened.schema.md)

## Complete Event Instance

```json
{
  "type": "uk.nhs.notify.digital.letters.core.request.submitted.v1",
  "source": "/nhs/england/notify/uat/primary/data-plane/digitalletters/coresystemnotifier",
  "dataschema": "file://../data/digital-letter-base-data.schema.json",
  "data": {
    "something": "sit deserunt ex eiusmod mollit",
    "notify-payload": {
      "notify-data": {
        "Lorem_4": -63225040
      },
      "notify-metadata": {
        "teamResponsible": "Team 1",
        "notifyDomain": "Delivering",
        "microservice": "Qf0Dk2pbu",
        "repositoryUrl": "http://gHxuhV.jruWGMmnb2sWs0jQ.5cZLmS3wCuJjCYCTgOB279bAZL",
        "accountId": "D7VCO",
        "environment": "staging",
        "instance": "1uK",
        "microserviceInstanceId": "wzz",
        "microserviceVersion": "0.0.8649285297+orNk",
        "commitSha": "bc4ea90",
        "buildTimestamp": "1900-02-14T21:56:35.0Z",
        "serviceTier": "standard",
        "region": "eu-west-1",
        "pseudonymisationLevel": "pseudonymised",
        "replayIndicator": false,
        "originalEventId": "c86d172a-6965-430f-bb7f-b642a2e9cff2",
        "integrityHash": "sha256:da3a7b6c6af7c861ba12cf3babc934abcf66bb8db311241f64285b98e3ecc9f8",
        "producedByType": "lambda"
      }
    }
  },
  "profileversion": "1.0.0",
  "profilepublished": "2025-10",
  "specversion": "1.0",
  "id": "846499fc-7e47-4ce9-8b96-e128cc92f261",
  "subject": "customer/7f6e1c4b-b5cc-824f-fd9d-5e8eacccbcdb/xn/16adbaba-181b-a0d4-ef6a-e36c6390c3e8/g7e78g3nwci/42eff9c6-8a70-34f6-b5ee-976af63f38b6/tkl/19ec0c7e-db39-cf97-ef0e-ef54dfecac33/d4ebbe1f-e3dd-0adf-7745-72143984f2ad",
  "time": "2025-10-31T11:27:30.551Z",
  "datacontenttype": "application/json",
  "traceparent": "00-24e17d291e9d030f1f10654dc354d23d-70cfd53ca2cfd54f-01",
  "tracestate": "ex",
  "partitionkey": "customer-7f6e1c4b",
  "recordedtime": "2025-10-31T11:27:31.551Z",
  "sampledrate": 1,
  "sequence": "00000000000812763150",
  "severitytext": "INFO",
  "severitynumber": 2,
  "dataclassification": "restricted",
  "dataregulation": "NIST-800-53",
  "datacategory": "sensitive"
}
```
