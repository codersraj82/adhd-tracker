const DB_NAME = "adhd-tracker-db";
const DB_VERSION = 1;
const STORE_NAME = "dailyData";
const MOODS = ["great", "good", "neutral", "low", "stressed"];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createDefaultData(date = getTodayDate()) {
  return {
    date,
    focusSessions: [],
    blocks: {
      morning: {
        mainTask: "",
        smallTasks: [],
        mood: "neutral",
      },
      work: {
        mainTask: "",
        smallTasks: [],
        mood: "neutral",
      },
      evening: {
        mainTask: "",
        smallTasks: [],
        mood: "neutral",
      },
    },
  };
}

function mergeWithDefaultData(data, date = getTodayDate()) {
  const defaultData = createDefaultData(date);

  if (!data) {
    return defaultData;
  }

  function mergeBlock(defaultBlock, savedBlock = {}) {
    const smallTasks = Array.isArray(savedBlock.smallTasks)
      ? savedBlock.smallTasks.map((task) => ({
          title: typeof task?.title === "string" ? task.title : "",
          completed: Boolean(task?.completed),
          priority: [1, 2, 3].includes(Number(task?.priority))
            ? Number(task.priority)
            : 2,
        }))
      : [];

    return {
      ...defaultBlock,
      ...savedBlock,
      smallTasks,
      mood: MOODS.includes(savedBlock.mood) ? savedBlock.mood : "neutral",
    };
  }

  function mergeFocusSessions(savedSessions) {
    if (!Array.isArray(savedSessions)) {
      return [];
    }

    return savedSessions
      .map((session) => ({
        duration: Number(session?.duration) || 0,
        completed: Boolean(session?.completed),
        timestamp:
          typeof session?.timestamp === "string"
            ? session.timestamp
            : new Date().toISOString(),
      }))
      .filter((session) => session.duration > 0);
  }

  return {
    ...defaultData,
    ...data,
    date,
    focusSessions: mergeFocusSessions(data.focusSessions),
    blocks: {
      morning: mergeBlock(defaultData.blocks.morning, data.blocks?.morning),
      work: mergeBlock(defaultData.blocks.work, data.blocks?.work),
      evening: mergeBlock(defaultData.blocks.evening, data.blocks?.evening),
    },
  };
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB can only run in the browser."));
      return;
    }

    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "date" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getFromStore(db, date) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(date);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveToStore(db, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put(data);

    transaction.oncomplete = () => resolve(data);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getTodayData() {
  const date = getTodayDate();
  const db = await openDatabase();
  const savedData = await getFromStore(db, date);

  if (savedData) {
    return mergeWithDefaultData(savedData, date);
  }

  const defaultData = createDefaultData(date);
  await saveToStore(db, defaultData);
  return defaultData;
}

export async function saveTodayData(data) {
  const db = await openDatabase();
  const dataToSave = mergeWithDefaultData(data);

  await saveToStore(db, dataToSave);
  return dataToSave;
}

export async function updateBlock(blockType, blockData) {
  const todayData = await getTodayData();

  const updatedData = {
    ...todayData,
    blocks: {
      ...todayData.blocks,
      [blockType]: {
        ...todayData.blocks[blockType],
        ...blockData,
      },
    },
  };

  await saveTodayData(updatedData);
  return updatedData;
}

export async function addFocusSession(sessionData = {}) {
  const todayData = await getTodayData();
  const newSession = {
    duration: Number(sessionData.duration) || 0,
    completed: Boolean(sessionData.completed),
    timestamp: sessionData.timestamp || new Date().toISOString(),
  };

  const updatedData = {
    ...todayData,
    focusSessions: [...todayData.focusSessions, newSession],
  };

  return saveTodayData(updatedData);
}
