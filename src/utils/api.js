const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbwsezxYUreaxnMwKwjSLsPO5MLfGJ--FW7AkxoPZYUZUyFws6Nr613DHSa2YpJ3HzhSeA/exec";

export const api = {
  fetchMemos: async () => {
    // Menggunakan fetch biasa dengan mode cors
    const res = await fetch(`${URL_APPS_SCRIPT}?action=getMemos`, {
      method: 'GET',
      mode: 'cors',
    });
    return res.json();
  },
  
  sendData: async (action, payload) => {
    return fetch(URL_APPS_SCRIPT, {
      method: "POST",
      mode: "no-cors", // <--- Gunakan no-cors jika masalah tetap berlanjut
      header: {
        "Content-Type": "text/plain", // <--- Gunakan text/plain untuk bypass CORS
      },
      body: JSON.stringify({ action, ...payload }),
    });
  }
};