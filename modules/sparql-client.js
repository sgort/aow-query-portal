/**
 * SPARQL Client for TriplyDB
 * Handles query execution with proper headers and error handling
 */
export class SPARQLClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Execute a SPARQL query
   * @param {string} query - SPARQL query string
   * @param {string} accept - Accept header (defaults to JSON)
   * @returns {Promise<Object>} Query results
   */
  async query(query, accept = 'application/sparql-results+json') {
    try {
      const url = new URL(this.endpoint);
      url.searchParams.set('query', query);

      console.log('SPARQL Client - Fetching:', url.toString().substring(0, 200) + '...');
      
      // Create timeout for fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': accept
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('SPARQL Client - Response status:', response.status);
      console.log('SPARQL Client - Response headers:', {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length')
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SPARQL Client - Error response:', errorText);
        throw new Error(`SPARQL query failed (${response.status}): ${errorText}`);
      }

      // Handle different response types
      if (accept.includes('json')) {
        const data = await response.json();
        console.log('SPARQL Client - Parsed JSON, bindings count:', data.results?.bindings?.length || 0);
        return data;
      } else {
        const data = await response.text();
        console.log('SPARQL Client - Text response length:', data.length);
        return data;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Query timeout - request took longer than 30 seconds');
      }
      console.error('SPARQL Client - Caught error:', error);
      throw error;
    }
  }

  /**
   * Execute a CONSTRUCT or DESCRIBE query and get RDF
   * @param {string} query - SPARQL CONSTRUCT/DESCRIBE query
   * @param {string} format - RDF format (turtle, rdf+xml, json-ld, etc.)
   * @returns {Promise<string>} RDF data
   */
  async queryRDF(query, format) {
    const acceptHeaders = {
      'turtle': 'text/turtle',
      'rdfxml': 'application/rdf+xml',
      'jsonld': 'application/ld+json',
      'ntriples': 'application/n-triples',
      'nquads': 'application/n-quads'
    };

    const accept = acceptHeaders[format] || 'text/turtle';
    return await this.query(query, accept);
  }

  /**
   * Test endpoint connectivity
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const testQuery = 'SELECT * WHERE { ?s ?p ?o } LIMIT 1';
      await this.query(testQuery);
      return true;
    } catch (error) {
      console.error('Endpoint connection test failed:', error);
      return false;
    }
  }
}
