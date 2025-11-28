/**
 * Download Manager
 * Handles file downloads in multiple formats (JSON, RDF/XML, Turtle, JSON-LD)
 */
export class DownloadManager {
  constructor(config) {
    this.config = config;
    this.endpoint = config.triplydb.endpoint;
  }

  /**
   * Download SPARQL results as JSON
   * @param {Object} data - SPARQL JSON results
   * @param {string} filename - Output filename
   */
  downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.triggerDownload(blob, filename);
  }

  /**
   * Download query results in RDF format
   * @param {string} query - SPARQL query (must be CONSTRUCT or DESCRIBE)
   * @param {Object} format - Format configuration object
   * @param {string} filename - Output filename
   */
  async downloadRDF(query, format, filename) {
    const url = new URL(this.endpoint);
    url.searchParams.set('query', query);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': format.accept
      }
    });

    if (!response.ok) {
      throw new Error(`Download failed (${response.status}): ${await response.text()}`);
    }

    const data = await response.text();
    const blob = new Blob([data], { type: format.mediaType });
    this.triggerDownload(blob, filename);
  }

  /**
   * Download SPARQL SELECT results as CSV
   * @param {Object} results - SPARQL JSON results
   * @param {string} filename - Output filename
   */
  downloadCSV(results, filename) {
    if (!results.results || !results.results.bindings) {
      throw new Error('Invalid results format for CSV export');
    }

    const bindings = results.results.bindings;
    if (bindings.length === 0) {
      throw new Error('No results to export');
    }

    // Get headers from first result
    const headers = Object.keys(bindings[0]);
    
    // Build CSV
    const csvRows = [];
    csvRows.push(headers.join(','));

    bindings.forEach(binding => {
      const values = headers.map(header => {
        const value = binding[header]?.value || '';
        // Escape quotes and wrap in quotes if contains comma
        const escaped = value.replace(/"/g, '""');
        return value.includes(',') || value.includes('"') || value.includes('\n') 
          ? `"${escaped}"` 
          : escaped;
      });
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, filename);
  }

  /**
   * Trigger browser download
   * @param {Blob} blob - Data blob
   * @param {string} filename - Filename
   */
  triggerDownload(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get download URL for direct file access
   * @param {string} query - SPARQL query
   * @param {string} format - Format accept header
   * @returns {string} Download URL
   */
  getDownloadURL(query, format) {
    const url = new URL(this.endpoint);
    url.searchParams.set('query', query);
    url.searchParams.set('format', format);
    return url.toString();
  }
}
