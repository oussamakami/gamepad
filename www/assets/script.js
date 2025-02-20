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
        document.documentElement.style.setProperty('--primary-text-color', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--secondary-text-color', 'rgb(131, 145, 162)');
        document.documentElement.style.setProperty('--active-nav-color', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--body-bg', 'rgb(52, 58, 64)');
        document.documentElement.style.setProperty('--footer-border-color', 'rgb(86, 102, 121)');
        document.documentElement.style.setProperty('--box-shadow', '0px 0px 35px 0px rgba(49, 57, 66, .5)');
    }
    else {
        elem.innerHTML = `<i class='bx bx-moon'></i>`;
        document.documentElement.style.setProperty('--top-nav-bg', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--side-nav-bg', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--input-bg', 'rgb(240, 243, 248)');
        document.documentElement.style.setProperty('--primary-text-color', 'rgb(66, 64, 75)');
        document.documentElement.style.setProperty('--secondary-text-color', 'rgb(108, 117, 125)');
        document.documentElement.style.setProperty('--active-nav-color', 'rgb(105, 115, 227)');
        document.documentElement.style.setProperty('--body-bg', 'rgb(250, 251, 254)');
        document.documentElement.style.setProperty('--footer-border-color', 'rgb(223, 223, 223)');
        document.documentElement.style.setProperty('--box-shadow', '0px 0px 35px 0px rgba(154, 161, 171, .15)');
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