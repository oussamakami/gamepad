// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.

function getCSSVariable(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getLast7Days() {
    const days = [];
    const options = { month: 'short', day: '2-digit' };
  
    for (let i = 7; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', options).replace(',', ''));
    }
    return days;
}

let options = {
    chart: {toolbar: {}},
    xaxis: {labels: {style: {}}},
    yaxis: {labels: {style: {}}},
    series: [{}],
    fill: {},
    dataLabels: {},
    plotOptions: {bar: {}}
};

options.chart.type = "bar";
options.chart.width = "100%";
options.chart.height = "100%";
options.chart.toolbar.show = false;
options.dataLabels.enabled = false;
options.fill.opacity = 1;
options.plotOptions.bar.columnWidth = "20%";
options.xaxis.labels.style.colors = getCSSVariable("--secondary-text-color");
options.yaxis.labels.style.colors = getCSSVariable("--secondary-text-color");
options.colors = [getCSSVariable("--primary-brand-color")];


options.series[0].name = "games played";  //the data name in the categories
options.series[0].data = [582, 677, 628, 921, 349, 856, 972];  //values of each category
options.xaxis.categories = getLast7Days();  //names of categories

let dashboardChart = new ApexCharts(document.getElementById("projection-chart"), options);
dashboardChart.render();



function shrinkAndHide() {
    const elem = document.getElementById("side-nav");

    if (elem.style.width === "0px") {
        elem.classList.remove("hidden");
        setTimeout(() => {
            elem.style.width = "var(--side-nav-width)";
        }, 10);
    } else {
        elem.style.width = "0px";
        setTimeout(() => {
            elem.classList.add("hidden");
        }, 500);
    }
}

function lightModeToggle() {
    let elem = document.getElementById("mode-toggle");

    if (elem.innerHTML.includes("bx-moon")){
        elem.innerHTML = "<i class='bx bx-sun'></i>";
        document.documentElement.style.setProperty('--top-nav-bg', 'rgb(58, 68, 78)');
        document.documentElement.style.setProperty('--side-nav-bg', 'rgb(58, 68, 78)');
        document.documentElement.style.setProperty('--input-bg', 'rgb(70, 79, 91)');
        document.documentElement.style.setProperty('--secondary-text-color', 'rgb(170, 184, 197)');
        document.documentElement.style.setProperty('--primary-text-color', 'rgb(131, 145, 162)');
        document.documentElement.style.setProperty('--active-nav-color', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--body-bg', 'rgb(52, 58, 64)');
        document.documentElement.style.setProperty('--card-bg', 'rgb(58, 68, 78)');
        document.documentElement.style.setProperty('--border-color', 'rgb(86, 102, 121)');
        document.documentElement.style.setProperty('--box-shadow', '0px 0px 35px 0px rgba(49, 57, 66, .5)');

        let temp = {xaxis: {labels: {style: {}}}, yaxis: {labels: {style: {}}}};
        temp.xaxis.labels.style.colors = getCSSVariable("--secondary-text-color");
        temp.yaxis.labels.style.colors = getCSSVariable("--secondary-text-color");
        dashboardChart.updateOptions(temp);
    }
    else {
        elem.innerHTML = `<i class='bx bx-moon'></i>`;
        document.documentElement.style.setProperty('--top-nav-bg', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--side-nav-bg', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--input-bg', 'rgb(240, 243, 248)');
        document.documentElement.style.setProperty('--secondary-text-color', 'rgb(66, 64, 75)');
        document.documentElement.style.setProperty('--primary-text-color', 'rgb(108, 117, 125)');
        document.documentElement.style.setProperty('--active-nav-color', 'rgb(105, 115, 227)');
        document.documentElement.style.setProperty('--body-bg', 'rgb(250, 251, 254)');
        document.documentElement.style.setProperty('--card-bg', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--border-color', 'rgb(223, 223, 223)');
        document.documentElement.style.setProperty('--box-shadow', '0px 0px 35px 0px rgba(154, 161, 171, .15)');

        let temp = {xaxis: {labels: {style: {}}}, yaxis: {labels: {style: {}}}};
        temp.xaxis.labels.style.colors = getCSSVariable("--secondary-text-color");
        temp.yaxis.labels.style.colors = getCSSVariable("--secondary-text-color");
        dashboardChart.updateOptions(temp);
    }
}

function toggleFullScreen() {
    let elem = document.getElementById("toggle-fullscreen");

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            elem.innerHTML = `<i class='bx bx-exit-fullscreen'></i>`;
        }).catch(err => {
            console.error("Error attempting to enable full-screen mode:", err);
        });
    } else {
        document.exitFullscreen().then(() => {
            elem.innerHTML = `<i class='bx bx-fullscreen'></i>`;
        }).catch(err => {
            console.error("Error attempting to exit full-screen mode:", err);
        });
    }
}



document.getElementById("toggle-side-nav").onclick = shrinkAndHide;
document.getElementById("mode-toggle").onclick = lightModeToggle;
document.getElementById("toggle-fullscreen").onclick = toggleFullScreen;