# Quick Reference Card

## 🚀 Common Commands

### Local Development
```bash
npm install          # Install dependencies (first time)
./start.sh          # Start dev server (http://localhost:3000)
npm run dev         # Alternative start command
npm run build       # Build for production
npm run preview     # Preview production build
./verify.sh         # Run pre-deployment checks
```

### Configuration
```bash
# Edit organization settings
vim config.json

# Test TriplyDB connection
curl "https://open-regels.triply.cc/stevenport/aow-leeftijd-service/sparql?query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%201"
```

### Deployment (Azure)
```bash
# Create new portal instance
az staticwebapp create \
  --name "org-query-portal" \
  --resource-group "rg-open-regels-portals" \
  --source "https://github.com/open-regels/org-portal" \
  --location westeurope \
  --branch main \
  --app-location "/" \
  --output-location "dist"

# Add custom domain
az staticwebapp hostname set \
  --name "org-query-portal" \
  --resource-group "rg-open-regels-portals" \
  --hostname "org.open-regels.nl"

# View deployment status
az staticwebapp show \
  --name "org-query-portal" \
  --resource-group "rg-open-regels-portals"
```

### DNS (Azure DNS)
```bash
# Add A record
az network dns record-set a add-record \
  --resource-group "rg-open-regels-dns" \
  --zone-name "open-regels.nl" \
  --record-set-name "org" \
  --ipv4-address "<Static-Web-App-IP>"

# Add TXT validation record
az network dns record-set txt add-record \
  --resource-group "rg-open-regels-dns" \
  --zone-name "open-regels.nl" \
  --record-set-name "_dnsauth.org" \
  --value "<validation-token>"
```

## 📁 File Structure Reference

```
triply-static-webapp/
├── 📄 index.html              - Main page template
├── 🎨 style.css               - All styles
├── ⚙️  config.json            - ⚠️  CUSTOMIZE THIS
├── 📜 main.js                 - App initialization
├── 📁 modules/
│   ├── sparql-client.js       - Query execution
│   ├── download-manager.js    - File downloads
│   └── results-renderer.js    - Display results
├── 📁 assets/
│   └── logo.png               - ⚠️  REPLACE THIS
├── 📁 .github/workflows/
│   └── azure-static-web-apps.yml - CI/CD
└── 🔧 staticwebapp.config.json - Azure config
```

## 🔧 Configuration Quick Edit

### Change Organization Name
```json
{
  "organization": {
    "name": "NEW NAME HERE",
    "shortName": "new-short-name"
  }
}
```

### Add New Query
```json
{
  "queries": [
    {
      "id": "my-new-query",
      "name": "My New Query",
      "description": "What this does",
      "category": "Category",
      "sparql": "SELECT * WHERE { ?s ?p ?o } LIMIT 10"
    }
  ]
}
```

### Change Colors
```json
{
  "organization": {
    "primaryColor": "#003DA5"  // Any hex color
  }
}
```

## 🐛 Troubleshooting

### Issue: Query Returns No Results
```bash
# Test query in TriplyDB directly
curl "https://open-regels.triply.cc/.../sparql?query=YOUR_ENCODED_QUERY"

# Check dataset exists
curl https://open-regels.triply.cc/account/dataset
```

### Issue: Build Fails
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Cannot Connect to TriplyDB
```bash
# Verify endpoint URL in config.json
# Test with simple query
curl -I "https://open-regels.triply.cc/stevenport/aow-leeftijd-service/sparql"
```

### Issue: Custom Domain Not Working
```bash
# Check DNS propagation
dig org.open-regels.nl

# Verify TXT record
dig TXT _dnsauth.org.open-regels.nl

# Check Azure Static Web App status
az staticwebapp show --name "org-query-portal" -g "rg-open-regels-portals"
```

## 📊 Monitoring

### Check Bandwidth Usage
```bash
az monitor metrics list \
  --resource $(az staticwebapp show -n "portal" -g "rg-portals" --query id -o tsv) \
  --metric DataOut \
  --start-time 2025-01-01T00:00:00Z
```

### View Logs
```bash
az staticwebapp logs \
  --name "org-portal" \
  --resource-group "rg-open-regels-portals" \
  --follow
```

## 🔒 Security Checklist

- [ ] Config has no sensitive data
- [ ] HTTPS enabled (automatic with Azure)
- [ ] CORS properly configured
- [ ] No API keys in client code
- [ ] CSP headers set
- [ ] Fair use policy documented

## 📞 Support Resources

- **TriplyDB Docs**: https://triply.cc/docs
- **Azure Static Web Apps**: https://learn.microsoft.com/azure/static-web-apps
- **SPARQL 1.1**: https://www.w3.org/TR/sparql11-query/
- **Vite Docs**: https://vitejs.dev

## 💡 Tips

1. **Test locally first**: Always run `./verify.sh` before pushing
2. **Use meaningful commit messages**: Triggers automatic deployment
3. **Monitor bandwidth**: Free tier = 100GB/month
4. **Cache queries**: Results renderer caches automatically
5. **Version queries**: Use descriptive query IDs for tracking
6. **Document changes**: Update query descriptions when modifying SPARQL
