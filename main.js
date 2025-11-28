// Main application entry point
import { SPARQLClient } from './modules/sparql-client.js';
import { DownloadManager } from './modules/download-manager.js';
import { ResultsRenderer } from './modules/results-renderer.js';

class TriplyApp {
  constructor() {
    this.config = null;
    this.sparqlClient = null;
    this.downloadManager = null;
    this.resultsRenderer = null;
    this.currentQuery = null;
    this.currentResults = null;
  }

  async init() {
    try {
      // Load configuration
      const response = await fetch('./config.json');
      this.config = await response.json();

      // Initialize modules
      this.sparqlClient = new SPARQLClient(this.config.triplydb.endpoint);
      this.downloadManager = new DownloadManager(this.config);
      this.resultsRenderer = new ResultsRenderer();

      // Initialize UI
      this.initializeUI();
      this.attachEventListeners();

      console.log('TriplyDB Query Portal initialized');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Applicatie kon niet worden geladen', error.message);
    }
  }

  initializeUI() {
    // Set organization info
    const orgInfo = this.config.organization;
    document.getElementById('org-name').textContent = orgInfo.name;
    document.getElementById('org-description').textContent = orgInfo.description;
    
    const logo = document.getElementById('org-logo');
    if (orgInfo.logo) {
      logo.src = orgInfo.logo;
      logo.style.display = 'block';
    } else {
      logo.style.display = 'none';
    }

    // Set primary color
    if (orgInfo.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', orgInfo.primaryColor);
    }

    // Populate query dropdown
    const querySelect = document.getElementById('query-select');
    this.config.queries.forEach(query => {
      const option = document.createElement('option');
      option.value = query.id;
      option.textContent = query.name;
      option.dataset.category = query.category;
      querySelect.appendChild(option);
    });

    // Set footer links
    const triplyLink = document.getElementById('triply-link');
    triplyLink.href = `https://open-regels.triply.cc/${this.config.triplydb.account}/${this.config.triplydb.dataset}`;
    
    const sparqlLink = document.getElementById('sparql-link');
    sparqlLink.href = this.config.triplydb.endpoint;
  }

  attachEventListeners() {
    // Query selection
    document.getElementById('query-select').addEventListener('change', (e) => {
      this.onQuerySelected(e.target.value);
    });

    // Execute button
    document.getElementById('execute-btn').addEventListener('click', () => {
      this.executeQuery();
    });

    // Export buttons (delegate event listener)
    document.getElementById('export-buttons').addEventListener('click', (e) => {
      const button = e.target.closest('.btn-export');
      if (button && this.currentResults) {
        const formatId = button.dataset.format;
        this.downloadResults(formatId);
      }
    });
  }

  onQuerySelected(queryId) {
    if (!queryId) {
      document.getElementById('query-details').style.display = 'none';
      return;
    }

    this.currentQuery = this.config.queries.find(q => q.id === queryId);
    
    // Show query details
    document.getElementById('query-name').textContent = this.currentQuery.name;
    document.getElementById('query-description').textContent = this.currentQuery.description;
    document.getElementById('sparql-code').textContent = this.currentQuery.sparql;
    document.getElementById('query-details').style.display = 'block';

    // Hide previous results
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('error-section').style.display = 'none';
    
    // Hide export buttons
    document.getElementById('export-buttons').style.display = 'none';
    this.currentResults = null;
  }

  async executeQuery() {
    if (!this.currentQuery) return;

    this.showLoading(true);
    this.hideError();
    
    const startTime = performance.now();

    try {
      console.log('Executing query:', this.currentQuery.name);
      console.log('SPARQL:', this.currentQuery.sparql);
      console.log('Endpoint:', this.config.triplydb.endpoint);
      
      const results = await this.sparqlClient.query(this.currentQuery.sparql);
      
      console.log('Query results:', results);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      this.currentResults = results;
      
      // Render results
      this.resultsRenderer.render(results, document.getElementById('results-container'));
      
      // Update meta information
      const resultCount = results.results?.bindings?.length || 0;
      document.getElementById('result-count').textContent = `${resultCount} resultaten`;
      document.getElementById('result-time').textContent = `${duration}ms`;
      
      // Show results section
      document.getElementById('results-section').style.display = 'block';
      document.getElementById('error-section').style.display = 'none';
      
      // Show export buttons
      document.getElementById('export-buttons').style.display = 'flex';

    } catch (error) {
      console.error('Query execution failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        query: this.currentQuery.sparql,
        endpoint: this.config.triplydb.endpoint
      });
      this.showError('Query uitvoering mislukt', error.message);
    } finally {
      this.showLoading(false);
    }
  }

  async downloadResults(formatId) {
    if (!this.currentQuery || !this.currentResults) return;

    if (!formatId) {
      alert('Selecteer eerst een export formaat');
      return;
    }

    const format = this.config.exportFormats.find(f => f.id === formatId);
    
    this.showLoading(true);

    try {
      if (formatId === 'json') {
        // Download current results as JSON
        this.downloadManager.downloadJSON(
          this.currentResults,
          `${this.currentQuery.id}.json`
        );
      } else {
        // Fetch RDF format from SPARQL endpoint
        await this.downloadManager.downloadRDF(
          this.currentQuery.sparql,
          format,
          `${this.currentQuery.id}.${format.extension}`
        );
      }
    } catch (error) {
      console.error('Download failed:', error);
      this.showError('Download mislukt', error.message);
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
  }

  showError(message, details) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-details').textContent = details;
    document.getElementById('error-section').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
  }

  hideError() {
    document.getElementById('error-section').style.display = 'none';
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new TriplyApp();
  app.init();
});
