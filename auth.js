// ============================================================
//  MEDIQUEUE — ENHANCED AUTH MODULE
// ============================================================

const AUTH = {
  /**
   * Helper to safely fetch database from data.js or localStorage
   */
  _getStorage() {
    try {
      // Prioritize global getDB function, fallback to a blank structure if it fails
      if (typeof getDB === 'function') {
          return getDB();
      }
      console.error("Auth Error: getDB() function is missing in data.js");
      return { patients: [], doctors: [] };
    } catch (e) {
      console.error("Auth Error: Database is inaccessible", e);
      return { patients: [], doctors: [] };
    }
  },

  /**
   * Validates credentials and initializes session
   */
  login(role, id, password) {
    const db = this._getStorage();
    const userList = role === 'patient' ? db.patients : db.doctors;

    // Safety check if userList exists
    if (!userList) {
      return { success: false, error: "System configuration error: Role not found." };
    }

    const user = userList.find(u => u.id === id && u.password === password);

    if (user) {
      // Store session data
      localStorage.setItem('mq_role', role);
      localStorage.setItem('mq_user_id', user.id);
      localStorage.setItem('mq_user_name', user.name);
      
      return { success: true, user };
    }

    // Friendly error messaging
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
    return { success: false, error: `Invalid ${roleLabel} ID or password.` };
  },

  /**
   * Clears session and redirects to landing page
   */
  logout() {
    const keys = ['mq_role', 'mq_user_id', 'mq_user_name'];
    keys.forEach(key => localStorage.removeItem(key));
    window.location.href = 'index.html';
  },

  /**
   * Returns the current session user object
   */
  getCurrentUser() {
    const role = localStorage.getItem('mq_role');
    const id = localStorage.getItem('mq_user_id');

    if (!role || !id) return null;

    const db = this._getStorage();
    const userList = role === 'patient' ? db.patients : db.doctors;
    const user = userList.find(u => u.id === id);

    return user ? { ...user, role } : null;
  },

  /**
   * Protection for dashboard pages. Call this at the TOP of your dashboard scripts.
   */
  requireAuth(expectedRole) {
    const user = this.getCurrentUser();

    if (!user || user.role !== expectedRole) {
      console.warn("Unauthorized access attempt. Redirecting...");
      const redirect = expectedRole === 'patient' ? 'patient-login.html' : 'doctor-login.html';
      window.location.href = redirect;
      return null;
    }

    return user;
  }
};
