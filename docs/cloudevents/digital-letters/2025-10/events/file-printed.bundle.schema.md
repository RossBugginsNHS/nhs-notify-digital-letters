

# 



<table>
<tbody>
<tr><th>$id</th><td>/digital-letters/2025-10/events/file-printed.bundle.schema.json</td></tr>
<tr><th>$schema</th><td>https://json-schema.org/draft/2020-12/schema</td></tr>
</tbody>
</table>

## Properties

<table class="jssd-properties-table"><thead><tr><th colspan="2">Name</th><th>Type</th></tr></thead><tbody><tr><td colspan="2"><a href="#type">type</a></td><td>String=uk.nhs.notify.digital.letters.file.printed.v1</td></tr><tr><td colspan="2"><a href="#source">source</a></td><td>String</td></tr><tr><td colspan="2"><a href="#dataschema">dataschema</a></td><td>String=../data/file-data.schema.json</td></tr><tr><td colspan="2"><a href="#data">data</a></td><td>Object</td></tr><tr><td colspan="2" rowspan="1">All of:</td><td>Object</td></tr></tbody></table>



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
      <td colspan="2">uk.nhs.notify.digital.letters.file.printed.v1</td>
    </tr><tr>
      <th>Examples</th>
      <td colspan="2"><li>uk.nhs.notify.digital.letters.file.printed.v1</li></td>
    </tr>
  </tbody>
</table>




## source


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">Event source for digital letters examples.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Required</th>
      <td colspan="2">No</td>
    </tr>
    <tr>
      <th>Pattern</th>
      <td colspan="2">^/nhs/england/notify/(production|staging|development|uat)/(primary|secondary|dev-[0-9]+)/data-plane/digitalletters</td>
    </tr><tr>
      <th>Examples</th>
      <td colspan="2"><li>/nhs/england/notify/production/primary/data-plane/digitalletters</li></td>
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
      <td colspan="2">../data/file-data.schema.json</td>
    </tr><tr>
      <th>Examples</th>
      <td colspan="2"><li>file-data.schema.json</li></td>
    </tr>
  </tbody>
</table>




## data


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Title</th>
      <td colspan="2">Example data type</td>
    </tr>
    <tr>
      <th>Description</th>
      <td colspan="2">Example payload wrapper containing notify-payload.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Object</td></tr>
    <tr>
      <th>Required</th>
      <td colspan="2">No</td>
    </tr>
    
  </tbody>
</table>

### Properties
  <table class="jssd-properties-table"><thead><tr><th colspan="2">Name</th><th>Type</th></tr></thead><tbody><tr><td colspan="2"><a href="#datasomething">something</a></td><td>String</td></tr></tbody></table>


### data.something


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
    "$id": "/digital-letters/2025-10/events/file-printed.bundle.schema.json",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "allOf": [
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "NHS Notify Digital Letters Profile",
            "description": "NHS Notify Digital Letters profile for CloudEvents 1.0 including additional governance and tracing attributes.",
            "type": "object",
            "allOf": [
                {
                    "$anchor": "nhs-notify-profile",
                    "$schema": "https://json-schema.org/draft/2020-12/schema",
                    "title": "NHS Notify CloudEvents Profile",
                    "description": "NHS Notify profile for CloudEvents 1.0 including additional governance and tracing attributes.",
                    "type": "object",
                    "additionalProperties": false,
                    "$comment": "Version: 1.0.0\nPublished: 2025-10\nDomain: Common\n\nid includes the published date. CloudEvents allows arbitrary extension attributes. NHS profile: time (occurred-at) is mandatory though optional in CloudEvents spec.\n",
                    "properties": {
                        "specversion": {
                            "type": "string",
                            "const": "1.0",
                            "description": "CloudEvents specification version (fixed to 1.0).",
                            "examples": [
                                "1.0"
                            ],
                            "$comment": "CloudEvents version used. Core attributes: specversion,id,source,type (+ optional subject,time,datacontenttype,dataschema,data). Ref: CloudEvents core spec."
                        },
                        "id": {
                            "type": "string",
                            "format": "uuid",
                            "minLength": 1,
                            "description": "Unique identifier for this event instance (UUID).",
                            "examples": [
                                "6f1c2a53-3d54-4a0a-9a0b-0e9ae2d4c111"
                            ],
                            "$comment": "Unique per (source,id). This should be a randomly generated guid that represents the id of the event itself."
                        },
                        "source": {
                            "type": "string",
                            "pattern": "^/nhs/england/notify/(production|staging|development|uat)/(primary|secondary|dev-[0-9]+)/(data-plane|control-plane)(?:/[a-z0-9-]+)*$",
                            "minLength": 40,
                            "format": "uri-reference",
                            "description": "Logical event producer path: /nhs/england/notify/{environment}/{instance}/{plane}[/{service}...] where environment=production|staging|development|uat, instance=primary|secondary|dev-{digits}, plane=data-plane|control-plane, and optional service/lowercase tokens follow.",
                            "examples": [
                                "/nhs/england/notify/production/primary/data-plane/ordering",
                                "/nhs/england/notify/staging/secondary/control-plane/audit",
                                "/nhs/england/notify/development/dev-12345/data-plane/ordering"
                            ],
                            "$comment": "Segments: /nhs/england/notify/{environment}/{instance}/{plane}[/{token}...]; environment in (production|staging|development|uat); instance in (primary|secondary|dev-<digits> for ephemeral/dev sandboxes); plane in (data-plane|control-plane); subsequent optional segments: lowercase alphanumeric or hyphen; no trailing slash."
                        },
                        "subject": {
                            "type": "string",
                            "pattern": "^(?:[a-z0-9-]+)(?:/[a-z0-9-]+)*$",
                            "minLength": 5,
                            "format": "uri-reference",
                            "description": "Resource path (no leading slash) within the source made of lowercase segments separated by '/'.",
                            "examples": [
                                "customer/920fca11-596a-4eca-9c47-99f624614658/order/769acdd4-6a47-496f-999f-76a6fd2c3959/item/4f5e17c0-ec57-4cee-9a86-14580cf5af7d"
                            ],
                            "$comment": "URI path: must not start with '/', only lowercase alphanumeric and hyphen segments separated by '/', must not end with '/'."
                        },
                        "type": {
                            "type": "string",
                            "minLength": 1,
                            "allOf": [
                                {
                                    "name": "NHS Notify versioned event type pattern",
                                    "type": "string",
                                    "pattern": "^uk\\.nhs\\.notify\\.[a-z0-9]+(?:\\.[a-z0-9]+)*\\.v[0-9]+$",
                                    "description": "Versioned event type (uk.nhs.notify.*.<segments>.vN) using reverse-DNS style segments ending with .v<digits> (e.g. .v1, .v10).",
                                    "examples": [
                                        "uk.nhs.notify.ordering.order.read.v1"
                                    ],
                                    "$comment": "Segments: lowercase a-z0-9; final segment is version marker v<digits>. Allows arbitrary positive integer (no leading zero rule enforced)."
                                },
                                {
                                    "name": "Disallow 'completed' token",
                                    "type": "string",
                                    "not": {
                                        "pattern": "(?:^|\\.)completed(?:\\.|$)"
                                    },
                                    "description": "Disallow ambiguous past tense token 'completed'. Use a domain-specific verb like read, created, published."
                                },
                                {
                                    "name": "Disallow 'finished' token",
                                    "type": "string",
                                    "not": {
                                        "pattern": "(?:^|\\.)finished(?:\\.|$)"
                                    },
                                    "description": "Disallow 'finished' which is temporal and ambiguous; choose a workflow-specific terminal verb."
                                },
                                {
                                    "name": "Disallow 'updated' token",
                                    "type": "string",
                                    "not": {
                                        "pattern": "(?:^|\\.)updated(?:\\.|$)"
                                    },
                                    "description": "Disallow 'updated'; prefer a concrete action (e.g. order.modified.v1 -> order.change.applied)."
                                },
                                {
                                    "name": "Disallow 'changed' token",
                                    "type": "string",
                                    "not": {
                                        "pattern": "(?:^|\\.)changed(?:\\.|$)"
                                    },
                                    "description": "Disallow vague 'changed'; specify the nature of the change (e.g. status.changed -> status.transitioned)."
                                },
                                {
                                    "name": "Disallow 'processed' token",
                                    "type": "string",
                                    "not": {
                                        "pattern": "(?:^|\\.)processed(?:\\.|$)"
                                    },
                                    "description": "Disallow 'processed'; state WHAT happened, not that a process occurred."
                                },
                                {
                                    "name": "Disallow 'handled' token",
                                    "type": "string",
                                    "not": {
                                        "pattern": "(?:^|\\.)handled(?:\\.|$)"
                                    },
                                    "description": "Disallow 'handled'; overly generic and not business meaningful."
                                },
                                {
                                    "name": "Disallow 'status' token",
                                    "type": "string",
                                    "not": {
                                        "pattern": "(?:^|\\.)status(?:\\.|$)"
                                    },
                                    "description": "Disallow bare 'status'; event types should represent a domain occurrence, not a generic label."
                                },
                                {
                                    "name": "Disallow 'started' token",
                                    "type": "string",
                                    "not": {
                                        "pattern": "(?:^|\\.)started(?:\\.|$)"
                                    },
                                    "description": "Disallow 'started'; prefer a specific lifecycle action (e.g. session.opened)."
                                },
                                {
                                    "name": "Disallow 'failed' token",
                                    "type": "string",
                                    "not": {
                                        "pattern": "(?:^|\\.)failed(?:\\.|$)"
                                    },
                                    "description": "Disallow 'failed'; model the concrete failure (e.g. payment.authorization.failed -> payment.authorization.rejected)."
                                }
                            ],
                            "description": "Versioned event type (uk.nhs.notify.*.<segments>.vN) using reverse-DNS style; final segment MUST be .v<digits>; ambiguous verbs (completed, finished, updated, changed, processed, handled, status, started, failed) disallowed.",
                            "examples": [
                                "uk.nhs.notify.ordering.order.read.v1"
                            ],
                            "$comment": "NHS naming: lower-dot namespaced; version suffix required (.v<digits>); banned tokens anywhere before version: completed, finished, updated, changed, processed, handled, status, started, failed."
                        },
                        "time": {
                            "type": "string",
                            "format": "date-time",
                            "description": "Timestamp when the event occurred (RFC 3339).",
                            "examples": [
                                "2025-10-01T10:15:30.000Z"
                            ],
                            "$comment": "RFC3339 UTC occurred-at (REQUIRED in NHS profile)."
                        },
                        "datacontenttype": {
                            "type": "string",
                            "const": "application/json",
                            "description": "Media type for the data field (fixed to application/json).",
                            "examples": [
                                "application/json"
                            ],
                            "$comment": "Usually application/json."
                        },
                        "dataschema": {
                            "type": "string",
                            "description": "URI of a schema that describes the event payload (notify-payload).",
                            "examples": [
                                "https://nhsdigital.github.io/nhs-notify-standards/cloudevents/nhs-notify-example-event-data.schema.json"
                            ],
                            "$comment": "URI to event payload schema."
                        },
                        "data": {
                            "type": "object",
                            "description": "Container object wrapping the structured Notify payload.",
                            "examples": [
                                {
                                    "notify-payload": {
                                        "notify-data": {
                                            "nhsNumber": "9434765919"
                                        },
                                        "notify-metadata": {
                                            "teamResponsible": "Team 1",
                                            "notifyDomain": "Ordering",
                                            "version": "1.3.0"
                                        }
                                    }
                                }
                            ],
                            "$comment": "Domain payload (arbitrary JSON value)."
                        },
                        "traceparent": {
                            "type": "string",
                            "minLength": 1,
                            "pattern": "^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$",
                            "description": "W3C Trace Context traceparent header value.",
                            "examples": [
                                "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01"
                            ],
                            "$comment": "W3C Trace Context traceparent (required when tracing used)."
                        },
                        "tracestate": {
                            "type": "string",
                            "description": "Optional W3C Trace Context tracestate header value.",
                            "examples": [
                                "rojo=00f067aa0ba902b7,congo=t61rcWkgMzE"
                            ],
                            "$comment": "W3C Trace Context tracestate (optional)."
                        },
                        "partitionkey": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 64,
                            "pattern": "^[a-z0-9-]+$",
                            "description": "Partition / ordering key (lowercase alphanumerics and hyphen, 1-64 chars).",
                            "examples": [
                                "customer-920fca11"
                            ],
                            "$comment": "Non-empty partition key for scaling / causal grouping. Must be 1-64 characters, only lowercase letters, numbers, and hyphen."
                        },
                        "recordedtime": {
                            "type": "string",
                            "format": "date-time",
                            "description": "Timestamp when the event was recorded/persisted (should be >= time).",
                            "examples": [
                                "2025-10-01T10:15:30.250Z"
                            ],
                            "$comment": "Bitemporal created-at; should be >= time."
                        },
                        "sampledrate": {
                            "type": "integer",
                            "minimum": 1,
                            "description": "Sampling factor: number of similar occurrences this event represents.",
                            "examples": [
                                5
                            ],
                            "$comment": "Integer > 0 indicating how many similar occurrences this event represents."
                        },
                        "sequence": {
                            "type": "string",
                            "pattern": "^\\d{20}$",
                            "description": "Zero-padded 20 digit numeric sequence (lexicographically sortable).",
                            "examples": [
                                "00000000000000000042"
                            ],
                            "$comment": "Lexicographically comparable ordering string per source. Must be a string of exactly 20 digits, left-padded with zeros, representing a 64-bit unsigned integer."
                        },
                        "severitytext": {
                            "type": "string",
                            "enum": [
                                "TRACE",
                                "DEBUG",
                                "INFO",
                                "WARN",
                                "ERROR",
                                "FATAL"
                            ],
                            "description": "Log severity level name.",
                            "examples": [
                                "DEBUG"
                            ],
                            "$comment": "Severity text (TRACE, DEBUG, INFO, WARN, ERROR, FATAL, etc.)."
                        },
                        "severitynumber": {
                            "type": "integer",
                            "minimum": 0,
                            "maximum": 5,
                            "description": "Numeric severity (TRACE=0, DEBUG=1, INFO=2, WARN=3, ERROR=4, FATAL=5).",
                            "examples": [
                                1
                            ],
                            "$comment": "Numeric severity corresponding to severitytext (TRACE=0..FATAL=5)."
                        },
                        "dataclassification": {
                            "type": "string",
                            "enum": [
                                "public",
                                "internal",
                                "confidential",
                                "restricted"
                            ],
                            "description": "Data sensitivity classification.",
                            "examples": [
                                "restricted"
                            ],
                            "$comment": "Data classification e.g. public|internal|confidential|restricted."
                        },
                        "dataregulation": {
                            "type": "string",
                            "enum": [
                                "GDPR",
                                "HIPAA",
                                "PCI-DSS",
                                "ISO-27001",
                                "NIST-800-53",
                                "CCPA"
                            ],
                            "description": "Regulatory regime tag applied to this data.",
                            "examples": [
                                "ISO-27001"
                            ],
                            "$comment": "Regulation tags e.g. GDPR, HIPAA."
                        },
                        "datacategory": {
                            "type": "string",
                            "enum": [
                                "non-sensitive",
                                "standard",
                                "sensitive",
                                "special-category"
                            ],
                            "description": "Data category classification (e.g. standard, special-category).",
                            "examples": [
                                "sensitive"
                            ],
                            "$comment": "Example: special-category (GDPR), phi (HIPAA)."
                        }
                    },
                    "required": [
                        "specversion",
                        "id",
                        "source",
                        "subject",
                        "type",
                        "time",
                        "recordedtime",
                        "severitynumber",
                        "traceparent",
                        "data"
                    ],
                    "dependentRequired": {
                        "severitynumber": [
                            "severitytext"
                        ]
                    },
                    "allOf": [
                        {
                            "if": {
                                "properties": {
                                    "source": {
                                        "pattern": "^/nhs/england/notify/(production|staging|development|uat)/(primary|secondary|dev-[0-9]+)/data-plane"
                                    }
                                },
                                "required": [
                                    "source"
                                ]
                            },
                            "then": {
                                "properties": {
                                    "subject": {
                                        "pattern": "^customer/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?:/(?:[a-z0-9-]+|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}))*$",
                                        "$comment": "When source is /data-plane..., subject must start with customer/{uuid} and may have further segments which are either lowercase tokens or UUIDs.",
                                        "description": "Subject path for data-plane events: customer/{uuid}[/...]."
                                    }
                                },
                                "required": [
                                    "subject"
                                ]
                            }
                        },
                        {
                            "if": {
                                "properties": {
                                    "severitytext": {
                                        "const": "TRACE"
                                    }
                                },
                                "required": [
                                    "severitytext"
                                ]
                            },
                            "then": {
                                "properties": {
                                    "severitynumber": {
                                        "const": 0
                                    }
                                },
                                "required": [
                                    "severitynumber"
                                ]
                            }
                        },
                        {
                            "if": {
                                "properties": {
                                    "severitytext": {
                                        "const": "DEBUG"
                                    }
                                },
                                "required": [
                                    "severitytext"
                                ]
                            },
                            "then": {
                                "properties": {
                                    "severitynumber": {
                                        "const": 1
                                    }
                                },
                                "required": [
                                    "severitynumber"
                                ]
                            }
                        },
                        {
                            "if": {
                                "properties": {
                                    "severitytext": {
                                        "const": "INFO"
                                    }
                                },
                                "required": [
                                    "severitytext"
                                ]
                            },
                            "then": {
                                "properties": {
                                    "severitynumber": {
                                        "const": 2
                                    }
                                },
                                "required": [
                                    "severitynumber"
                                ]
                            }
                        },
                        {
                            "if": {
                                "properties": {
                                    "severitytext": {
                                        "const": "WARN"
                                    }
                                },
                                "required": [
                                    "severitytext"
                                ]
                            },
                            "then": {
                                "properties": {
                                    "severitynumber": {
                                        "const": 3
                                    }
                                },
                                "required": [
                                    "severitynumber"
                                ]
                            }
                        },
                        {
                            "if": {
                                "properties": {
                                    "severitytext": {
                                        "const": "ERROR"
                                    }
                                },
                                "required": [
                                    "severitytext"
                                ]
                            },
                            "then": {
                                "properties": {
                                    "severitynumber": {
                                        "const": 4
                                    }
                                },
                                "required": [
                                    "severitynumber"
                                ]
                            }
                        },
                        {
                            "if": {
                                "properties": {
                                    "severitytext": {
                                        "const": "FATAL"
                                    }
                                },
                                "required": [
                                    "severitytext"
                                ]
                            },
                            "then": {
                                "properties": {
                                    "severitynumber": {
                                        "const": 5
                                    }
                                },
                                "required": [
                                    "severitynumber"
                                ]
                            }
                        }
                    ],
                    "examples": [
                        {
                            "profileversion": "1.0.0",
                            "profilepublished": "2025-10",
                            "specversion": "1.0",
                            "id": "6f1c2a53-3d54-4a0a-9a0b-0e9ae2d4c111",
                            "source": "/data-plane/ordering",
                            "subject": "customer/920fca11-596a-4eca-9c47-99f624614658/order/769acdd4-6a47-496f-999f-76a6fd2c3959/item/4f5e17c0-ec57-4cee-9a86-14580cf5af7d",
                            "type": "uk.nhs.notify.ordering.order.read",
                            "time": "2025-10-01T10:15:30.000Z",
                            "recordedtime": "2025-10-01T10:15:30.250Z",
                            "traceparent": "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01",
                            "tracestate": "rojo=00f067aa0ba902b7,congo=t61rcWkgMzE",
                            "partitionkey": "customer-920fca11",
                            "sequence": "00000000000000000042",
                            "severitytext": "DEBUG",
                            "severitynumber": 1,
                            "datacontenttype": "application/json",
                            "dataschema": "https://nhsdigital.github.io/nhs-notify-standards/cloudevents/nhs-notify-example-event-data.schema.yaml",
                            "dataclassification": "restricted",
                            "dataregulation": "ISO-27001",
                            "datacategory": "sensitive",
                            "sampledrate": 5,
                            "data": {
                                "notify-payload": {
                                    "notify-data": {
                                        "nhsNumber": "9434765919"
                                    },
                                    "notify-metadata": {
                                        "teamResponsible": "Team 1",
                                        "notifyDomain": "Ordering",
                                        "version": "1.3.0"
                                    }
                                }
                            }
                        }
                    ]
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
                            "pattern": "^uk\\.nhs\\.notify\\.digital\\.letters\\.[a-z0-9]+(?:\\.[a-z0-9]+)*\\.v[0-9]+$"
                        }
                    ]
                },
                "source": {
                    "type": "string",
                    "pattern": "^/nhs/england/notify/(production|staging|development|uat)/(primary|secondary|dev-[0-9]+)/(data-plane|control-plane)/digitalletters",
                    "minLength": 40,
                    "format": "uri-reference"
                }
            }
        }
    ],
    "properties": {
        "type": {
            "type": "string",
            "const": "uk.nhs.notify.digital.letters.file.printed.v1",
            "description": "Concrete versioned event type string for this example event (.vN suffix).",
            "examples": [
                "uk.nhs.notify.digital.letters.file.printed.v1"
            ]
        },
        "source": {
            "type": "string",
            "pattern": "^/nhs/england/notify/(production|staging|development|uat)/(primary|secondary|dev-[0-9]+)/data-plane/digitalletters",
            "description": "Event source for digital letters examples.",
            "examples": [
                "/nhs/england/notify/production/primary/data-plane/digitalletters"
            ]
        },
        "dataschema": {
            "type": "string",
            "const": "../data/file-data.schema.json",
            "description": "Canonical URI of the example event's data schema.",
            "examples": [
                "file-data.schema.json"
            ]
        },
        "data": {
            "description": "Example payload wrapper containing notify-payload.",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "Example data type",
            "type": "object",
            "additionalProperties": false,
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
    },
    "$comment": "Bundled schema (all external $ref inlined).",
    "$defs": {}
}
```


