# Environment Configuration Examples

This file contains example configurations for different organizations.

## Production: AOW Leeftijd Service

```json
{
  "organization": {
    "name": "AOW Leeftijd Service",
    "shortName": "aow-service",
    "description": "Publieke toegang tot AOW-leeftijd beslissingsregels en wetgeving",
    "logo": "./assets/logo.png",
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
      "description": "Haal downloadlinks op voor het DMN beslissingsmodel (TriplyDB en GitLab)",
      "category": "Distributions",
      "sparql": "PREFIX dcat: <http://www.w3.org/ns/dcat#>\nPREFIX dct: <http://purl.org/dc/terms/>\nPREFIX ex: <https://open-regels.triply.cc/stevenport/aow-leeftijd-service/id/>\n\nSELECT ?distributionTitle ?format ?mediaType ?accessURL ?downloadURL ?byteSize ?issued\nWHERE {\n  ex:aow_leeftijd_regels dcat:distribution ?distribution .\n  ?distribution dct:title ?distributionTitle ;\n                dct:format ?format ;\n                dcat:mediaType ?mediaType ;\n                dcat:accessURL ?accessURL ;\n                dcat:downloadURL ?downloadURL ;\n                dct:issued ?issued .\n  OPTIONAL { ?distribution dcat:byteSize ?byteSize . }\n  FILTER(LANG(?distributionTitle) = \"nl\" || LANG(?distributionTitle) = \"\")\n}\nORDER BY ?issued"
    },
    {
      "id": "rule-metadata",
      "name": "Regelset Metadata",
      "description": "Bekijk complete metadata van de AOW-leeftijd regelset inclusief CPRMV kenmerken",
      "category": "Metadata",
      "sparql": "PREFIX dct: <http://purl.org/dc/terms/>\nPREFIX cpsv-ap: <http://purl.org/vocab/cpsv#>\nPREFIX cprmv: <https://open-regels.triply.cc/stevenport/cprmv/def/>\nPREFIX ex: <https://open-regels.triply.cc/stevenport/aow-leeftijd-service/id/>\n\nSELECT ?title ?description ?version ?implements ?implementsVersion ?rulesetType ?ruleMethod\nWHERE {\n  ex:aow_leeftijd_regels a cpsv-ap:Rule ;\n    dct:title ?title ;\n    dct:description ?description ;\n    dct:version ?version ;\n    cprmv:implements ?implements ;\n    cprmv:implementsVersion ?implementsVersion ;\n    cprmv:rulesetType ?rulesetType ;\n    cprmv:ruleMethod ?ruleMethod .\n  FILTER(LANG(?title) = \"nl\")\n  FILTER(LANG(?description) = \"nl\")\n}"
    },
    {
      "id": "full-dataset",
      "name": "Volledige Dataset Export",
      "description": "Exporteer alle triples uit de AOW leeftijd dataset voor lokaal gebruik",
      "category": "Export",
      "sparql": "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }"
    }
  ],
  "exportFormats": [
    {
      "id": "turtle",
      "name": "Turtle (.ttl)",
      "extension": "ttl",
      "mediaType": "text/turtle",
      "accept": "text/turtle"
    },
    {
      "id": "rdfxml",
      "name": "RDF/XML (.rdf)",
      "extension": "rdf",
      "mediaType": "application/rdf+xml",
      "accept": "application/rdf+xml"
    },
    {
      "id": "jsonld",
      "name": "JSON-LD (.jsonld)",
      "extension": "jsonld",
      "mediaType": "application/ld+json",
      "accept": "application/ld+json"
    },
    {
      "id": "json",
      "name": "JSON (.json)",
      "extension": "json",
      "mediaType": "application/sparql-results+json",
      "accept": "application/sparql-results+json"
    }
  ]
}
```

## Example: Gemeente Amsterdam

```json
{
  "organization": {
    "name": "Gemeente Amsterdam - Open Data",
    "shortName": "amsterdam",
    "description": "Publieke toegang tot gemeentelijke regelgeving en besluiten",
    "logo": "./assets/logo-amsterdam.png",
    "primaryColor": "#EC0000"
  },
  "triplydb": {
    "endpoint": "https://open-regels.triply.cc/gemeenten/amsterdam/sparql",
    "account": "gemeenten",
    "dataset": "amsterdam"
  },
  "queries": [
    {
      "id": "gemeentelijke-regelgeving",
      "name": "Gemeentelijke Regelgeving",
      "description": "Overzicht van alle gemeentelijke regelgeving",
      "category": "Regelgeving",
      "sparql": "PREFIX dct: <http://purl.org/dc/terms/>\nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\nSELECT ?regel ?titel ?datum ?status\nWHERE {\n  ?regel a <https://example.org/GemeentelijkeRegel> ;\n         dct:title ?titel ;\n         dct:issued ?datum ;\n         <https://example.org/status> ?status .\n  FILTER(LANG(?titel) = \"nl\")\n}\nORDER BY DESC(?datum)\nLIMIT 50"
    },
    {
      "id": "volledige-export",
      "name": "Volledige Export",
      "description": "Exporteer volledige dataset",
      "category": "Export",
      "sparql": "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }"
    }
  ]
}
```

## Example: CPRMV Platform

```json
{
  "organization": {
    "name": "CPRMV Platform",
    "shortName": "cprmv",
    "description": "Centrale toegang tot CPRMV beslismodellen en regelsets",
    "logo": "./assets/logo-cprmv.png",
    "primaryColor": "#0066CC"
  },
  "triplydb": {
    "endpoint": "https://open-regels.triply.cc/stevenport/cprmv/sparql",
    "account": "stevenport",
    "dataset": "cprmv"
  },
  "queries": [
    {
      "id": "all-rules",
      "name": "Alle Regelsets",
      "description": "Overzicht van alle CPRMV regelsets",
      "category": "Overview",
      "sparql": "PREFIX cprmv: <https://open-regels.triply.cc/stevenport/cprmv/def/>\nPREFIX dct: <http://purl.org/dc/terms/>\nPREFIX cpsv-ap: <http://purl.org/vocab/cpsv#>\n\nSELECT ?rule ?title ?rulesetType ?ruleMethod ?implements\nWHERE {\n  ?rule a cpsv-ap:Rule ;\n        dct:title ?title ;\n        cprmv:rulesetType ?rulesetType ;\n        cprmv:ruleMethod ?ruleMethod ;\n        cprmv:implements ?implements .\n  FILTER(LANG(?title) = \"nl\")\n}\nORDER BY ?title"
    },
    {
      "id": "decision-tables",
      "name": "Beslissingstabellen",
      "description": "Alle beslissingstabellen in het platform",
      "category": "Decision Models",
      "sparql": "PREFIX cprmv: <https://open-regels.triply.cc/stevenport/cprmv/def/>\nPREFIX dct: <http://purl.org/dc/terms/>\n\nSELECT ?rule ?title ?description\nWHERE {\n  ?rule cprmv:ruleMethod \"decision-table\" ;\n        dct:title ?title ;\n        dct:description ?description .\n  FILTER(LANG(?title) = \"nl\")\n}\nORDER BY ?title"
    },
    {
      "id": "full-export",
      "name": "Platform Export",
      "description": "Exporteer alle CPRMV data",
      "category": "Export",
      "sparql": "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }"
    }
  ]
}
```

## Common SPARQL Patterns

### Pattern 1: List All Resources of a Type

```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dct: <http://purl.org/dc/terms/>

SELECT ?resource ?label ?description
WHERE {
  ?resource a <YourTypeURI> ;
            rdfs:label ?label .
  OPTIONAL { ?resource dct:description ?description }
  FILTER(LANG(?label) = "nl")
}
ORDER BY ?label
```

### Pattern 2: Get All Properties of a Specific Resource

```sparql
PREFIX ex: <https://your-namespace/>

SELECT ?property ?value
WHERE {
  ex:your_resource ?property ?value .
}
```

### Pattern 3: Export with Filters

```sparql
CONSTRUCT { ?s ?p ?o }
WHERE {
  ?s ?p ?o .
  ?s a <YourTypeURI> .
}
```

### Pattern 4: Date Range Queries

```sparql
PREFIX dct: <http://purl.org/dc/terms/>

SELECT ?resource ?title ?date
WHERE {
  ?resource dct:title ?title ;
            dct:issued ?date .
  FILTER(?date >= "2024-01-01"^^xsd:date && ?date <= "2024-12-31"^^xsd:date)
}
ORDER BY DESC(?date)
```

## Tips for Creating Queries

1. **Always use language filters** when working with multilingual data:
   ```sparql
   FILTER(LANG(?title) = "nl")
   ```

2. **Make use of OPTIONAL** for properties that might not exist:
   ```sparql
   OPTIONAL { ?resource dcat:byteSize ?size }
   ```

3. **Add ORDER BY** for better UX:
   ```sparql
   ORDER BY DESC(?date)  # Most recent first
   ORDER BY ?title       # Alphabetical
   ```

4. **Use LIMIT** for large datasets:
   ```sparql
   LIMIT 100
   ```

5. **Provide meaningful variable names**:
   - Good: `?distributionTitle`, `?downloadURL`, `?byteSize`
   - Bad: `?x`, `?y`, `?z`
