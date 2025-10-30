

# Some Object

<p>Reusable types for NHS Notify payload schemas.</p>

<table>
<tbody>
<tr><th>$id</th><td>/digital-letters/2025-10-draft/defs/someobject.schema.json</td></tr>
<tr><th>$schema</th><td>https://json-schema.org/draft/2020-12/schema</td></tr>
</tbody>
</table>

## Properties

<table class="jssd-properties-table"><thead><tr><th colspan="2">Name</th><th>Type</th></tr></thead><tbody><tr><td colspan="2"><a href="#something">something</a></td><td>String</td></tr></tbody></table>



<hr />


## something


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
    "$id": "/digital-letters/2025-10-draft/defs/someobject.schema.json",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Some Object",
    "description": "Reusable types for NHS Notify payload schemas.",
    "type": "object",
    "properties": {
        "something": {
            "type": "string",
            "description": "Example reusable property definition",
            "examples": [
                "example value"
            ]
        }
    },
    "required": [
        "something"
    ]
}
```


