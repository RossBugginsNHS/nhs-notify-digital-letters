# Security Review — April 2026

> **Status**: Initial review complete
> **Date**: 2026-04-29
> **Reviewer**: AI-assisted (GitHub Copilot)
> **Scope**: Full repository security audit

## Executive Summary

A comprehensive security review was conducted across all areas of the
`nhs-notify-digital-letters` repository, including application code (Lambda
functions), infrastructure as code (Terraform), CI/CD pipelines (GitHub Actions
workflows), shell scripts, dependencies, and configuration files.

Several categories of findings were identified and prioritised. Critical and high
severity issues have been fixed in this review. Medium and lower severity items
are documented below for future remediation.

---

## Findings Fixed in This Review

### 1. Shell Script Injection — Unquoted Variables (HIGH)

**Files**:

- `scripts/set-github-token.sh`
- `utils/package_python_lambda.sh`
- `lambdas/mesh-download/package_python_lambda.sh`
- `lambdas/mesh-poll/package_python_lambda.sh`
- `lambdas/report-sender/package_python_lambda.sh`

**Issue**: Variables passed to commands without quoting, enabling word splitting
and globbing. The `$GITHUB_TOKEN` variable was passed unquoted to `npm config`,
and `${dist_dir}` was used unquoted in `pip install` targets.

**Fix**: All variables are now properly quoted with double quotes.

### 2. Insecure Temporary Directory Permissions (HIGH)

**File**: `scripts/docker/dgoss.sh`

**Issue**: `chmod 777` was applied to a `mktemp`-created directory, making it
world-writable. This creates a race condition vulnerability where other users or
processes could inject malicious files.

**Fix**: Removed `chmod 777`. `mktemp -d` already creates directories with
secure `0700` permissions.

### 3. GitHub Token Input Not Masked (MEDIUM)

**File**: `scripts/set-github-token.sh`

**Issue**: The `read` command for interactive token input did not use `-s` (silent
mode), allowing the token to be visible on screen. It also lacked `-r` which
caused backslashes in tokens to be interpreted as escape sequences.

**Fix**: Added `-r -s` flags to the `read` command and an `echo ""` for a clean
newline after silent input.

### 4. Overly Broad CI/CD Workflow Permissions (HIGH)

**File**: `.github/workflows/cicd-1-pull-request.yaml`

**Issue**: Top-level permissions granted `contents: write` and `packages: write`
to all jobs in the workflow, even though most jobs only need read access.

**Fix**: Reduced top-level permissions to `contents: read` and `packages: read`.
Jobs that require write access already have job-level permission overrides.

### 5. Missing Permissions Block in Workflow (HIGH)

**File**: `.github/workflows/pr_destroy_dynamic_env.yaml`

**Issue**: No `permissions:` block was defined, defaulting to `write-all` — the
most permissive setting available.

**Fix**: Added explicit `permissions:` block with minimal required permissions.

### 6. CloudWatch Log Group Missing Encryption (HIGH)

**File**: `infrastructure/terraform/components/dl/cloudwatch_log_group_kinesis_logs.tf`

**Issue**: The Kinesis Firehose CloudWatch log group was created without KMS
encryption, while other log groups in the project use KMS encryption.

**Fix**: Added `kms_key_id = module.kms.key_arn` to enable encryption at rest.

### 7. KMS Key Policy — Wildcard Actions (MEDIUM)

**File**: `infrastructure/terraform/components/dl/module_kms.tf`

**Issue**: The Events and DynamoDB KMS key policy statements used wildcard
actions (`kms:Encrypt*`, `kms:Decrypt*`, `kms:Describe*`, `kms:GenerateDataKey*`)
which grant broader permissions than necessary.

**Fix**: Replaced wildcards with specific action names (`kms:Encrypt`,
`kms:Decrypt`, `kms:GenerateDataKey`, `kms:GenerateDataKeyWithoutPlaintext`,
`kms:DescribeKey`).

### 8. S3 CORS — Wildcard Origin (HIGH)

**File**: `infrastructure/terraform/components/dl/module_s3_bucket_static_assets.tf`

**Issue**: S3 bucket CORS was configured with `allowed_origins = ["*"]`, allowing
any website to make cross-origin requests to the bucket.

**Fix**: Restricted to the specific CloudFront domain using
`local.root_domain_name`.

---

## Findings Requiring Future Remediation

### GitHub Actions & CI/CD

<!-- TODO: CCM-XXXXX -->

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| 1 | MEDIUM | `actions/checkout` used without `persist-credentials: false` in most workflows | Multiple workflow files |
| 2 | MEDIUM | Inconsistent action SHA pinning across files (different SHAs for same action version) | Multiple workflow files |
| 3 | MEDIUM | Expression injection risk: `${{ github.repository }}` used in `run:` step without quoting | `pr_destroy_dynamic_env.yaml:27` |
| 4 | MEDIUM | No GitHub environment protections defined for deployment jobs | `stage-4-acceptance.yaml`, `stage-5-publish.yaml` |
| 5 | LOW | Commented-out Trivy security scanning (tracked by CCM-15549) | Multiple workflow files |

### Terraform & Infrastructure

<!-- TODO: CCM-XXXXX -->

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| 1 | HIGH | API Gateway methods set to `authorization = "NONE"` (PDM mock) | `api_gateway_method_*.tf` |
| 2 | HIGH | Missing S3 access logging on sensitive buckets (PII, non-PII, file safe, quarantine) | `module_s3bucket_*.tf` |
| 3 | MEDIUM | Kinesis Firehose IAM policy grants `kinesis:ListStreams` on `*` | `kinesis_firehose_delivery_stream_to_s3_reporting.tf` |
| 4 | MEDIUM | Step Function CloudWatch Logs policy with `resources = ["*"]` | `sfn_state_machine_metadata_refresh.tf` |
| 5 | MEDIUM | Glue access uses `Get*` wildcard action | `sfn_state_machine_metadata_refresh.tf` |
| 6 | MEDIUM | Athena policy grants access to `datacatalog/*` | `sfn_state_machine_metadata_refresh.tf` |
| 7 | MEDIUM | API Gateway missing WAF association | `api_gateway_rest_api_pdm_mock.tf` |
| 8 | MEDIUM | Mock MESH values risk in production if `enable_mock_mesh` not properly controlled | `ssm_parameter_mesh.tf` |
| 9 | LOW | Log retention defaults to 0 (indefinite) | `variables.tf` |
| 10 | LOW | Hardcoded API base URLs as variable defaults | `variables.tf` |
| 11 | LOW | Missing MFA delete on S3 bucket versioning | All S3 bucket modules |

### Application Code (Lambdas)

<!-- TODO: CCM-XXXXX -->

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| 1 | MEDIUM | Missing request body size validation across all Lambda handlers | All Lambda entry points |
| 2 | MEDIUM | No idempotency or deduplication logic in event processing | Event publisher utilities |
| 3 | MEDIUM | SSRF risk: token endpoint URL from config not validated against allowlist | `refresh-apim-access-token` |
| 4 | MEDIUM | S3 metadata key lookups assume lowercase casing | `move-scanned-files-lambda` |
| 5 | LOW | `Math.random()` used for write sharding (not security-critical) | `ttl-create-lambda` |
| 6 | LOW | Missing retry count bounds validation | `pdm-poll-lambda` |

### Dependencies

<!-- TODO: CCM-XXXXX -->

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| 1 | MEDIUM | Python dependencies use unbounded `>=` constraints | `lambdas/mesh-*/requirements.txt` |
| 2 | LOW | Suspicious CVE date in `.trivyignore`: CVE-2026-1615 — verify validity | `.trivyignore` |

---

## Recommendations

### Immediate (Before Next Release)

1. Add `persist-credentials: false` to all `actions/checkout` steps
2. Add authentication to PDM mock API Gateway methods (or restrict to VPC)
3. Enable access logging on all S3 buckets containing sensitive data
4. Standardise action SHA pinning across all workflow files

### Short Term (Within Sprint)

5. Add GitHub environment protections with required reviewers for deployments
6. Scope down IAM wildcard resources in Step Function, Kinesis, and Athena policies
7. Add WAF to API Gateway
8. Add upper bounds to Python dependency version constraints
9. Add input size validation to Lambda handlers
10. Verify CVE-2026-1615 in `.trivyignore`

### Medium Term

11. Implement idempotent event processing
12. Set explicit CloudWatch log retention periods (not indefinite)
13. Move hardcoded API URLs to environment-specific tfvars
14. Enable MFA delete on production S3 buckets
15. Add SSRF allowlist validation for external API endpoints

---

## Validation

Changes in this review were validated by:

- Manual review of all modified files
- Verification that shell scripts maintain correct quoting
- Verification that Terraform HCL is syntactically valid
- Verification that workflow YAML is structurally correct
- CodeQL security analysis
