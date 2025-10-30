

# DailyReportGenerated



<table>
<tbody>
<tr><th>$id</th><td>/digital-letters/2025-10-draft/events/uk.nhs.notify.digital.letters.reporting.daily.report.generated.v1.flattened.schema.json</td></tr>
<tr><th>$schema</th><td>https://json-schema.org/draft/2020-12/schema</td></tr>
</tbody>
</table>

## Properties

<table class="jssd-properties-table"><thead><tr><th colspan="2">Name</th><th>Type</th></tr></thead><tbody><tr><td colspan="2"><a href="#type">type</a></td><td>String=uk.nhs.notify.digital.letters.reporting123.daily.report.generated.v1</td></tr><tr><td colspan="2"><a href="#source">source</a></td><td>String</td></tr><tr><td colspan="2"><a href="#dataschema">dataschema</a></td><td>String=file://../data/digital-letter-base-data.schema.json</td></tr><tr><td colspan="2"><a href="#data">data</a></td><td>Object (of type <a href="../data/digital-letter-base-data.schema.html">File Data</a>)</td></tr><tr><td colspan="2" rowspan="1">All of:</td><td>Object (of type <a href="../digital-letters-core-system-notifier-profile.schema.html">Core System Notifier Profile</a>)</td></tr></tbody></table>



<hr />


## type


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">Concrete versioned event type string for this example event (.vN suffix).</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Required</th>
      <td colspan="2">No</td>
    </tr>
    <tr>
      <th>Const</th>
      <td colspan="2">uk.nhs.notify.digital.letters.reporting123.daily.report.generated.v1</td>
    </tr>
  </tbody>
</table>




## source


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">Event source for digital letters  examples.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Required</th>
      <td colspan="2">No</td>
    </tr>
    <tr>
      <th>Pattern</th>
      <td colspan="2">^/nhs/england/notify/(production|staging|development|uat)/(primary|secondary|dev-[0-9]+)/data-plane/digitalletters/reporting</td>
    </tr>
  </tbody>
</table>




## dataschema


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">Canonical URI of the example event&#x27;s data schema.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Required</th>
      <td colspan="2">No</td>
    </tr>
    <tr>
      <th>Const</th>
      <td colspan="2">file://../data/digital-letter-base-data.schema.json</td>
    </tr><tr>
      <th>Examples</th>
      <td colspan="2"><li>digital-letter-base-data.schema.json</li></td>
    </tr>
  </tbody>
</table>




## data

  <p>Defined in <a href="../data/digital-letter-base-data.schema.html">../data/digital-letter-base-data.schema.html</a></p>

<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>$id</th>
      <td colspan="2">/digital-letters/2025-10-draft/data/digital-letter-base-data.schema.json</td>
    </tr>
    <tr>
      <th>Title</th>
      <td colspan="2">File Data</td>
    </tr>
    <tr>
      <th>Description</th>
      <td colspan="2">Example payload wrapper containing notify-payload.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Object (of type <a href="../data/digital-letter-base-data.schema.html">File Data</a>)</td></tr>
    <tr>
      <th>Required</th>
      <td colspan="2">No</td>
    </tr>
    
  </tbody>
</table>

### Properties
  <table class="jssd-properties-table"><thead><tr><th colspan="2">Name</th><th>Type</th></tr></thead><tbody><tr><td colspan="2"><a href="#datasomething">something</a></td><td>String</td></tr></tbody></table>








<hr />

## Schema
```
{
    "$id": "/digital-letters/2025-10-draft/events/uk.nhs.notify.digital.letters.reporting.daily.report.generated.v1.flattened.schema.json",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "DailyReportGenerated",
    "type": "object",
    "allOf": [
        {
            "$ref": "../digital-letters-core-system-notifier-profile.schema.json"
        }
    ],
    "properties": {
        "type": {
            "type": "string",
            "const": "uk.nhs.notify.digital.letters.reporting123.daily.report.generated.v1",
            "description": "Concrete versioned event type string for this example event (.vN suffix)."
        },
        "source": {
            "type": "string",
            "pattern": "^/nhs/england/notify/(production|staging|development|uat)/(primary|secondary|dev-[0-9]+)/data-plane/digitalletters/reporting",
            "description": "Event source for digital letters  examples."
        },
        "dataschema": {
            "type": "string",
            "const": "file://../data/digital-letter-base-data.schema.json",
            "description": "Canonical URI of the example event's data schema.",
            "examples": [
                "digital-letter-base-data.schema.json"
            ]
        },
        "data": {
            "$ref": "../data/digital-letter-base-data.schema.json",
            "description": "Example payload wrapper containing notify-payload."
        }
    },
    "$comment": "Bundled schema (all external $ref inlined).",
    "$defs": {},
    "required": []
}
```


