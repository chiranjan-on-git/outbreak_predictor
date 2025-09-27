document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM Element References (with new elements) ---
    const loader = document.getElementById('loader');
    const dashboardContent = document.getElementById('dashboard-content');
    const themeToggleButton = document.getElementById('theme-toggle');
    // Chart Canvases
    const pieChartCanvas = document.getElementById('pieChart').getContext('2d');
    const barChartCanvas = document.getElementById('barChart').getContext('2d');
    const forecastVsHistoryCanvas = document.getElementById('forecastVsHistoryChart').getContext('2d');
    const regionalRiskCanvas = document.getElementById('regionalRiskChart').getContext('2d');
    // Table Container
    const dataTableContainer = document.getElementById('dataTableContainer');

    const API_URL = 'http://127.0.0.1:5000/api/global-forecast';
    
    // Chart instances
    let pieChart, barChart, forecastVsHistoryChart, regionalRiskChart;

    // --- 2. Dark Mode Logic (no changes needed) ---
    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
    }
    themeToggleButton.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
        updateChartTheme(newTheme);
    });
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    

    // --- 3. Data Fetching and Processing ---
    async function fetchDataAndRenderCharts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            // --- Process data for each visualization ---
            const riskCounts = processForPieChart(data);
            const highRiskCountries = processForBarChart(data);
            const regionalData = processForRegionalChart(data);

            loader.style.display = 'none';
            dashboardContent.classList.remove('hidden');

            // --- Render all visualizations ---
            renderPieChart(riskCounts);
            renderBarChart(highRiskCountries);
            renderForecastVsHistoryChart(highRiskCountries); // Reuse high-risk data
            renderRegionalRiskChart(regionalData);
            renderDataTable(data); // Use the full raw data for the table

            // Apply theme to all charts
            updateChartTheme(localStorage.getItem('theme') || 'light');

        } catch (error) {
            console.error("Failed to fetch or process data:", error);
            loader.textContent = "Failed to load data. Please check the console.";
        }
    }
    
    // --- 4. Data Processing Functions ---
    function processForPieChart(data) {
        return data.reduce((acc, item) => {
            acc[item.Risk_Level] = (acc[item.Risk_Level] || 0) + 1;
            return acc;
        }, {});
    }
    function processForBarChart(data) {
        return data
            .filter(d => d.Risk_Level === 'High')
            .sort((a, b) => b.Forecasted_Cases - a.Forecasted_Cases)
            .slice(0, 15);
    }
    function processForRegionalChart(data) {
        // Simple mapping (can be expanded)
        const countryToRegion = { USA: 'Americas', IND: 'Asia', NGA: 'Africa', BRA: 'Americas', PAK: 'Asia', IDN: 'Asia', SEAR: 'Asia', WB_LI: 'Other', NER: 'Africa', TCD: 'Africa', WPR: 'Asia', SOM: 'Africa', WB_UMI: 'Other', KEN: 'Africa', AFG: 'Asia', SSD: 'Africa', LAO: 'Asia', PHL: 'Asia' };
        const regions = { Americas: { High: 0, Medium: 0, Low: 0 }, Asia: { High: 0, Medium: 0, Low: 0 }, Africa: { High: 0, Medium: 0, Low: 0 }, Other: { High: 0, Medium: 0, Low: 0 } };
        
        data.forEach(country => {
            const region = countryToRegion[country.CountryCode] || 'Other';
            regions[region][country.Risk_Level]++;
        });
        return regions;
    }

    // --- 5. Chart & Table Rendering Functions ---
    // (Existing renderPieChart and renderBarChart are here, slightly modified for clarity)
    function renderPieChart(riskData) { /* ... same as before ... */ }
    function renderBarChart(countryData) { /* ... same as before ... */ }

    function renderForecastVsHistoryChart(countryData) {
        forecastVsHistoryChart = new Chart(forecastVsHistoryCanvas, {
            type: 'bar',
            data: {
                labels: countryData.map(c => c.CountryCode),
                datasets: [
                    {
                        label: 'Forecasted Cases',
                        data: countryData.map(c => c.Forecasted_Cases),
                        backgroundColor: '#dc3545', // Red
                    },
                    {
                        label: '10-Year Average Cases',
                        data: countryData.map(c => c.Mean_Cases_10Y),
                        backgroundColor: '#6c757d', // Gray
                    }
                ]
            },
            options: { indexAxis: 'y' }
        });
    }

    function renderRegionalRiskChart(regionalData) {
        regionalRiskChart = new Chart(regionalRiskCanvas, {
            type: 'bar',
            data: {
                labels: Object.keys(regionalData), // ['Americas', 'Asia', 'Africa', 'Other']
                datasets: [
                    { label: 'High Risk', data: Object.values(regionalData).map(r => r.High), backgroundColor: '#dc3545' },
                    { label: 'Medium Risk', data: Object.values(regionalData).map(r => r.Medium), backgroundColor: '#ffc107' },
                    { label: 'Low Risk', data: Object.values(regionalData).map(r => r.Low), backgroundColor: '#28a745' }
                ]
            },
            options: {
                scales: { x: { stacked: true }, y: { stacked: true } } // Stacked bar chart
            }
        });
    }

    function renderDataTable(data) {
        let tableHTML = '<table class="data-table"><thead><tr><th>Country</th><th>Risk Level</th><th>Forecasted Cases</th><th>10Y Avg. Cases</th></tr></thead><tbody>';
        data.sort((a,b) => b.Forecasted_Cases - a.Forecasted_Cases).forEach(country => {
            tableHTML += `
                <tr>
                    <td>${country.CountryCode}</td>
                    <td>${country.Risk_Level}</td>
                    <td>${Math.round(country.Forecasted_Cases).toLocaleString()}</td>
                    <td>${Math.round(country.Mean_Cases_10Y).toLocaleString()}</td>
                </tr>
            `;
        });
        tableHTML += '</tbody></table>';
        dataTableContainer.innerHTML = tableHTML;
    }
    
    // --- 6. Function to update all charts for dark mode ---
    function updateChartTheme(theme) {
        const textColor = theme === 'dark' ? '#e0e0e0' : '#212529';
        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        [barChart, forecastVsHistoryChart, regionalRiskChart].forEach(chart => {
            if (chart) {
                chart.options.scales.x.ticks.color = textColor;
                chart.options.scales.y.ticks.color = textColor;
                chart.options.scales.x.grid.color = gridColor;
                chart.options.scales.y.grid.color = gridColor;
                chart.options.plugins.legend.labels.color = textColor;
                chart.update();
            }
        });
        if(pieChart) {
            pieChart.options.plugins.legend.labels.color = textColor;
            pieChart.update();
        }
    }

    // --- 7. Initial Call ---
    fetchDataAndRenderCharts();

    // Re-pasting the original pie/bar chart render functions for completeness
    function renderPieChart(riskData) {
        pieChart = new Chart(pieChartCanvas, { type: 'pie', data: { labels: Object.keys(riskData), datasets: [{ data: Object.values(riskData), backgroundColor: ['#dc3545', '#28a745', '#ffc107'] }] }});
    }
    function renderBarChart(countryData) {
        barChart = new Chart(barChartCanvas, { type: 'bar', data: { labels: countryData.map(c => c.CountryCode), datasets: [{ label: 'Forecasted Cases', data: countryData.map(c => c.Forecasted_Cases), backgroundColor: '#dc3545' }] }, options: { indexAxis: 'y' } });
    }
});