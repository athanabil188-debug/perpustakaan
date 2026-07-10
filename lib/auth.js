// Authentication utility functions

export const getUserFromStorage = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('perpus_user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
  }
  return null;
};

export const isAdmin = () => {
  const user = getUserFromStorage();
  // Check if user exists and has admin role
  if (user && user.role === 'admin') {
    // For demo purposes, we'll allow any user with role 'admin'
    // In a real application, you would validate credentials against a database
    return true;
  }
  return false;
};

export const isGuru = () => {
  const user = getUserFromStorage();
  return user && user.role === 'guru';
};

export const isSiswa = () => {
  const user = getUserFromStorage();
  return user && user.role === 'siswa';
};

export const isAuthenticated = () => {
  return getUserFromStorage() !== null;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('perpus_user');
  }
};

// Function to validate admin credentials (for demo purposes)
export const validateAdminCredentials = (username, password) => {
  // Use the specified credentials: username "Nabil" and password "Nabil_carisa"
  const validAdminUsername = 'Nabil';
  const validAdminPassword = 'Nabil_carisa';

  return username === validAdminUsername && password === validAdminPassword;
};