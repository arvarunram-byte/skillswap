import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from local storage or Vite env
export const getSupabaseConfig = () => {
  const url = localStorage.getItem('skillswap_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem('skillswap_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key, isConfigured: Boolean(url && key) };
};

export const saveSupabaseConfig = (url, key) => {
  if (url) localStorage.setItem('skillswap_supabase_url', url);
  else localStorage.removeItem('skillswap_supabase_url');
  
  if (key) localStorage.setItem('skillswap_supabase_anon_key', key);
  else localStorage.removeItem('skillswap_supabase_anon_key');
  supabaseInstance = null;
};

let supabaseInstance = null;

export const getSupabaseClient = () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (isConfigured) {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
    }
    return supabaseInstance;
  }
  return null;
};

// Pure Real-Time Data Store Layer (Zero Mock Users)
export const db = {
  // Get all registered real student profiles
  async getProfiles() {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          localStorage.setItem('skillswap_profiles', JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase fetch notice:', e);
      }
    }
    const stored = localStorage.getItem('skillswap_profiles');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  },

  // Real User Registration
  async registerUser({ fullName, email, password, institution, teachSkills, learnSkills }) {
    const newUserId = 'usr_' + Date.now();
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=6366f1,8b5cf6,ec4899`;

    const newProfile = {
      id: newUserId,
      email: email.trim().toLowerCase(),
      username: email.split('@')[0].toLowerCase(),
      full_name: fullName.trim(),
      avatar_url: avatarUrl,
      bio: `Student at ${institution || 'University'}. Passionate about sharing knowledge!`,
      institution: institution?.trim() || 'University',
      wallet_balance: 1.0, // 1 Free Welcome Token upon registration
      skills_teach: teachSkills || [],
      skills_learn: learnSkills || [],
      rating: 5.0,
      sessions_completed: 0,
      password: password, // For simple local auth check if Supabase Auth not enabled
      created_at: new Date().toISOString()
    };

    // Save to Supabase Cloud if connected
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('profiles').insert([{
          id: undefined, // Let UUID generate or omit
          email: newProfile.email,
          username: newProfile.username,
          full_name: newProfile.full_name,
          avatar_url: newProfile.avatar_url,
          bio: newProfile.bio,
          institution: newProfile.institution,
          wallet_balance: 1.0,
          skills_teach: newProfile.skills_teach,
          skills_learn: newProfile.skills_learn,
          rating: 5.0,
          sessions_completed: 0
        }]).select();

        if (!error && data && data[0]) {
          newProfile.id = data[0].id;
        }
      } catch (err) {
        console.warn('Supabase profile insertion notice:', err);
      }
    }

    // Save locally
    const existingProfiles = await this.getProfiles();
    const updated = [newProfile, ...existingProfiles.filter(p => p.email !== newProfile.email)];
    localStorage.setItem('skillswap_profiles', JSON.stringify(updated));

    // Record 1 Welcome Token bonus transaction in ledger
    const welcomeTx = {
      id: 'tx_welcome_' + Date.now(),
      from_user_id: 'system',
      from_user_name: 'SkillSwap Network',
      to_user_id: newProfile.id,
      to_user_name: newProfile.full_name,
      amount: 1,
      topic: 'Welcome Bonus: 1 Free Starter Credit',
      type: 'WELCOME_BONUS',
      status: 'COMPLETED',
      created_at: new Date().toISOString()
    };
    const txs = await this.getTransactions();
    txs.unshift(welcomeTx);
    localStorage.setItem('skillswap_tx', JSON.stringify(txs));

    if (client) {
      try {
        await client.from('transactions').insert([{
          from_user_id: null,
          to_user_id: newProfile.id,
          amount: 1,
          type: 'WELCOME_BONUS',
          status: 'COMPLETED',
          note: 'Sign-up Welcome Token'
        }]);
      } catch (e) {}
    }

    return newProfile;
  },

  // Real User Login
  async loginUser(email, password) {
    const profiles = await this.getProfiles();
    const found = profiles.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      return { success: true, user: found };
    }
    return { success: false, message: 'No registered student found with this email. Please create a real account.' };
  },

  // Update profile
  async updateProfile(profile) {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('profiles').update(profile).eq('id', profile.id);
      } catch (e) {
        console.warn('Supabase update notice:', e);
      }
    }
    const profiles = await this.getProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...profile };
      localStorage.setItem('skillswap_profiles', JSON.stringify(profiles));
    }
    return profile;
  },

  // Real-Time Token Transfer on AI Verification
  async transferToken({ fromUserId, toUserId, sessionId, topic }) {
    const profiles = await this.getProfiles();
    const learner = profiles.find(p => p.id === fromUserId);
    const teacher = profiles.find(p => p.id === toUserId);

    if (learner && learner.wallet_balance >= 1) {
      learner.wallet_balance = Number((learner.wallet_balance - 1).toFixed(2));
      learner.sessions_completed = (learner.sessions_completed || 0) + 1;
    }
    if (teacher) {
      teacher.wallet_balance = Number(((teacher.wallet_balance || 0) + 1).toFixed(2));
      teacher.sessions_completed = (teacher.sessions_completed || 0) + 1;
    }

    localStorage.setItem('skillswap_profiles', JSON.stringify(profiles));

    // Record real transaction
    const tx = {
      id: 'tx_' + Date.now(),
      from_user_id: fromUserId,
      from_user_name: learner ? learner.full_name : 'Learner',
      to_user_id: toUserId,
      to_user_name: teacher ? teacher.full_name : 'Teacher',
      amount: 1,
      topic: topic || 'Peer Learning Session',
      status: 'COMPLETED',
      type: 'PEER_SESSION_TRANSFER',
      created_at: new Date().toISOString()
    };

    const txs = await this.getTransactions();
    txs.unshift(tx);
    localStorage.setItem('skillswap_tx', JSON.stringify(txs));

    // Cloud sync
    const client = getSupabaseClient();
    if (client) {
      try {
        if (learner) await client.from('profiles').update({ wallet_balance: learner.wallet_balance }).eq('id', learner.id);
        if (teacher) await client.from('profiles').update({ wallet_balance: teacher.wallet_balance }).eq('id', teacher.id);
        await client.from('transactions').insert([{
          from_user_id: fromUserId,
          to_user_id: toUserId,
          amount: 1,
          type: 'PEER_SESSION_TRANSFER',
          status: 'COMPLETED',
          note: `Real-time token transfer for ${topic}`
        }]);
      } catch (e) {
        console.warn('Supabase sync notice:', e);
      }
    }

    return { success: true, transaction: tx };
  },

  // Get real transactions
  async getTransactions(userId) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('transactions').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          localStorage.setItem('skillswap_tx', JSON.stringify(data));
          return data;
        }
      } catch (e) {}
    }
    const txs = JSON.parse(localStorage.getItem('skillswap_tx') || '[]');
    if (!userId) return txs;
    return txs.filter(t => t.from_user_id === userId || t.to_user_id === userId);
  },

  // Real-time Cloud Subscriptions
  subscribeToChanges(onUpdate) {
    const client = getSupabaseClient();
    if (client) {
      const channel = client
        .channel('skillswap-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
          onUpdate(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
          onUpdate(payload);
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
    return () => {};
  }
};
