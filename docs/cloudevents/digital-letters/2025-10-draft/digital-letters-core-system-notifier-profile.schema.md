

# Core System Notifier Profile

<p>Core System Notifier profile</p>

<table>
<tbody>
<tr><th>$id</th><td>/digital-letters/2025-10-draft/digital-letters-core-system-notifier-profile.schema.json</td></tr>
<tr><th>$schema</th><td>https://json-schema.org/draft/2020-12/schema</td></tr>
</tbody>
</table>

## Properties

<table class="jssd-properties-table"><thead><tr><th colspan="2">Name</th><th>Type</th></tr></thead><tbody><tr><td rowspan="1"><a href="#type">type</a></td><td rowspan="1">All of:</td><td><a href="#type-0">NHS Notify versioned event type pattern (String)</a></td></tr><tr><td colspan="2"><a href="#source">source</a></td><td>String</td></tr><tr><td colspan="2" rowspan="1">All of:</td><td>Object (of type <a href="./digital-letters-profile.schema.html">NHS Notify Digital Letters Profile</a>)</td></tr></tbody></table>



<hr />


## <a id="type"></a> type


<table class="jssd-property-table">
  <tbody>
    <tr><tr><td rowspan="1"><a href="#type">Type</a></td><td rowspan="1">All of:</td><td><a href="#type-0">NHS Notify versioned event type pattern (String)</a></td></tr></tr>
    <tr>
      <th>Required</th>
      <td colspan="2">No</td>
    </tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>



### <a id="type-0"></a> type.0 – NHS Notify versioned event type pattern
<table class="jssd-property-table">
  <tbody>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Pattern</th>
      <td colspan="2">^uk\.nhs\.notify\.digital\.letters\.core\.[a-z0-9]+(?:\.[a-z0-9]+)*\.v[0-9]+$</td>
    </tr>
  </tbody>
</table>





## source


<table class="jssd-property-table">
  <tbody>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Required</th>
      <td colspan="2">No</td>
    </tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">40</td>
    </tr><tr>
      <th>Format</th>
      <td colspan="2">uri-reference</td>
    </tr><tr>
      <th>Pattern</th>
      <td colspan="2">^/nhs/england/notify/(production|staging|development|uat)/(primary|secondary|dev-[0-9]+)/(data-plane|control-plane)/digitalletters/coresystemnotifier</td>
    </tr>
  </tbody>
</table>









<hr />

## Schema
```
{
    "$id": "/digital-letters/2025-10-draft/digital-letters-core-system-notifier-profile.schema.json",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Core System Notifier Profile",
    "description": "Core System Notifier profile",
    "type": "object",
    "allOf": [
        {
            "$ref": "./digital-letters-profile.schema.json"
        }
    ],
    "properties": {
        "type": {
            "type": "string",
            "minLength": 1,
            "allOf": [
                {
                    "name": "NHS Notify versioned event type pattern",
                    "type": "string",
                    "pattern": "^uk\\.nhs\\.notify\\.digital\\.letters\\.core\\.[a-z0-9]+(?:\\.[a-z0-9]+)*\\.v[0-9]+$"
                }
            ]
        },
        "source": {
            "type": "string",
            "pattern": "^/nhs/england/notify/(production|staging|development|uat)/(primary|secondary|dev-[0-9]+)/(data-plane|control-plane)/digitalletters/coresystemnotifier",
            "minLength": 40,
            "format": "uri-reference"
        }
    }
}
```


