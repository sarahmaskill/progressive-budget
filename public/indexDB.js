let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (e) => {
    const db = e.target.result;
    db.createObjectStore("transaction", { autoIncrement: true });
};

request.onsuccess = (e) => {
    db = e.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = (e) => {
    console.log(`Error ${e.target.errorCode}`);
};

const saveTransaction = (data) => {
    const transaction = db.transaction(["transaction"], "readwrite");
    const store = transaction.objectStore("transaction");
    store.add(data);
};

function checkDatabase() {
    const transaction = db.transaction(["transaction"], "readwrite");
    const store = transaction.objectStore("transaction");
    const getAll = store.getAll();

    getAll.onsuccess = async () => {
        try {
            if (getAll.result.length > 0) {
                const response = await fetch("/api/transaction/bulk", {
                    method: "POST",
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                });
                response.json();

                const transaction = db.transaction(["transaction"], "readwrite");


                const store = transaction.objectStore("transaction");


                store.clear();
            }
        } catch (error) {
            console.log(`${error}`);
        }
    };
}

window.addEventListener("online", checkDatabase);