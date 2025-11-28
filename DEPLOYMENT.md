# Deployment Guide for Open-Regels TriplyDB Portals

## Overview

This guide walks through deploying multiple organization-specific query portals for the open-regels.nl infrastructure.

## Architecture Decision

Given your requirements:
- Multiple public organizations
- Azure subscription with GitHub integration
- DNS zone ownership for open-regels.nl
- Static sites with no authentication

**Recommended: Separate Repositories Strategy**

Each organization gets:
- Own GitHub repository
- Own Azure Static Web App
- Own subdomain (e.g., `aow.open-regels.nl`)
- Independent deployment pipeline

## Step-by-Step Setup

### 1. Prepare Base Template (One-time)

```bash
# Clone this template
git clone <template-repo> triply-portal-template
cd triply-portal-template

# Test locally
npm install
npm run dev
```

### 2. Create Organization-Specific Repository

For each organization (e.g., AOW):

```bash
# Create new repo from template
git clone triply-portal-template aow-query-portal
cd aow-query-portal

# Update config.json with AOW-specific settings
# Update assets/logo.png with organization logo

# Initialize Git
git init
git add .
git commit -m "Initial AOW query portal"

# Push to GitHub
gh repo create open-regels/aow-query-portal --public --source=. --remote=origin --push
```

### 3. Create Azure Static Web App

For each organization:

```bash
# Set variables
ORG_NAME="aow"
RESOURCE_GROUP="rg-open-regels-portals"
LOCATION="westeurope"
GITHUB_REPO="open-regels/aow-query-portal"

# Create resource group (first time only)
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create static web app
az staticwebapp create \
  --name "${ORG_NAME}-query-portal" \
  --resource-group $RESOURCE_GROUP \
  --source "https://github.com/${GITHUB_REPO}" \
  --location $LOCATION \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github

# Get the default hostname
az staticwebapp show \
  --name "${ORG_NAME}-query-portal" \
  --resource-group $RESOURCE_GROUP \
  --query "defaultHostname" -o tsv
```

### 4. Configure Custom Domain

```bash
# Add custom domain to Static Web App
az staticwebapp hostname set \
  --name "${ORG_NAME}-query-portal" \
  --resource-group $RESOURCE_GROUP \
  --hostname "${ORG_NAME}.open-regels.nl"

# Get validation token
az staticwebapp hostname show \
  --name "${ORG_NAME}-query-portal" \
  --resource-group $RESOURCE_GROUP \
  --hostname "${ORG_NAME}.open-regels.nl"
```

### 5. Update DNS Zone

In Azure Portal or CLI, add to your `open-regels.nl` DNS zone:

```bash
# Get Static Web App IP (for A record)
STATIC_IP=$(az staticwebapp show \
  --name "${ORG_NAME}-query-portal" \
  --resource-group $RESOURCE_GROUP \
  --query "customDomains[0].validationToken" -o tsv)

# Add A record
az network dns record-set a add-record \
  --resource-group rg-open-regels-dns \
  --zone-name open-regels.nl \
  --record-set-name $ORG_NAME \
  --ipv4-address <Static-Web-App-IP>

# Add TXT record for validation
az network dns record-set txt add-record \
  --resource-group rg-open-regels-dns \
  --zone-name open-regels.nl \
  --record-set-name "_dnsauth.${ORG_NAME}" \
  --value "<validation-token>"
```

### 6. Verify Deployment

After DNS propagation (5-10 minutes):

```bash
# Test custom domain
curl -I https://${ORG_NAME}.open-regels.nl

# Test SPARQL query
curl "https://${ORG_NAME}.open-regels.nl"
```

## Configuration for Each Organization

### AOW Leeftijd Service

**Repository**: `open-regels/aow-query-portal`  
**Domain**: `aow.open-regels.nl`  
**TriplyDB Dataset**: `stevenport/aow-leeftijd-service`

```json
{
  "organization": {
    "name": "AOW Leeftijd Service",
    "shortName": "aow-service",
    "description": "Publieke toegang tot AOW-leeftijd beslissingsregels",
    "primaryColor": "#003DA5"
  },
  "triplydb": {
    "endpoint": "https://open-regels.triply.cc/stevenport/aow-leeftijd-service/sparql",
    "account": "stevenport",
    "dataset": "aow-leeftijd-service"
  },
  "queries": [
    {
      "id": "distribution-urls",
      "name": "DMN Distributie URLs",
      "description": "Haal downloadlinks op voor het DMN beslissingsmodel",
      "category": "Distributions",
      "sparql": "PREFIX dcat: <http://www.w3.org/ns/dcat#>\nPREFIX dct: <http://purl.org/dc/terms/>\nPREFIX ex: <https://open-regels.triply.cc/stevenport/aow-leeftijd-service/id/>\n\nSELECT ?distributionTitle ?format ?mediaType ?accessURL ?downloadURL ?byteSize ?issued\nWHERE {\n  ex:aow_leeftijd_regels dcat:distribution ?distribution .\n  ?distribution dct:title ?distributionTitle ;\n                dct:format ?format ;\n                dcat:mediaType ?mediaType ;\n                dcat:accessURL ?accessURL ;\n                dcat:downloadURL ?downloadURL ;\n                dct:issued ?issued .\n  OPTIONAL { ?distribution dcat:byteSize ?byteSize . }\n  FILTER(LANG(?distributionTitle) = \"nl\" || LANG(?distributionTitle) = \"\")\n}\nORDER BY ?issued"
    },
    {
      "id": "rule-metadata",
      "name": "Regelset Metadata",
      "description": "Bekijk metadata van de AOW-leeftijd regelset",
      "category": "Metadata",
      "sparql": "PREFIX dct: <http://purl.org/dc/terms/>\nPREFIX cpsv-ap: <http://purl.org/vocab/cpsv#>\nPREFIX cprmv: <https://open-regels.triply.cc/stevenport/cprmv/def/>\nPREFIX ex: <https://open-regels.triply.cc/stevenport/aow-leeftijd-service/id/>\n\nSELECT ?title ?description ?version ?implements ?implementsVersion ?rulesetType ?ruleMethod\nWHERE {\n  ex:aow_leeftijd_regels a cpsv-ap:Rule ;\n    dct:title ?title ;\n    dct:description ?description ;\n    dct:version ?version ;\n    cprmv:implements ?implements ;\n    cprmv:implementsVersion ?implementsVersion ;\n    cprmv:rulesetType ?rulesetType ;\n    cprmv:ruleMethod ?ruleMethod .\n  FILTER(LANG(?title) = \"nl\")\n  FILTER(LANG(?description) = \"nl\")\n}"
    },
    {
      "id": "full-dataset",
      "name": "Volledige Dataset Export",
      "description": "Exporteer alle triples uit de AOW leeftijd dataset",
      "category": "Export",
      "sparql": "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }"
    }
  ]
}
```

### Template for Other Organizations

Copy and modify for each municipality/organization:

```bash
# Example: Gemeente Amsterdam
cp -r triply-portal-template gemeente-amsterdam-portal
cd gemeente-amsterdam-portal

# Update config.json
# - organization.name: "Gemeente Amsterdam"
# - organization.shortName: "amsterdam"
# - triplydb.dataset: "gemeente-amsterdam-dataset"
# - queries: Amsterdam-specific queries

# Deploy
git init && git add . && git commit -m "Initial commit"
gh repo create open-regels/amsterdam-query-portal --public --source=. --push
```

## Automation Script

Create `deploy-new-portal.sh`:

```bash
#!/bin/bash

set -e

ORG_NAME=$1
DATASET_NAME=$2

if [ -z "$ORG_NAME" ] || [ -z "$DATASET_NAME" ]; then
  echo "Usage: ./deploy-new-portal.sh <org-name> <dataset-name>"
  echo "Example: ./deploy-new-portal.sh aow aow-leeftijd-service"
  exit 1
fi

echo "🚀 Deploying portal for ${ORG_NAME}..."

# 1. Create repository from template
REPO_NAME="${ORG_NAME}-query-portal"
cp -r triply-portal-template $REPO_NAME
cd $REPO_NAME

# 2. Update config.json (requires manual editing or jq)
echo "⚠️  Please update config.json with organization-specific details"
echo "Press Enter when ready..."
read

# 3. Initialize Git
git init
git add .
git commit -m "Initial ${ORG_NAME} query portal"

# 4. Create GitHub repo
gh repo create "open-regels/${REPO_NAME}" --public --source=. --remote=origin --push

# 5. Create Azure Static Web App
az staticwebapp create \
  --name "${ORG_NAME}-query-portal" \
  --resource-group "rg-open-regels-portals" \
  --source "https://github.com/open-regels/${REPO_NAME}" \
  --location westeurope \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github

# 6. Add custom domain
az staticwebapp hostname set \
  --name "${ORG_NAME}-query-portal" \
  --resource-group "rg-open-regels-portals" \
  --hostname "${ORG_NAME}.open-regels.nl"

echo "✅ Portal deployed!"
echo "📋 Next steps:"
echo "   1. Add DNS A record for ${ORG_NAME}.open-regels.nl"
echo "   2. Add TXT record for validation"
echo "   3. Wait for DNS propagation (5-10 minutes)"
echo "   4. Visit https://${ORG_NAME}.open-regels.nl"
```

## Cost Estimation

### Azure Static Web Apps Pricing (as of 2025)

**Free Tier** (per app):
- 100 GB bandwidth/month
- Custom domains: Yes
- SSL certificates: Included
- GitHub Actions: Included

**Estimated Costs for 10 Organizations**:
- If all stay within free tier: €0/month
- If bandwidth exceeded: ~€0.15/GB after 100GB

### Optimization Tips

1. Enable caching headers (already in `staticwebapp.config.json`)
2. Compress assets during build
3. Use CDN for static assets if needed
4. Monitor bandwidth in Azure Portal

## Maintenance Workflow

### Update Template

```bash
# Make changes to base template
cd triply-portal-template
# ... make changes ...
git commit -m "Update feature X"

# Apply to specific portal
cd ../aow-query-portal
git remote add template ../triply-portal-template
git fetch template
git merge template/main
git push
```

### Update Single Portal

```bash
cd aow-query-portal
# Edit config.json or other files
git commit -am "Update AOW queries"
git push  # Automatic deployment via GitHub Actions
```

## Monitoring

### Set up Azure Alerts

```bash
# Alert on high bandwidth usage
az monitor metrics alert create \
  --name "${ORG_NAME}-bandwidth-alert" \
  --resource-group rg-open-regels-portals \
  --scopes $(az staticwebapp show -n "${ORG_NAME}-query-portal" -g rg-open-regels-portals --query id -o tsv) \
  --condition "avg DataOut > 80000000000" \
  --description "Alert when bandwidth exceeds 80GB"
```

### View Logs

```bash
# Stream logs
az staticwebapp logs \
  --name "${ORG_NAME}-query-portal" \
  --resource-group rg-open-regels-portals \
  --follow
```

## Checklist for Each New Portal

- [ ] Create repository from template
- [ ] Update `config.json` with organization details
- [ ] Add organization logo to `assets/logo.png`
- [ ] Update SPARQL queries for organization's dataset
- [ ] Create Azure Static Web App
- [ ] Configure custom domain
- [ ] Add DNS A and TXT records
- [ ] Wait for DNS propagation
- [ ] Test SPARQL queries
- [ ] Test all download formats
- [ ] Add to monitoring dashboard
- [ ] Document in organization wiki

## Next Steps

1. Deploy AOW portal first (already configured)
2. Test thoroughly
3. Document any issues/improvements
4. Create deployment script for automation
5. Roll out to other organizations
