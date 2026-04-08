// ============================================================
//  MEDIQUEUE — AUTH MODULE
// ============================================================

const AUTH = {
  login(role, id, password) {
    const db = getDB();
    const users = role === 'patient' ? db.patients : db.doctors;
    
    const user = users.find(u => u.id === id && u.password === password);
    
    if (user) {
      localStorage.setItem('mq_role', role);
      localStorage.setItem('mq_user_id', user.id);
      localStorage.setItem('mq_user_name', user.name);
      return { success: true, user };
    }
    
    // Dynamically capitalize the role for the error message
    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
    return { success: false, error: `Invalid ${formattedRole} ID or Password.` };
  },

  logout() {
    ['mq_role', 'mq_user_id', 'mq_user_name'].forEach(k => localStorage.removeItem(k));
    window.location.href = 'index.html';
  },

  getCurrentUser() {
    const role = localStorage.getItem('mq_role');
    const id   = localStorage.getItem('mq_user_id');
    
    if (!role || !id) return null;
    
    const db = getDB();
    const users = role === 'patient' ? db.patients : db.doctors;
    const user  = users.find(u => u.id === id);
    
    return user ? { role, ...user } : null;
  },

  requireAuth(role) {
    const user = this.getCurrentUser();
    
    if (!user || user.role !== role) {
      window.location.href = role === 'patient' ? 'patient-login.html' : 'doctor-login.html';
      return null;
    }
    
    return user;
  }
};