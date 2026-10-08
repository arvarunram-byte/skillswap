// Client REST API connecting to the shared server database

const BASE_URL = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://localhost:3000'
  : '';

export const api = {
  async getProfiles() {
    try {
      const res = await fetch(`${BASE_URL}/api/profiles`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API getProfiles failed, checking local storage:', err);
    }
    const local = localStorage.getItem('skillswap_profiles');
    return local ? JSON.parse(local) : [];
  },

  async register(userData) {
    try {
      const res = await fetch(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      return data.profile;
    } catch (err) {
      console.warn('API register fallback to local:', err);
      // fallback
      const newProfile = {
        id: 'usr_' + Date.now(),
        email: userData.email,
        full_name: userData.fullName,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.fullName)}`,
        bio: `Student at ${userData.institution || 'University'}.`,
        institution: userData.institution || 'University',
        wallet_balance: 1.0,
        skills_teach: userData.teachSkills || ['Python'],
        skills_learn: userData.learnSkills || ['UI/UX'],
        rating: 5.0,
        sessions_completed: 0,
        created_at: new Date().toISOString()
      };
      return newProfile;
    }
  },

  async login(email, password) {
    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      return { success: true, profile: data.profile };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async updateSkills(userId, skillsTeach, skillsLearn) {
    try {
      const res = await fetch(`${BASE_URL}/api/update-skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skillsTeach, skillsLearn })
      });
      return await res.json();
    } catch (err) {
      console.warn('API updateSkills notice:', err);
    }
  },

  async transferToken(fromUserId, toUserId, topic) {
    try {
      const res = await fetch(`${BASE_URL}/api/transfer-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId, toUserId, topic })
      });
      return await res.json();
    } catch (err) {
      console.warn('API transferToken notice:', err);
    }
  }
};
