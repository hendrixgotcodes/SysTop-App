//NODE MODULES
const { ipcRenderer } = require("electron");
const byte_converter = require("byte-converter");
const node_os_utils = require("node-os-utils");
const cpu = node_os_utils.cpu;
const os = node_os_utils.os;
const mem = node_os_utils.mem;

//OTHERS
// const Date = new Date();
const overload = 10;

//DOM ELEMENTS
const cpu_model = document.getElementById("cpu-model");
const comp_name = document.getElementById("comp-name");
const span_os = document.getElementById("os");
const mem_total = document.getElementById("mem-total");
const cpu_usage = document.getElementById("cpu-usage");
const cpu_free = document.getElementById("cpu-free");
const sys_uptime = document.getElementById("sys-uptime");
const cpu_progress = document.getElementById("cpu-progress");

//Setting Static System Stats
cpu_model.innerText = cpu.model();
comp_name.innerText = os.hostname();
span_os.innerText = ` ${os.type()} ${os.platform()} ${os.arch()}`;

(async function getTotalMeme() {
  const stat = await mem.info();
  mem_total.innerText = stat.totalMemMb + "MB";
})();

// Setting Dynamic System Stats
setInterval(() => {
  (async function () {
    let cpuFree = await cpu.free();
    cpu_free.innerText = `${cpuFree}%`;

    let cpuUsage = await cpu.usage();
    cpu_usage.innerText = `${cpuUsage}%`;
    cpu_progress.style.width = cpuUsage + "%";

    if (parseInt(cpuUsage) >= overload) {
      cpu_progress.style.backgroundColor = "red";

      if (lastNotified(1)) {
        ipcRenderer.send("alert", {
          title: "CPU overload",
          message: "CPU overload detected, click here to manage your cpu",
        });
      }
    } else {
      cpu_progress.style.backgroundColor = "#30c88b";
    }
  })();
}, 2000);

setInterval(() => {
  (async function () {
    let upTime = await os.uptime();
    sys_uptime.innerText = getDHMS(upTime);
  })();
}, 1000);

//Functions

//TO convert seconds to days, h, m,s
function getDHMS(secs) {
  secs = parseInt(secs);

  let d = Math.floor(secs / (3600 * 24));
  let h = Math.floor((secs % (3600 * 24)) / 3600);
  let m = Math.floor((secs % 3600) / 60);
  let s = Math.floor(secs % 60);

  return `${d}d  ${h}h  ${m}m  ${s}s`;
}
localStorage.clear();
//To send notifications
function lastNotified(timeElapsed) {
  let lastNotified = localStorage.getItem("last_notified");
  if (lastNotified === null) {
    localStorage.setItem("last_notified", +new Date());
    return true;
  } else {
    let now = new Date();
    lastNotified = new Date(parseInt(lastNotified));
    let dateDiff = Math.abs(now - lastNotified);
    dateDiff = Math.ceil(dateDiff / (1000 * 60));
    console.log(dateDiff);

    if (dateDiff > timeElapsed) {
      localStorage.setItem("last_notified", +new Date());
      return true;
    }
    return false;
  }
}
