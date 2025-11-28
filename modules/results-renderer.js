/**
 * Results Renderer
 * Renders SPARQL query results in various formats
 */
export class ResultsRenderer {
  /**
   * Render SPARQL results to a container
   * @param {Object} results - SPARQL JSON results
   * @param {HTMLElement} container - Container element
   */
  render(results, container) {
    container.innerHTML = '';

    // Check if it's a SELECT query result
    if (results.results && results.results.bindings) {
      this.renderTable(results, container);
    } 
    // Check if it's a CONSTRUCT/DESCRIBE query result (RDF graph)
    else if (results.head && results.results) {
      this.renderTable(results, container);
    }
    // Handle plain RDF data (from CONSTRUCT queries)
    else if (typeof results === 'string') {
      this.renderRDF(results, container);
    }
    // Fallback to JSON
    else {
      this.renderJSON(results, container);
    }
  }

  /**
   * Render results as an HTML table
   * @param {Object} results - SPARQL JSON results
   * @param {HTMLElement} container - Container element
   */
  renderTable(results, container) {
    const bindings = results.results.bindings;
    
    if (!bindings || bindings.length === 0) {
      container.innerHTML = '<p class="no-results">Geen resultaten gevonden</p>';
      return;
    }

    const variables = results.head.vars;

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'results-table';

    const table = document.createElement('table');
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    variables.forEach(variable => {
      const th = document.createElement('th');
      th.textContent = variable;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    bindings.forEach(binding => {
      const row = document.createElement('tr');
      variables.forEach(variable => {
        const td = document.createElement('td');
        const value = binding[variable];
        
        if (value) {
          if (value.type === 'uri') {
            const link = document.createElement('a');
            link.href = value.value;
            link.textContent = this.formatURI(value.value);
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            td.appendChild(link);
          } else if (value.type === 'literal') {
            td.textContent = value.value;
            if (value['xml:lang']) {
              td.setAttribute('lang', value['xml:lang']);
              td.title = `Language: ${value['xml:lang']}`;
            }
            if (value.datatype) {
              td.title = `Datatype: ${this.formatURI(value.datatype)}`;
            }
          } else {
            td.textContent = value.value;
          }
        } else {
          td.innerHTML = '<em style="color: #999;">null</em>';
        }
        
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
  }

  /**
   * Render RDF data
   * @param {string} rdf - RDF serialization
   * @param {HTMLElement} container - Container element
   */
  renderRDF(rdf, container) {
    const pre = document.createElement('pre');
    pre.className = 'rdf-preview';
    pre.textContent = rdf;
    container.appendChild(pre);
  }

  /**
   * Render JSON data
   * @param {Object} data - JSON data
   * @param {HTMLElement} container - Container element
   */
  renderJSON(data, container) {
    const pre = document.createElement('pre');
    pre.className = 'rdf-preview';
    pre.textContent = JSON.stringify(data, null, 2);
    container.appendChild(pre);
  }

  /**
   * Format URI for display (show local name)
   * @param {string} uri - Full URI
   * @returns {string} Formatted URI
   */
  formatURI(uri) {
    // Try to extract local name after # or last /
    const hashIndex = uri.lastIndexOf('#');
    const slashIndex = uri.lastIndexOf('/');
    const splitIndex = Math.max(hashIndex, slashIndex);
    
    if (splitIndex > 0 && splitIndex < uri.length - 1) {
      return uri.substring(splitIndex + 1);
    }
    
    return uri;
  }

  /**
   * Create a stats summary of results
   * @param {Object} results - SPARQL JSON results
   * @returns {HTMLElement} Stats element
   */
  createStatsSummary(results) {
    const stats = document.createElement('div');
    stats.className = 'results-stats';
    
    if (results.results && results.results.bindings) {
      const count = results.results.bindings.length;
      const variables = results.head.vars.length;
      
      stats.innerHTML = `
        <span><strong>${count}</strong> resultaten</span>
        <span><strong>${variables}</strong> variabelen</span>
      `;
    }
    
    return stats;
  }
}
