const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("roby", {
  createLiveSession: (offerSdp) => ipcRenderer.invoke("roby:create-live-session", offerSdp),
  showWindow: () => ipcRenderer.invoke("roby:show-window"),
  hideWindow: () => ipcRenderer.invoke("roby:hide-window"),
  getRuntimeConfig: () => ipcRenderer.invoke("roby:get-runtime-config"),
});
