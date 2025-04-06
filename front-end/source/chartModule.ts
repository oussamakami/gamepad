import ApexCharts from "apexcharts";

interface ChartData {
    name: string,
    data: Array<number>
}

class Chart {
    private htmlElem: HTMLElement;
    private chartElem: ApexCharts | undefined;

    private chartTheme: "light" | "dark";
    private chartTextColor: string;
    private chartBarColors: Array<string>;
    private chartCategories: Array<string>;
    private chartDataSet: Array<ChartData>;

    constructor(elementId: string) {
        const elem = document.getElementById(elementId);

        if (!elem)
            throw new Error(`Element with ID '${elementId}' not found`);

        this.htmlElem = elem;
        this.chartTheme = "light";
        this.chartTextColor = "#000000";
        this.chartBarColors = ["#000000"];
        this.chartCategories = [];
        this.chartDataSet = [];
    }

    private generateChartOptions() {
        return {
            fill: { opacity: 1},
            tooltip: { theme: this.chartTheme },
            dataLabels: { enabled: false },
            stroke: { width: 2, colors: "#fff0"},
            plotOptions: { bar: { columnWidth: "20%" } },
            legend: { labels: { colors: this.chartTextColor } },
            yaxis: { labels: { style: { colors: this.chartTextColor } }},
            xaxis: {
                categories: this.chartCategories,
                labels: { style: { colors: this.chartTextColor } }
            },
            chart: {
                width: "100%", height: "100%",
                type: "bar", toolbar: { show: false }
            },
            colors: this.chartBarColors,
            series: this.chartDataSet
        }
    }

    public get theme(): "light" | "dark" {
        return (this.chartTheme);
    }

    public get textColor(): string {
        return (this.chartTextColor)
    }

    public get barColors(): Array<string> {
        return (this.chartBarColors);
    }

    public get categories(): Array<string> {
        return (this.chartCategories);
    }

    public get dataSet(): Array<ChartData> {
        return (this.chartDataSet);
    }

    public fetchCSSColorVariable(variableName: string): string {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
        const s = new Option().style;
        s.color = ""
        s.color = value;
        if (s.color === "")
            return ('#000000')
        return (s.color);
    }

    public set setTheme(newTheme: "light" | "dark") {
        this.chartTheme = newTheme;
    }

    public set setTextColor(newTextColor: string) {
        if (newTextColor.startsWith("--"))
            newTextColor = this.fetchCSSColorVariable(newTextColor);
        this.chartTextColor = newTextColor;
    }

    public set setBarColors(newColors: Array<string>) {
        newColors.forEach((color, index, list) => {
            if (color.startsWith("--"))
                list[index] = this.fetchCSSColorVariable(color);
        });

        this.chartBarColors = newColors;
    }

    public set setCategories(newCategories: Array<string>) {
        this.chartCategories = newCategories;
    }

    public set setDataSet(data: Array<ChartData>) {
        this.chartDataSet = data;
    }

    public render(): void {
        if (!this.chartElem) {
            this.chartElem = new ApexCharts(this.htmlElem, this.generateChartOptions());
            this.chartElem?.render();
        }
        else
            this.chartElem?.updateOptions(this.generateChartOptions());
    }

    public destroy(): void {
        this.chartElem?.destroy();
        this.chartElem = undefined;
    }
}

export default Chart;