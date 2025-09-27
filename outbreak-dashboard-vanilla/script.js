// Wait for the entire page to load before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM Element References ---
    const loader = document.getElementById('loader');
    const dashboardContent = document.getElementById('dashboard-content');
    const pieChartCanvas = document.getElementById('pieChart').getContext('2d');
    const barChartCanvas = document.getElementById('barChart').getContext('2d');
    const themeToggleButton = document.getElementById('theme-toggle');

    const API_URL = 'http://127.0.0.1:5000/api/global-forecast';
    
    let pieChart, barChart; // To hold our chart instances

    // --- 2. Dark Mode Logic ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    themeToggleButton.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newTheme = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
        // We need to update chart text colors when theme changes
        updateChartTheme(newTheme); 
    });

    // Load saved theme on startup
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    

    // --- 3. Data Fetching and Processing ---
    async function fetchDataAndRenderCharts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Process data for the Pie Chart (Risk Levels)
            const riskCounts = data.reduce((acc, item) => {
                acc[item.Risk_Level] = (acc[item.Risk_Level] || 0) + 1;
                return acc;
            }, {});
            
            // Process data for the Bar Chart (Top 15 High-Risk Countries)
            const highRiskCountries = data
                .filter(d => d.Risk_Level === 'High')
                .sort((a, b) => b.Forecasted_Cases - a.Forecasted_Cases)
                .slice(0, 15);

            // Hide loader and show content
            loader.style.display = 'none';
            dashboardContent.classList.remove('hidden');

            // Render the charts with the processed data
            renderPieChart(riskCounts);
            renderBarChart(highRiskCountries);

        } catch (error) {
            console.error("Failed to fetch or process data:", error);
            loader.textContent = "Failed to load data. Please check the console.";
        }
    }
    
    // --- 4. Chart Rendering Functions ---
    function renderPieChart(riskData) {
        const data = {
            labels: Object.keys(riskData),
            datasets: [{
                label: 'Countries by Risk Level',
                data: Object.values(riskData),
                backgroundColor: [
                    '#dc3545', // High - Red
                    '#28a745', // Low - Green
                    '#ffc107', // Medium - Yellow
                ],
                hoverOffset: 4
            }]
        };

        pieChart = new Chart(pieChartCanvas, {
            type: 'pie',
            data: data,
        });
    }
    
    function renderBarChart(countryData) {
        const data = {
            labels: countryData.map(c => c.CountryCode),
            datasets: [{
                label: 'Forecasted Cases',
                data: countryData.map(c => c.Forecasted_Cases),
                backgroundColor: '#dc3545',
            }]
        };

        barChart = new Chart(barChartCanvas, {
            type: 'bar',
            data: data,
            options: {
                indexAxis: 'y', // This makes it a horizontal bar chart
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });
        // Apply initial theme to chart text
        updateChartTheme(localStorage.getItem('theme') || 'light');
    }

    // --- 5. Function to update chart colors for dark mode ---
    function updateChartTheme(theme) {
        const textColor = theme === 'dark' ? '#e0e0e0' : '#212529';
        if(barChart) {
            barChart.options.scales.x.ticks.color = textColor;
            barChart.options.scales.y.ticks.color = textColor;
            barChart.options.plugins.legend.labels.color = textColor;
            barChart.update();
        }
        if(pieChart) {
            pieChart.options.plugins.legend.labels.color = textColor;
            pieChart.update();
        }
    }

    // --- 6. Initial Call ---
    fetchDataAndRenderCharts();
});