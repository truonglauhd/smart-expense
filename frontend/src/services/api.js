import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const AUTH_STORAGE_KEY = "authUser";
const AUTH_HEADER = "Authorization";

export const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 15000,
});

const getStorage = (type) => {
  if (typeof window === "undefined") return null;
  try {
    return type === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

const safeParse = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getStoredAuth = () => {
  const localStore = getStorage("local");
  const sessionStore = getStorage("session");

  const localAuth = safeParse(localStore?.getItem(AUTH_STORAGE_KEY));
  if (localAuth?.token) {
    return { ...localAuth, storage: "local" };
  }
  const sessionAuth = safeParse(sessionStore?.getItem(AUTH_STORAGE_KEY));
  if (sessionAuth?.token) {
    return { ...sessionAuth, storage: "session" };
  }
  return null;
};

export const getAuthToken = () => getStoredAuth()?.token;

export const setApiAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common[AUTH_HEADER] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common[AUTH_HEADER];
  }
};

const persistAuth = (auth, remember) => {
  const payload = JSON.stringify(auth);
  if (remember) {
    const localStore = getStorage("local");
    const sessionStore = getStorage("session");
    localStore?.setItem(AUTH_STORAGE_KEY, payload);
    sessionStore?.removeItem(AUTH_STORAGE_KEY);
  } else {
    const sessionStore = getStorage("session");
    const localStore = getStorage("local");
    sessionStore?.setItem(AUTH_STORAGE_KEY, payload);
    localStore?.removeItem(AUTH_STORAGE_KEY);
  }
  setApiAuthToken(auth?.token);
};

export const clearStoredAuth = () => {
  getStorage("local")?.removeItem(AUTH_STORAGE_KEY);
  getStorage("session")?.removeItem(AUTH_STORAGE_KEY);
  setApiAuthToken(null);
};

export const saveAuth = ({ token, username }, remember) => {
  if (!token) return;
  const auth = {
    token,
    username,
    savedAt: new Date().toISOString(),
  };
  persistAuth(auth, remember);
};

// Attach token if present
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers[AUTH_HEADER] = `Bearer ${token}`;
  }
  return config;
});

// Initialize default auth header if token already stored
setApiAuthToken(getAuthToken());

const normalizeExpense = (exp = {}) => {
  if (!exp) return exp;
  const {
    _id,
    id,
    amount,
    category,
    note = "",
    date,
    user_id,
    ...rest
  } = exp;
  return {
    id: id || _id,
    amount,
    category,
    note,
    date,
    user_id,
    ...rest,
  };
};

const normalizeIncome = (inc = {}) => {
  if (!inc) return inc;
  const {
    _id,
    id,
    amount,
    category,
    note = "",
    date,
    user_id,
    ...rest
  } = inc;
  return {
    id: id || _id,
    amount,
    category,
    note,
    date,
    user_id,
    ...rest,
  };
};

// Expenses
export const apiGetExpenses = async (params = {}) => {
  const res = await api.get("/expenses", { params });
  res.data = Array.isArray(res.data) ? res.data.map(normalizeExpense) : [];
  return res;
};

export const apiCreateExpense = async (payload) => {
  const res = await api.post("/expenses", payload);
  res.data = normalizeExpense(res.data);
  return res;
};

export const apiUpdateExpense = async (id, payload) => {
  const res = await api.put(`/expenses/${id}`, payload);
  res.data = normalizeExpense(res.data);
  return res;
};
export const apiDeleteExpense = (id) => api.delete(`/expenses/${id}`);

export const apiGetIncomes = async (params = {}) => {
  const res = await api.get("/incomes", { params });
  res.data = Array.isArray(res.data) ? res.data.map(normalizeIncome) : [];
  return res;
};
export const apiCreateIncome = async (payload) => {
  const res = await api.post("/incomes", payload);
  res.data = normalizeIncome(res.data);
  return res;
};
export const apiUpdateIncome = async (id, payload) => {
  const res = await api.put(`/incomes/${id}`, payload);
  res.data = normalizeIncome(res.data);
  return res;
};
export const apiDeleteIncome = (id) => api.delete(`/incomes/${id}`);

// Auth
export const apiLogin = (payload) => api.post("/login", payload);
export const apiRegister = (payload) => api.post("/register", payload);
export const loadStoredAuth = () => getStoredAuth();

export const apiExtractBill = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/extract", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Summary
export const apiGetSummaryPeriod = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const res = await api.get("/summary/period", { params });
  return {
    expenses: Array.isArray(res.data?.expenses) ? res.data.expenses.map(normalizeExpense) : [],
    incomes: Array.isArray(res.data?.incomes) ? res.data.incomes.map(normalizeIncome) : [],
    expenseCategoryTotals: res.data?.expense_category_totals || {},
  };
};
