// src/services/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001',  // seu Express+SQLite
  headers: {
    'Content-Type': 'application/json'
  }
});
