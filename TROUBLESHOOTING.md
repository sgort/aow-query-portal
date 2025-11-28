# Troubleshooting Guide - Query Issues

## ✅ Changes Made

1. **Account name updated**: `stevenport` → `stevengort`
2. **Namespace URIs updated**: 
   - `cpsv-ap:` now uses `<http://data.europa.eu/m8g/>`
   - `cprmv:` now uses `<https://cprmv.open-regels.nl/0.3.0/>`
3. **New query added**: "Temporal Rules" (first in the list)
4. **All resource URIs updated**: Now use `stevengort` account

## 🔍 Testing Queries

### Option 1: Use the Test Script (Recommended)

```bash
./test-endpoint.sh
```

This will test all 4 queries against your TriplyDB endpoint and show you which ones work.

### Option 2: Test Manually in TriplyDB

1. Go to: https://open-regels.triply.cc/stevengort/aow-leeftijd-service
2. Click on "SPARQL" tab
3. Copy each query from `config.json` and test it
4. Verify results are returned

### Option 3: Test with curl

```bash
# Simple test
curl "https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql?query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%201" \
  -H "Accept: application/sparql-results+json"
```

## 🐛 Common Issues & Solutions

### Issue 1: "No results found"

**Possible causes:**
- Dataset doesn't contain data matching the query
- Wrong namespace URIs
- Wrong resource identifiers

**Solutions:**
1. Test with simple query first:
   ```sparql
   SELECT * WHERE { ?s ?p ?o } LIMIT 10
   ```
   This should return SOME data if the dataset is populated.

2. Check what types exist in your dataset:
   ```sparql
   SELECT DISTINCT ?type WHERE { ?s a ?type }
   ```

3. Check what predicates exist:
   ```sparql
   SELECT DISTINCT ?p WHERE { ?s ?p ?o } LIMIT 100
   ```

### Issue 2: "SPARQL query failed (404)"

**Cause:** Endpoint URL is wrong

**Solution:**
Verify the endpoint URL:
```bash
curl -I https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql
```

Should return HTTP 200 or 400 (not 404).

### Issue 3: "SPARQL query failed (403)"

**Cause:** Dataset is private or account name is wrong

**Solutions:**
1. Check dataset visibility in TriplyDB
2. Verify account name: `stevengort` (not `stevenport`)
3. Verify dataset name: `aow-leeftijd-service`

### Issue 4: Temporal Rules query returns no results

**Possible causes:**
- No data with `cprmv:extends` property
- Wrong `cpsv-ap:Rule` class URI
- Wrong CPRMV namespace

**Debugging steps:**
1. Check if any rules exist:
   ```sparql
   PREFIX cpsv-ap: <http://data.europa.eu/m8g/>
   SELECT * WHERE { ?rule a cpsv-ap:Rule } LIMIT 10
   ```

2. Check what CPRMV properties exist:
   ```sparql
   PREFIX cprmv: <https://cprmv.open-regels.nl/0.3.0/>
   SELECT DISTINCT ?p WHERE { 
     ?s ?p ?o . 
     FILTER(STRSTARTS(STR(?p), "https://cprmv.open-regels.nl/"))
   }
   ```

3. If the namespace is different, update in `config.json`:
   ```json
   "sparql": "PREFIX cprmv: <YOUR-ACTUAL-NAMESPACE>"
   ```

### Issue 5: Distribution URLs query returns nothing

**Cause:** Resource `ex:aow_leeftijd_regels` doesn't exist with that exact URI

**Solutions:**
1. Find what resources exist:
   ```sparql
   PREFIX dcat: <http://www.w3.org/ns/dcat#>
   SELECT DISTINCT ?s WHERE { ?s dcat:distribution ?d } LIMIT 10
   ```

2. Update the resource URI in `config.json` if different

## 🔧 Quick Fixes

### Fix 1: Update Namespace URIs

If your CPRMV namespace is different, update in `config.json`:

```json
{
  "sparql": "PREFIX cprmv: <https://YOUR-ACTUAL-NAMESPACE/>"
}
```

Common alternatives:
- `https://cprmv.open-regels.nl/0.3.0/`
- `https://cprmv.open-regels.nl/def/`
- `https://open-regels.triply.cc/stevengort/cprmv/def/`

### Fix 2: Update CPSV-AP URI

If rules use a different class:

```json
{
  "sparql": "PREFIX cpsv-ap: <http://purl.org/vocab/cpsv#>"
}
```

or

```json
{
  "sparql": "PREFIX cpsv-ap: <http://data.europa.eu/m8g/>"
}
```

### Fix 3: Find the Correct Resource URI

Run this to find resources:
```sparql
SELECT DISTINCT ?s WHERE { ?s ?p ?o } LIMIT 100
```

Then update in `config.json`:
```json
{
  "sparql": "PREFIX ex: <https://open-regels.triply.cc/stevengort/aow-leeftijd-service/id/>\n\nSELECT ... WHERE { ex:YOUR_ACTUAL_RESOURCE ..."
}
```

## 📋 Verification Checklist

Before running the web app:

- [ ] Endpoint URL is correct (test with curl)
- [ ] Dataset is public or accessible
- [ ] At least one simple query returns results
- [ ] Namespace URIs match your data
- [ ] Resource URIs exist in your dataset
- [ ] Language filters match your data (nl, en, or no filter)

## 🧪 Step-by-Step Debugging

1. **Test endpoint connectivity:**
   ```bash
   ./test-endpoint.sh
   ```

2. **If connectivity fails:**
   - Check account name: `stevengort`
   - Check dataset name: `aow-leeftijd-service`
   - Verify dataset is public

3. **If queries return no results:**
   - Test with `SELECT * WHERE { ?s ?p ?o } LIMIT 10`
   - Check namespaces with script above
   - Update `config.json` with correct URIs

4. **If specific query fails:**
   - Copy query from `config.json`
   - Test in TriplyDB SPARQL interface
   - Adjust based on error message
   - Update `config.json`

## 🆘 Still Having Issues?

1. **Check TriplyDB directly:**
   Visit: https://open-regels.triply.cc/stevengort/aow-leeftijd-service

2. **Export a sample:**
   In TriplyDB, go to "Statements" tab and see what data exists

3. **Share the error:**
   - Browser console (F12 → Console tab)
   - Network tab (F12 → Network tab)
   - Screenshot of error message

## 📝 Example: Fixing a Query

**Original query fails:**
```sparql
PREFIX cprmv: <https://cprmv.open-regels.nl/0.3.0/>
SELECT ?rule WHERE { ?rule cprmv:extends ?x }
```

**Debug:**
```sparql
# Check if cprmv namespace exists
SELECT DISTINCT ?p WHERE { 
  ?s ?p ?o . 
  FILTER(STRSTARTS(STR(?p), "https://cprmv"))
}
```

**Result shows:** `https://open-regels.triply.cc/stevengort/cprmv/def/extends`

**Fix:**
```sparql
PREFIX cprmv: <https://open-regels.triply.cc/stevengort/cprmv/def/>
SELECT ?rule WHERE { ?rule cprmv:extends ?x }
```

Update this in `config.json` and test again!
