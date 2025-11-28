#!/bin/bash

echo "🧪 Testing TriplyDB Endpoint"
echo "=============================="
echo ""

ENDPOINT="https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql"
QUERY="SELECT * WHERE { ?s ?p ?o } LIMIT 1"

echo "Testing with Accept: application/sparql-results+json"
echo ""

# URL encode the query
ENCODED_QUERY=$(printf '%s' "$QUERY" | jq -sRr @uri)

# Make request with proper Accept header
echo "Request URL:"
echo "${ENDPOINT}?query=${ENCODED_QUERY}" | head -c 100
echo "..."
echo ""

echo "Response:"
curl -s "${ENDPOINT}?query=${ENCODED_QUERY}" \
  -H "Accept: application/sparql-results+json" \
  | head -c 500

echo ""
echo ""
echo "✅ If you see JSON above, the endpoint works!"
echo "❌ If you see HTML, there's an authentication or configuration issue."
