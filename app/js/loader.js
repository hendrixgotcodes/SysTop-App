// const { ipcRenderer } = require("electron");


ipcRenderer.on('get-settings',(e, settings)=>{
    cpuOverload.value = settings.cpuOverload;
    alertFrequency.value = settings.alertFreq;
});

btnSave.addEventListener('click', (e)=>{
    e.preventDefault();

    ipcRenderer.send('save-settings', {
        cpuOverload: cpuOverload.value,
        alertFreq: alertFrequency.value
    })
})

