const API_BASE = window.API_BASE_URL || 'http://localhost:6361/api';

const el = (id) => document.querySelector(id);

const formatDate = (value) => {
  if (!value) return 'No timestamp available';
  const date = new Date(value);
  return isNaN(date.valueOf()) ? value : date.toLocaleString();
};

const renderFallback = (element, message) => {
  element.removeAttribute('data-loading');
  element.innerHTML = `<p>${message}</p>`;
};

const renderMmda = async () => {
  const container = el('#mmda-card .content');

  try {
    const response = await fetch(`${API_BASE}/mmda/traffic`);
    const payload = await response.json();
    const data = payload?.data;
    const firstAlert = Array.isArray(data?.alerts) ? data.alerts[0] : undefined;

    if (!firstAlert) {
      renderFallback(container, 'No MMDA alerts detected at the moment.');
      return;
    }

    const tags = [firstAlert.type, firstAlert.severity]
      .filter(Boolean)
      .map((label) => `<span class="tag">${label}</span>`)
      .join('');

    container.removeAttribute('data-loading');
    container.innerHTML = `
      <p>${firstAlert.text}</p>
      <p class="muted">Source: ${firstAlert.source || 'MMDA'}</p>
      <p class="muted">Updated: ${formatDate(firstAlert.timestamp)}</p>
      <div class="tag-row">${tags}</div>
    `;
  } catch (error) {
    renderFallback(container, 'Unable to load MMDA alerts. Check API server.');
  }
};

const renderPagasa = async () => {
  const container = el('#pagasa-card .content');

  try {
    const response = await fetch(`${API_BASE}/pagasa/forecast`);
    const payload = await response.json();
    const firstRegion = Array.isArray(payload?.data?.regionSummaries)
      ? payload.data.regionSummaries[0]
      : undefined;

    if (!firstRegion) {
      renderFallback(container, 'No PAGASA forecast data is available right now.');
      return;
    }

    const alerts = (firstRegion?.advisories || []).map((item) => `• ${item}`).join('\n');

    container.removeAttribute('data-loading');
    container.innerHTML = `
      <p><strong>${firstRegion.region || 'Region'}</strong></p>
      <p class="muted">Issued: ${formatDate(firstRegion.issuedAt)}</p>
      <p>${firstRegion.summary || 'No summary provided.'}</p>
      ${alerts ? `<pre>${alerts}</pre>` : ''}
    `;
  } catch (error) {
    renderFallback(container, 'Unable to load PAGASA forecast. Check API server.');
  }
};

const renderPhivolcs = async () => {
  const container = el('#phivolcs-card .content');

  try {
    const response = await fetch(`${API_BASE}/phivolcs/latest-earthquake`);
    const payload = await response.json();
    const quake = payload?.data?.earthquake;

    if (!quake) {
      renderFallback(container, 'No recent earthquake reported by PHIVOLCS.');
      return;
    }

    container.removeAttribute('data-loading');
    container.innerHTML = `
      <p><strong>Magnitude:</strong> ${quake.magnitude || 'N/A'}</p>
      <p><strong>Depth:</strong> ${quake.depth || 'N/A'} km</p>
      <p><strong>Location:</strong> ${quake.location || 'N/A'}</p>
      <p class="muted">Recorded: ${quake.dateTime || 'N/A'}</p>
    `;
  } catch (error) {
    renderFallback(container, 'Unable to load PHIVOLCS earthquake data.');
  }
};

const bootstrap = () => {
  renderMmda();
  renderPagasa();
  renderPhivolcs();
};

document.addEventListener('DOMContentLoaded', bootstrap);
