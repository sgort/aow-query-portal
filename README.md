# TriplyDB SPARQL Query Portal

A modern, static web application for providing public access to SPARQL queries and linked data from TriplyDB instances. Built with vanilla JavaScript and Vite, designed for Azure Static Web Apps deployment.

## Features

- ✅ **Pre-defined SPARQL Queries** - Execute curated queries with one click
- ✅ **Multi-format Downloads** - Export results in RDF/XML, Turtle, JSON-LD, and JSON
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Organization Branding** - Customizable colors, logos, and metadata
- ✅ **Zero Authentication** - Public access with fair use policy
- ✅ **Static Deployment** - Secure, fast, and scalable on Azure

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Static Web App (Azure)                                 │
│  ┌──────────────────────────────────────────┐           │
│  │  HTML/CSS/JS                             │           │
│  │  - Query Interface                       │           │
│  │  - Results Renderer                      │           │
│  │  - Download Manager                      │           │
│  └────────────┬─────────────────────────────┘           │
└───────────────┼─────────────────────────────────────────┘
                │
                │ SPARQL over HTTP
                ▼
┌─────────────────────────────────────────────────────────┐
│  TriplyDB Instance                                      │
│  https://open-regels.triply.cc                          │
│  ┌──────────────────────────────────────────┐           │
│  │  RDF Dataset                             │           │
│  │  - Metadata (TTL)                        │           │
│  │  - Distribution URLs                     │           │
│  │  - SPARQL Endpoint                       │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
triply-static-webapp/
├── index.html              # Main HTML template
├── style.css               # Application styles
├── main.js                 # Application entry point
├── config.json             # Organization & query configuration
├── modules/
│   ├── sparql-client.js    # SPARQL query execution
│   ├── download-manager.js # Multi-format downloads
│   └── results-renderer.js # Results display
├── assets/
│   └── logo.png           # Organization logo
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # CI/CD pipeline
├── package.json
├── vite.config.js
└── staticwebapp.config.json
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- Azure subscription (connected to GitHub)
- Access to Azure DNS zone for custom domains
- TriplyDB instance with datasets

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd triply-static-webapp
npm install
```

### 2. Configure Your Organization

Edit `config.json`:

```json
{
  "organization": {
    "name": "Your Organization Name",
    "shortName": "your-org",
    "description": "Public access to linked data",
    "logo": "./assets/logo.png",
    "primaryColor": "#003DA5"
  },
  "triplydb": {
    "endpoint": "https://your-instance.triply.cc/account/dataset/sparql",
    "account": "account-name",
    "dataset": "dataset-name"
  },
  "queries": [
    {
      "id": "your-query-id",
      "name": "Query Name",
      "description": "Query description",
      "category": "Category",
      "sparql": "SELECT * WHERE { ?s ?p ?o } LIMIT 10"
    }
  ]
}
```

### 3. Add Your Logo

Place your organization logo at `assets/logo.png` (recommended size: 128x64px or similar aspect ratio).

### 4. Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to test the application.

## Deployment to Azure

### Option 1: Azure Portal (First-time Setup)

1. **Create Static Web App**
   - Go to Azure Portal → Create Resource → Static Web App
   - Choose your GitHub repository
   - Build preset: Custom
   - App location: `/`
   - Output location: `dist`

2. **Configure Custom Domain**
   - In Azure Portal → Your Static Web App → Custom domains
   - Add custom domain (e.g., `aow.open-regels.nl`)
   - Get the validation TXT record

3. **Update DNS**
   - In your DNS zone, add:
     ```
     A record: @ → <Azure Static Web Apps IP>
     TXT record: @ → <validation token>
     ```

4. **Get Deployment Token**
   - In Azure Portal → Your Static Web App → Manage deployment token
   - Copy the token

5. **Add GitHub Secret**
   - In GitHub → Your repository → Settings → Secrets
   - Add `AZURE_STATIC_WEB_APPS_API_TOKEN` with your deployment token

### Option 2: Azure CLI (Automated)

```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create \
  --name rg-open-regels-static-apps \
  --location westeurope

# Create static web app
az staticwebapp create \
  --name aow-query-portal \
  --resource-group rg-open-regels-static-apps \
  --source https://github.com/your-username/your-repo \
  --location westeurope \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github

# Add custom domain
az staticwebapp hostname set \
  --name aow-query-portal \
  --resource-group rg-open-regels-static-apps \
  --hostname aow.open-regels.nl
```

### DNS Configuration

For each organization site, add an A record:

```
aow.open-regels.nl      A    <Azure Static Web App IP>
gemeente-x.open-regels.nl A  <Azure Static Web App IP>
```

## Multi-Organization Deployment

### Strategy 1: Separate Repositories (Recommended)

Each organization gets its own repository and Azure Static Web App:

```
├── aow-query-portal/          (separate repo)
│   └── config.json            (AOW-specific config)
├── gemeente-x-portal/         (separate repo)
│   └── config.json            (Gemeente X config)
└── gemeente-y-portal/         (separate repo)
    └── config.json            (Gemeente Y config)
```

Benefits:
- Independent deployments
- Organization-specific customizations
- Separate Azure billing
- Isolated Git histories

### Strategy 2: Monorepo with Multiple Configs

Single repository with organization-specific folders:

```
triply-portals/
├── organizations/
│   ├── aow/
│   │   ├── config.json
│   │   └── assets/
│   ├── gemeente-x/
│   │   ├── config.json
│   │   └── assets/
│   └── gemeente-y/
│       ├── config.json
│       └── assets/
├── src/                       (shared codebase)
└── .github/workflows/
    ├── deploy-aow.yml
    ├── deploy-gemeente-x.yml
    └── deploy-gemeente-y.yml
```

## Configuration Reference

### Query Configuration

Each query in `config.json` requires:

```json
{
  "id": "unique-id",              // Used for filenames
  "name": "Display Name",         // Shown in dropdown
  "description": "Description",   // Help text
  "category": "Category Name",    // For grouping
  "sparql": "SELECT..."          // SPARQL query string
}
```

### Export Format Configuration

Default formats are included, but you can customize:

```json
{
  "id": "turtle",
  "name": "Turtle",
  "extension": "ttl",
  "mediaType": "text/turtle",
  "accept": "text/turtle"
}
```

## SPARQL Query Examples

### Distribution URLs (from your DMN-STORAGE.md)

```sparql
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX ex: <https://open-regels.triply.cc/stevenport/aow-leeftijd-service/id/>

SELECT ?distributionTitle ?format ?mediaType ?accessURL ?downloadURL
WHERE {
  ex:aow_leeftijd_regels dcat:distribution ?distribution .
  ?distribution dct:title ?distributionTitle ;
                dct:format ?format ;
                dcat:mediaType ?mediaType ;
                dcat:accessURL ?accessURL ;
                dcat:downloadURL ?downloadURL .
  FILTER(LANG(?distributionTitle) = "nl")
}
```

### Full Export (CONSTRUCT)

```sparql
CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }
```

## Customization

### Branding

- **Colors**: Update `primaryColor` in `config.json` or modify CSS variables in `style.css`
- **Logo**: Replace `assets/logo.png`
- **Typography**: Modify font-family in `style.css`

### Adding New Queries

1. Add query to `config.json`:
   ```json
   {
     "id": "new-query",
     "name": "New Query Name",
     "description": "What this query does",
     "category": "Category",
     "sparql": "SELECT..."
   }
   ```

2. Commit and push - automatic deployment via GitHub Actions

### Security Headers

Configured in `staticwebapp.config.json`:
- CORS enabled for SPARQL endpoints
- Content Security Policy
- X-Frame-Options
- Referrer Policy

## Monitoring & Maintenance

### Azure Monitoring

- Application Insights automatically enabled
- Monitor in Azure Portal → Your Static Web App → Monitoring

### GitHub Actions

- View deployment status: Repository → Actions
- Failed deployments trigger email notifications

### Health Checks

Test SPARQL endpoint connectivity:

```bash
curl -H "Accept: application/sparql-results+json" \
  "https://open-regels.triply.cc/stevenport/aow-leeftijd-service/sparql?query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%201"
```

## Troubleshooting

### Query Returns No Results

1. Test query in TriplyDB web interface
2. Check for typos in prefixes and URIs
3. Verify dataset has data: `SELECT * WHERE { ?s ?p ?o } LIMIT 1`

### Download Fails

1. Verify query type matches format (CONSTRUCT for RDF, SELECT for JSON)
2. Check browser console for CORS errors
3. Test endpoint directly with curl

### Deployment Fails

1. Check GitHub Actions logs
2. Verify `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is set
3. Ensure `npm run build` succeeds locally

## License

MIT License - See LICENSE file

## Support

For issues with:
- **TriplyDB**: https://triply.cc/support
- **Azure Static Web Apps**: https://learn.microsoft.com/azure/static-web-apps
- **This template**: Open an issue in the repository
