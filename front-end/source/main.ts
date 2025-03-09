import ApexCharts from 'apexcharts'

function getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getLast7Days(): string[] {
    const days: string[] = [];
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit' };

    for (let i = 7; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', options).replace(',', ''));
    }
    return days;
}

// Define types for the ApexCharts options object
interface ChartOptions {
    chart: {
        type?: string;
        width?: string;
        height?: string;
        toolbar: { show: boolean };
    };
    xaxis: {
        categories?: string[];
        labels: { style: { colors?: string } };
    };
    yaxis: {
        labels: { style: { colors?: string } };
    };
    series: { name?: string; data?: number[] }[];
    fill: { opacity?: number };
    stroke: { width?: number; colors?: string };
    dataLabels: { enabled?: boolean };
    legend: { labels: { colors?: string } };
    plotOptions: { bar: { columnWidth?: string } };
    tooltip: { theme?: string };
    colors?: string[];
}

let options: ChartOptions = {
    chart: { toolbar: { show: false } },
    xaxis: { labels: { style: {} } },
    yaxis: { labels: { style: {} } },
    series: [{}, {}],
    fill: {},
    stroke: {},
    dataLabels: {},
    legend: { labels: {} },
    plotOptions: { bar: {} },
    tooltip: {}
};

options.chart.type = "bar";
options.chart.width = "100%";
options.chart.height = "100%";
options.dataLabels.enabled = false;
options.fill.opacity = 1;
options.stroke.width = 2;
options.stroke.colors = "#fff0";
options.plotOptions.bar.columnWidth = "20%";
options.xaxis.labels.style.colors = getCSSVariable("--secondary-text-color");
options.yaxis.labels.style.colors = getCSSVariable("--secondary-text-color");
options.colors = [getCSSVariable("--primary-brand-color")];
options.tooltip.theme = "light";
options.legend.labels.colors = getCSSVariable("--secondary-text-color");

options.series[0].name = "games played";  // The data name in the categories
options.series[0].data = [582, 677, 628, 921, 349, 856, 972];  // Values of each category
options.xaxis.categories = getLast7Days();  // Names of categories

const chartElement = document.getElementById("projection-chart");
if (chartElement) {
    let dashboardChart = new ApexCharts(chartElement, options);
    dashboardChart.render();
} else {
    console.error("Chart element not found!");
}
