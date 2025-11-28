# Manual Testing Guide

Since you don't have `jq` installed, here's how to test manually.

## Quick Test in Browser

### Test 1: Endpoint Accessibility

Open this URL in your browser:
```
https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql?query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%201
```

**Expected:** You should see JSON data or an error message (not a 404)

### Test 2: TriplyDB Web Interface

1. Go to: https://open-regels.triply.cc/stevengort/aow-leeftijd-service
2. Click on the "SPARQL" tab (or "Query" tab)
3. Paste this query:

```sparql
PREFIX cpsv-ap: <http://data.europa.eu/m8g/>
PREFIX cprmv: <https://cprmv.open-regels.nl/0.3.0/>
PREFIX dct: <http://purl.org/dc/terms/>

SELECT ?rule ?title ?extends ?validFrom ?validUntil ?confidence 
WHERE {
  ?rule a cpsv-ap:Rule ;
        dct:title ?title ;
        cprmv:extends ?extends ;
        cprmv:validFrom ?validFrom ;
        cprmv:validUntil ?validUntil ;
        cprmv:confidence ?confidence .
  
  FILTER(LANG(?title) = "nl")
}
ORDER BY ?validFrom
LIMIT 10
```

4. Click "Run" or "Execute"

**Expected:** You should see results in a table

## Simple Command Line Tests

### Test 1: Check endpoint exists
```bash
curl -I "https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql"
```

**Expected:** `HTTP/2 200` or `HTTP/2 400` (not 404)

### Test 2: Simple query
```bash
curl "https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql?query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%201" \
  -H "Accept: application/sparql-results+json"
```

**Expected:** You should see JSON output with results

### Test 3: Check response size
```bash
curl -s "https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql?query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%2010" \
  -H "Accept: application/sparql-results+json" | wc -c
```

**Expected:** A number greater than 100 (means you got data back)

## What to Look For

### ✅ Good Signs:
- HTTP 200 response
- JSON output contains `"bindings"`
- Response is more than a few hundred bytes
- No error messages in the output

### ❌ Bad Signs:
- HTTP 404 - Endpoint doesn't exist (check account/dataset name)
- HTTP 403 - Dataset is private or inaccessible
- HTTP 500 - Server error (query syntax issue)
- Empty `"bindings": []` - Query is correct but no data matches
- Error message about "Unknown namespace" - Wrong namespace URI

## Debugging Steps

### If you get HTTP 404:
```bash
# Try without the dataset name to check the account exists
curl -I "https://open-regels.triply.cc/stevengort"
```

### If you get empty results:
1. Check what data exists:
```bash
# URL encoded: SELECT * WHERE { ?s ?p ?o } LIMIT 10
curl "https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql?query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%2010"
```

2. Check what classes exist:
```bash
# URL encoded: SELECT DISTINCT ?type WHERE { ?s a ?type }
curl "https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql?query=SELECT%20DISTINCT%20%3Ftype%20WHERE%20%7B%20%3Fs%20a%20%3Ftype%20%7D"
```

## Testing the Web App

Once you've verified queries work in TriplyDB web interface:

1. Start the local server:
```bash
npm install
npm run dev
```

2. Open http://localhost:3000

3. Select "Temporal Rules" from dropdown

4. Click "Uitvoeren" (Execute)

5. You should see results in a table

## If Queries Don't Return Results

### Option A: Update Namespaces

Edit `config.json` and change the namespace URIs to match your data.

Find what namespaces exist:
```sparql
SELECT DISTINCT ?p WHERE { 
  ?s ?p ?o . 
  FILTER(CONTAINS(STR(?p), "cprmv"))
} 
LIMIT 50
```

### Option B: Simplify the Query

Start with a very simple query:
```sparql
SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 100
```

Once that works, gradually add:
1. Type filter: `?s a cpsv-ap:Rule`
2. Properties: `?s dct:title ?title`
3. Language filters: `FILTER(LANG(?title) = "nl")`

## Need Help?

Share the output of:
```bash
curl -v "https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql?query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%201" \
  -H "Accept: application/sparql-results+json" 2>&1 | head -50
```

This shows the full HTTP exchange for debugging.
