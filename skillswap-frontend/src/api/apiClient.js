const API_BASE_URL = 'http://localhost:5000/api';

export function getAuthToken() {
  return localStorage.getItem('token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (netErr) {
    throw new Error('Backend server is offline or unreachable on port 5000. Please ensure the backend is running via "npm run dev".');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// Auth API calls
export const authApi = {
  login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
  register: (full_name, email, password) => apiRequest('/auth/register', 'POST', { full_name, email, password }),
  getProfile: () => apiRequest('/auth/me', 'GET'),
};

// Skill API calls
// Skill API calls
export const skillApi = {
  getTaxonomy: () => apiRequest('/skills', 'GET'),
  createCustomSkill: (name) => apiRequest('/skills', 'POST', { name }),
  addUserSkill: (payload) => apiRequest('/users/skills', 'POST', payload), // { skill_id, skill_name, type: 'teach'|'learn' }
  removeUserSkill: (skill_id, type) => apiRequest('/users/skills', 'DELETE', { skill_id, type }),
  searchTeachers: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.min_rating) searchParams.append('min_rating', params.min_rating);
    if (params.topic) searchParams.append('topic', params.topic);
    if (params.date) searchParams.append('date', params.date);
    if (params.day) searchParams.append('day', params.day);
    if (params.slot_period) searchParams.append('slot_period', params.slot_period);
    if (params.start_time) searchParams.append('start_time', params.start_time);
    if (params.end_time) searchParams.append('end_time', params.end_time);
    const queryString = searchParams.toString();
    return apiRequest(`/teachers/search${queryString ? `?${queryString}` : ''}`, 'GET');
  },
  getWishlistMatches: () => apiRequest('/skills/wishlist-matches', 'GET'),
};

// Session API calls
export const sessionApi = {
  createSession: (provider_id, skill_id, duration_hours, session_date = null, session_time = null) =>
    apiRequest('/sessions', 'POST', { provider_id, skill_id, duration_hours, session_date, session_time }),
  getSessions: () => apiRequest('/sessions', 'GET'),
  updateStatus: (sessionId, status) =>
    apiRequest(`/sessions/${sessionId}/status`, 'PATCH', { status }),
};

// Credit API calls
export const creditApi = {
  getBalance: () => apiRequest('/credits/balance', 'GET'),
  getTransactions: () => apiRequest('/credits/transactions', 'GET'),
};

// Review API calls
export const reviewApi = {
  submitReview: (session_id, rating, comment) =>
    apiRequest('/reviews', 'POST', { session_id, rating, comment }),
  getUserReviews: (userId) => apiRequest(`/reviews/user/${userId}`, 'GET'),
  getSessionReviews: (sessionId) => apiRequest(`/reviews/session/${sessionId}`, 'GET'),
};

// Availability API calls
export const availabilityApi = {
  getMyAvailability: () => apiRequest('/availability/me', 'GET'),
  getUserAvailability: (userId) => apiRequest(`/availability/user/${userId}`, 'GET'),
  getCalendarAvailability: (userId, month = '') =>
    apiRequest(`/availability/calendar/${userId}${month ? `?month=${month}` : ''}`, 'GET'),
  getMyOverrides: () => apiRequest('/availability/overrides/me', 'GET'),
  addDateOverride: (override_date, reason = '', is_unavailable = true) =>
    apiRequest('/availability/override', 'POST', { override_date, reason, is_unavailable }),
  deleteDateOverride: (overrideId) => apiRequest(`/availability/override/${overrideId}`, 'DELETE'),
  saveMyAvailability: (slots) => apiRequest('/availability/save', 'POST', { slots }),
  addSlot: (day_of_week, time_slot) => apiRequest('/availability/slot', 'POST', { day_of_week, time_slot }),
  updateSlot: (slotId, data) => apiRequest(`/availability/slot/${slotId}`, 'PUT', data),
  deleteSlot: (slotId) => apiRequest(`/availability/slot/${slotId}`, 'DELETE'),
};

// Message API calls
export const messageApi = {
  sendMessage: (receiver_id, message_text, session_id = null) =>
    apiRequest('/messages', 'POST', { receiver_id, message_text, session_id }),
  getConversations: () => apiRequest('/messages/conversations', 'GET'),
  getMessages: (otherUserId) => apiRequest(`/messages/${otherUserId}`, 'GET'),
  markAsRead: (otherUserId) => apiRequest(`/messages/${otherUserId}/read`, 'PATCH'),
};

// User Profile API calls
export const userApi = {
  getProfile: () => apiRequest('/users/profile', 'GET'),
  updateProfile: (data) => apiRequest('/users/profile', 'PUT', data),
  getPublicProfile: (userId) => apiRequest(`/users/${userId}/public`, 'GET'),
};

// Leaderboard API calls
export const leaderboardApi = {
  getLeaderboard: () => apiRequest('/leaderboard', 'GET'),
};

// Dispute API calls
export const disputeApi = {
  fileDispute: (session_id, reason) => apiRequest('/disputes', 'POST', { session_id, reason }),
  getMyDisputes: () => apiRequest('/disputes/my', 'GET'),
};

// Admin API calls
export const adminApi = {
  getOverview: () => apiRequest('/admin/overview', 'GET'),
  getUsers: () => apiRequest('/admin/users', 'GET'),
  updateUserStatus: (userId, updates) => apiRequest(`/admin/users/${userId}/status`, 'PATCH', updates),
  getDisputes: () => apiRequest('/admin/disputes', 'GET'),
  resolveDispute: (disputeId, data) => apiRequest(`/admin/disputes/${disputeId}/resolve`, 'PATCH', data),
  getSkills: () => apiRequest('/admin/skills', 'GET'),
  createSkill: (name) => apiRequest('/admin/skills', 'POST', { name }),
  deleteSkill: (skillId) => apiRequest(`/admin/skills/${skillId}`, 'DELETE'),
  getRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/requests${query ? `?${query}` : ''}`, 'GET');
  },
  getAnalytics: () => apiRequest('/admin/analytics', 'GET'),
};

// Certificate API calls
export const certificateApi = {
  getMyCertificates: () => apiRequest('/certificates/my', 'GET'),
  getUserCertificates: (userId) => apiRequest(`/certificates/user/${userId}`, 'GET'),
  getCertificate: (uuid) => apiRequest(`/certificates/${uuid}`, 'GET'),
};

