// IndexedDB Service for Finance Dashboard
// This provides a clean API to interact with IndexedDB

const DB_NAME = 'FinanceDashboardDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  TRANSACTIONS: 'transactions',
  SETTINGS: 'settings'
};

class IndexedDBService {
  constructor() {
    this.db = null;
    this.isReady = false;
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      // Open database connection
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      // Handle database upgrade (runs when DB is created or version changes)
      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create transactions store with indexes
        if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
          const transactionStore = db.createObjectStore(STORES.TRANSACTIONS, {
            keyPath: 'id'
          });
          // Create indexes for efficient querying
          transactionStore.createIndex('type', 'type', { unique: false });
          transactionStore.createIndex('category', 'category', { unique: false });
          transactionStore.createIndex('date', 'date', { unique: false });
          transactionStore.createIndex('amount', 'amount', { unique: false });
        }

        // Create settings store for user preferences
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isReady = true;
        console.log('✅ IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('❌ IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Ensure DB is ready before operations
  async ensureReady() {
    if (!this.isReady) {
      await this.init();
    }
    return this.db;
  }

  // ==================== TRANSACTION OPERATIONS ====================

  // Add a new transaction
  async addTransaction(transaction) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.TRANSACTIONS], 'readwrite');
      const store = txn.objectStore(STORES.TRANSACTIONS);
      const request = store.add(transaction);

      request.onsuccess = () => {
        console.log('✅ Transaction added:', transaction.id);
        resolve(transaction);
      };

      request.onerror = () => {
        console.error('❌ Failed to add transaction:', request.error);
        reject(request.error);
      };
    });
  }

  // Add multiple transactions (bulk insert)
  async addTransactions(transactions) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.TRANSACTIONS], 'readwrite');
      const store = txn.objectStore(STORES.TRANSACTIONS);

      transactions.forEach((transaction) => {
        store.add(transaction);
      });

      txn.oncomplete = () => {
        console.log(`✅ ${transactions.length} transactions added`);
        resolve(transactions);
      };

      txn.onerror = () => {
        console.error('❌ Failed to add transactions:', txn.error);
        reject(txn.error);
      };
    });
  }

  // Get all transactions
  async getAllTransactions() {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.TRANSACTIONS], 'readonly');
      const store = txn.objectStore(STORES.TRANSACTIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by date descending (newest first)
        const sorted = request.result.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        resolve(sorted);
      };

      request.onerror = () => {
        console.error('❌ Failed to get transactions:', request.error);
        reject(request.error);
      };
    });
  }

  // Get a single transaction by ID
  async getTransaction(id) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.TRANSACTIONS], 'readonly');
      const store = txn.objectStore(STORES.TRANSACTIONS);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Update a transaction
  async updateTransaction(transaction) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.TRANSACTIONS], 'readwrite');
      const store = txn.objectStore(STORES.TRANSACTIONS);
      const request = store.put(transaction);

      request.onsuccess = () => {
        console.log('✅ Transaction updated:', transaction.id);
        resolve(transaction);
      };

      request.onerror = () => {
        console.error('❌ Failed to update transaction:', request.error);
        reject(request.error);
      };
    });
  }

  // Delete a transaction
  async deleteTransaction(id) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.TRANSACTIONS], 'readwrite');
      const store = txn.objectStore(STORES.TRANSACTIONS);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('✅ Transaction deleted:', id);
        resolve(id);
      };

      request.onerror = () => {
        console.error('❌ Failed to delete transaction:', request.error);
        reject(request.error);
      };
    });
  }

  // Get transactions by type (income, expense, savings)
  async getTransactionsByType(type) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.TRANSACTIONS], 'readonly');
      const store = txn.objectStore(STORES.TRANSACTIONS);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get transactions by category
  async getTransactionsByCategory(category) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.TRANSACTIONS], 'readonly');
      const store = txn.objectStore(STORES.TRANSACTIONS);
      const index = store.index('category');
      const request = index.getAll(category);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get transactions within a date range
  async getTransactionsByDateRange(startDate, endDate) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.TRANSACTIONS], 'readonly');
      const store = txn.objectStore(STORES.TRANSACTIONS);
      const index = store.index('date');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // ==================== SETTINGS OPERATIONS ====================

  // Save a setting
  async saveSetting(key, value) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.SETTINGS], 'readwrite');
      const store = txn.objectStore(STORES.SETTINGS);
      const request = store.put({ key, value });

      request.onsuccess = () => {
        resolve({ key, value });
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get a setting
  async getSetting(key) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.SETTINGS], 'readonly');
      const store = txn.objectStore(STORES.SETTINGS);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get all settings
  async getAllSettings() {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.SETTINGS], 'readonly');
      const store = txn.objectStore(STORES.SETTINGS);
      const request = store.getAll();

      request.onsuccess = () => {
        // Convert array to object for easier access
        const settings = {};
        request.result.forEach(item => {
          settings[item.key] = item.value;
        });
        resolve(settings);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // ==================== UTILITY OPERATIONS ====================

  // Clear all transactions (useful for reset)
  async clearAllTransactions() {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.TRANSACTIONS], 'readwrite');
      const store = txn.objectStore(STORES.TRANSACTIONS);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('✅ All transactions cleared');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get transaction count
  async getTransactionCount() {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const txn = this.db.transaction([STORES.TRANSACTIONS], 'readonly');
      const store = txn.objectStore(STORES.TRANSACTIONS);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Check if database has data (for initial load)
  async hasData() {
    const count = await this.getTransactionCount();
    return count > 0;
  }

  // Delete the entire database (use with caution!)
  async deleteDatabase() {
    return new Promise((resolve, reject) => {
      this.db?.close();
      const request = indexedDB.deleteDatabase(DB_NAME);

      request.onsuccess = () => {
        this.db = null;
        this.isReady = false;
        console.log('✅ Database deleted');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

// Export a singleton instance
const dbService = new IndexedDBService();
export default dbService;

// Also export the class for testing purposes
export { IndexedDBService, STORES };
