# 📖 Documentation Index

Welcome to your TriplyDB Static Web App package! Here's where to find everything:

## 🎯 First Time? Start Here

1. **[START_HERE.md](START_HERE.md)** ⭐ **READ THIS FIRST**
   - Complete overview of what you have
   - Quick 5-minute test instructions
   - Next steps for deployment
   - Example workflow

## 📚 Main Documentation

2. **[README.md](README.md)** - Complete Documentation
   - Features overview
   - Architecture explanation
   - Setup instructions
   - Configuration reference
   - Troubleshooting guide

3. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment Guide
   - Step-by-step Azure setup
   - Multi-organization strategy
   - DNS configuration
   - Automation scripts
   - Cost estimation

4. **[QUICKREF.md](QUICKREF.md)** - Quick Reference
   - Common commands
   - Configuration snippets
   - Troubleshooting tips
   - Monitoring commands

5. **[CONFIG_EXAMPLES.md](CONFIG_EXAMPLES.md)** - Configuration Examples
   - AOW Leeftijd Service (your setup)
   - Gemeente Amsterdam example
   - CPRMV Platform example
   - Common SPARQL patterns

## 🗂️ Project Structure

```
triply-static-webapp/
│
├── 📄 Documentation (you are here)
│   ├── START_HERE.md          ⭐ Start with this
│   ├── README.md              📖 Full documentation
│   ├── DEPLOYMENT.md          🚀 Deployment guide
│   ├── QUICKREF.md            ⚡ Command reference
│   ├── CONFIG_EXAMPLES.md     💡 Configuration examples
│   └── STRUCTURE.txt          📁 File structure
│
├── ⚙️  Application Code
│   ├── index.html             Main HTML template
│   ├── style.css              All styles
│   ├── main.js                Application entry point
│   ├── config.json            ⚠️  CUSTOMIZE THIS
│   └── modules/
│       ├── sparql-client.js
│       ├── download-manager.js
│       └── results-renderer.js
│
├── 🎨 Assets
│   └── assets/
│       └── logo.svg           ⚠️  REPLACE THIS
│
├── 🔧 Configuration Files
│   ├── package.json           Node.js dependencies
│   ├── vite.config.js         Build configuration
│   └── staticwebapp.config.json  Azure configuration
│
├── 🚀 Deployment
│   └── .github/workflows/
│       └── azure-static-web-apps.yml
│
└── 🛠️  Utility Scripts
    ├── start.sh               Quick start dev server
    └── verify.sh              Pre-deployment checks
```

## 🎬 Quick Start (5 Minutes)

```bash
# 1. Open terminal in this directory
cd triply-static-webapp

# 2. Install dependencies
npm install

# 3. Start local server
./start.sh

# 4. Open browser to http://localhost:3000
# 5. Test the pre-configured AOW queries!
```

## 📋 Documentation Purpose Guide

| Document | When to Use It |
|----------|---------------|
| **START_HERE.md** | First time setup, overview |
| **README.md** | Detailed how-to, features, troubleshooting |
| **DEPLOYMENT.md** | Deploying to Azure, DNS setup |
| **QUICKREF.md** | Daily operations, quick commands |
| **CONFIG_EXAMPLES.md** | Customizing for different orgs |

## 🎯 Common Tasks → Documentation

| Task | See Document | Section |
|------|--------------|---------|
| First deployment | START_HERE.md | "Immediate Next Steps" |
| Add new query | CONFIG_EXAMPLES.md | "Common SPARQL Patterns" |
| Change branding | README.md | "Customization" |
| Deploy to Azure | DEPLOYMENT.md | "Step-by-Step Setup" |
| Fix build error | QUICKREF.md | "Troubleshooting" |
| Add organization | DEPLOYMENT.md | "Template for Other Organizations" |
| Update DNS | DEPLOYMENT.md | "Update DNS Zone" |
| Monitor costs | DEPLOYMENT.md | "Cost Estimation" |

## 🚦 Your Journey

```
1. START_HERE.md        → Understand what you have
       ↓
2. Test locally         → ./start.sh
       ↓
3. Customize            → Edit config.json
       ↓
4. DEPLOYMENT.md        → Deploy to Azure
       ↓
5. QUICKREF.md          → Bookmark for daily use
```

## ⚡ Most Common Questions

**Q: How do I test locally?**  
A: Run `./start.sh` and visit http://localhost:3000

**Q: How do I customize for my organization?**  
A: Edit `config.json` - see CONFIG_EXAMPLES.md

**Q: How do I deploy?**  
A: Follow DEPLOYMENT.md step-by-step

**Q: How do I add a new query?**  
A: Add to `config.json` queries array - see CONFIG_EXAMPLES.md

**Q: What if something breaks?**  
A: Run `./verify.sh` to diagnose issues

**Q: How much will this cost?**  
A: Likely €0/month on Azure free tier - see DEPLOYMENT.md

## 🎯 Pre-configured for You

✅ AOW Leeftijd Service queries (from your DMN-STORAGE.md)  
✅ TriplyDB endpoint (open-regels.triply.cc)  
✅ Azure Static Web Apps ready  
✅ Multi-format downloads  
✅ Dutch language UI  
✅ Organization branding support  

## 🆘 Need Help?

1. Check the specific document for your task (see table above)
2. Run `./verify.sh` to diagnose issues
3. Review QUICKREF.md troubleshooting section
4. Test locally with `./start.sh`

## 🎉 Ready to Start?

```bash
# Open the starting guide
cat START_HERE.md

# Or jump right in
./start.sh
```

---

**Tip**: Bookmark QUICKREF.md for daily operations after your initial setup!
