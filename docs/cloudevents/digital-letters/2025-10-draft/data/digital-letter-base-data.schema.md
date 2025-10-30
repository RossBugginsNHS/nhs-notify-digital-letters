

# Placeholder Data

<p>Base data for digital letters - a placeholder until all data schemas are defined</p>

<table>
<tbody>
<tr><th>$id</th><td>/digital-letters/2025-10-draft/data/digital-letter-base-data.schema.json</td></tr>
<tr><th>$schema</th><td>https://json-schema.org/draft/2020-12/schema</td></tr>
</tbody>
</table>

## Properties

<table class="jssd-properties-table"><thead><tr><th colspan="2">Name</th><th>Type</th></tr></thead><tbody><tr><td colspan="2"><a href="#something">something</a></td><td>String</td></tr></tbody></table>



<hr />


## something

  <p>Defined in <a href="../defs/someobject.schema.html#/properties/something">../defs/someobject.schema.html#/properties/something</a></p>

<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">Example reusable property definition</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Required</th>
      <td colspan="2">Yes</td>
    </tr>
    <tr>
      <th>Examples</th>
      <td colspan="2"><li>example value</li></td>
    </tr>
  </tbody>
</table>









<hr />

## Schema
```
{
    "$id": "/digital-letters/2025-10-draft/data/digital-letter-base-data.schema.json",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Placeholder Data",
    "description": "Base data for digital letters - a placeholder until all data schemas are defined",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "something": {
            "$ref": "../defs/someobject.schema.json#/properties/something"
        }
    },
    "required": [
        "something"
    ]
}
```


