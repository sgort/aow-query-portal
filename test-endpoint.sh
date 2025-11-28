#!/bin/bash

echo "🔍 Testing TriplyDB Connection and Queries"
echo "=========================================="
echo ""

ENDPOINT="https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql"

# Simple URL encoding function (basic implementation)
urlencode() {
    local string="$1"
    local strlen=${#string}
    local encoded=""
    local pos c o

    for (( pos=0 ; pos<strlen ; pos++ )); do
        c=${string:$pos:1}
        case "$c" in
            [-_.~a-zA-Z0-9] ) o="${c}" ;;
            * ) printf -v o '%%%02x' "'$c"
        esac
        encoded+="${o}"
    done
    echo "${encoded}"
}

# Function to test a SPARQL query
test_query() {
    local query_name=$1
    local query=$2
    
    echo "Testing: $query_name"
    
    # URL encode the query
    encoded_query=$(urlencode "$query")
    
    # Execute query
    response=$(curl -s -w "\n%{http_code}" "${ENDPOINT}?query=${encoded_query}" \
        -H "Accept: application/sparql-results+json")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        # Count results using grep and wc (no jq needed)
        if echo "$body" | grep -q '"bindings"'; then
            result_count=$(echo "$body" | grep -o '"bindings"' | wc -l)
            # Try to count actual result objects
            binding_count=$(echo "$body" | grep -o '{' | wc -l)
            echo "✅ Success! Query returned results (HTTP 200)"
            echo "   Response contains data: ${#body} bytes"
            if [ "$binding_count" -gt 5 ]; then
                echo "   Likely has results (found $binding_count opening braces)"
            fi
        else
            echo "✅ Query executed successfully (HTTP 200)"
            echo "   Response: ${#body} bytes"
        fi
    else
        echo "❌ Failed with HTTP $http_code"
        echo "   First 200 chars of response:"
        echo "$body" | head -c 200
        echo ""
    fi
    echo ""
}

# Test 1: Simple connectivity test
echo "1️⃣  Testing endpoint connectivity..."
test_query "Simple SELECT" "SELECT * WHERE { ?s ?p ?o } LIMIT 1"

# Test 2: Temporal Rules query
echo "2️⃣  Testing Temporal Rules query..."
test_query "Temporal Rules" "PREFIX cpsv-ap: <http://data.europa.eu/m8g/>
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
  
  FILTER(LANG(?title) = \"nl\")
}
LIMIT 5"

# Test 3: Distribution URLs
echo "3️⃣  Testing Distribution URLs query..."
test_query "Distribution URLs" "PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX ex: <https://open-regels.triply.cc/stevengort/aow-leeftijd-service/id/>

SELECT ?distributionTitle ?downloadURL
WHERE {
  ex:aow_leeftijd_regels dcat:distribution ?distribution .
  ?distribution dct:title ?distributionTitle ;
                dcat:downloadURL ?downloadURL .
  FILTER(LANG(?distributionTitle) = \"nl\" || LANG(?distributionTitle) = \"\")
}
LIMIT 5"

# Test 4: Rule Metadata
echo "4️⃣  Testing Rule Metadata query..."
test_query "Rule Metadata" "PREFIX dct: <http://purl.org/dc/terms/>
PREFIX cpsv-ap: <http://data.europa.eu/m8g/>
PREFIX cprmv: <https://cprmv.open-regels.nl/0.3.0/>
PREFIX ex: <https://open-regels.triply.cc/stevengort/aow-leeftijd-service/id/>

SELECT ?title ?description
WHERE {
  ex:aow_leeftijd_regels a cpsv-ap:Rule ;
    dct:title ?title ;
    dct:description ?description .
  FILTER(LANG(?title) = \"nl\")
  FILTER(LANG(?description) = \"nl\")
}
LIMIT 5"

echo "=========================================="
echo "✅ Testing complete!"
echo ""
echo "If all tests passed, your queries should work in the web app."
echo "If tests failed, check:"
echo "  1. Endpoint URL: $ENDPOINT"
echo "  2. Dataset exists and is public"
echo "  3. Namespace URIs match your data"
