import { createClient } from '@supabase/supabase-js';

// Default initial student profiles for testing
const INITIAL_DEMO_USERS = [
  {
    id: 'usr_alex',
    email: 'alex@skillswap.edu',
    username: 'alex_dev',
    full_name: 'Alex Chen',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Computer Science sophomore. Love building algorithms and backend APIs.',
    institution: 'Stanford University',
    wallet_balance: 3.0,
    skills_teach: ['Python', 'Data Structures', 'Backend APIs'],
    skills_learn: ['UI/UX Design', 'Figma', 'Graphic Design'],
    rating: 4.9,
    sessions_completed: 6,
  },
  {
    id: 'usr_priya',
    email: 'priya@skillswap.edu',
    username: 'priya_design',
    full_name: 'Priya Sharma',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Design major passionate about human-centered wireframes and design systems.',
    institution: 'MIT Institute of Design',
    wallet_balance: 2.0,
    skills_teach: ['UI/UX Design', 'Figma', 'Graphic Design'],
    skills_learn: ['Python', 'Data Structures'],
    rating: 5.0,
    sessions_completed: 4,
  },
  {
    id: 'usr_marcus',
    email: 'marcus@skillswap.edu',
    username: 'marcus_v',
    full_name: 'Marcus Vance',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Web developer specialized in React and modern CSS. Looking to master public speaking.',
    institution: 'UC Berkeley',
    wallet_balance: 1.0,
    skills_teach: ['React.js', 'Frontend Development', 'JavaScript'],
    skills_learn: ['Public Speaking', 'Presentation Skills'],
    rating: 4.8,
    sessions_completed: 2,
  },
  {
    id: 'usr_ananya',
    email: 'ananya@skillswap.edu',
    username: 'ananya_speak',
    full_name: 'Ananya Iyer',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    bio: 'Debate club president & communications tutor. Want to learn machine learning basics.',
    institution: 'Oxford University',
    wallet_balance: 4.0,
    skills_teach: ['Public Speaking', 'Presentation Skills', 'English Fluency'],
    skills_learn: ['Machine Learning', 'Python'],
    rating: 4.95,
    sessions_completed: 9,
  }
];

// Read Supabase credentials
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
  supabaseInstance = null; // reset client
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

// Real-Time Data Store Layer
export const db = {
  // Get all registered peer student profiles
  async getProfiles() {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('profiles').select('*').order('rating', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch failed, using local store:', e);
      }
    }
    const stored = localStorage.getItem('skillswap_profiles');
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem('skillswap_profiles', JSON.stringify(INITIAL_DEMO_USERS));
    return INITIAL_DEMO_USERS;
  },

  // Save profile updates
  async updateProfile(profile) {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('profiles').upsert(profile);
      } catch (e) {
        console.warn('Supabase upsert warning:', e);
      }
    }
    const profiles = await this.getProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id);
    let updated;
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...profile };
      updated = profiles;
    } else {
      updated = [...profiles, profile];
    }
    localStorage.setItem('skillswap_profiles', JSON.stringify(updated));
    return profile;
  },

  // Real-Time Transfer Time-Credit token upon AI quiz verification
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

    // Save updated profiles
    localStorage.setItem('skillswap_profiles', JSON.stringify(profiles));

    // Record transaction
    const tx = {
      id: 'tx_' + Date.now(),
      from_user_id: fromUserId,
      from_user_name: learner ? learner.full_name : 'Learner',
      to_user_id: toUserId,
      to_user_name: teacher ? teacher.full_name : 'Teacher',
      amount: 1,
      topic: topic || 'Peer Session',
      status: 'COMPLETED',
      type: 'PEER_SESSION_TRANSFER',
      created_at: new Date().toISOString()
    };

    const existingTx = JSON.parse(localStorage.getItem('skillswap_tx') || '[]');
    existingTx.unshift(tx);
    localStorage.setItem('skillswap_tx', JSON.stringify(existingTx));

    // Real-Time Sync to Supabase Cloud if configured
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
          note: `Real-time AI verified credit transfer for ${topic}`
        }]);
      } catch (e) {
        console.warn('Supabase real-time update warning:', e);
      }
    }

    return { success: true, transaction: tx };
  },

  // Get transaction ledger
  async getTransactions(userId) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('transactions').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase transactions fetch note:', e);
      }
    }
    const txs = JSON.parse(localStorage.getItem('skillswap_tx') || '[]');
    if (!userId) return txs;
    return txs.filter(t => t.from_user_id === userId || t.to_user_id === userId);
  },

  // Subscribe to real-time database changes
  subscribeToChanges(onUpdate) {
    const client = getSupabaseClient();
    if (client) {
      const channel = client
        .channel('skillswap-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
          console.log('⚡ Real-time profile change from Supabase:', payload);
          onUpdate(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
          console.log('⚡ Real-time transaction recorded in Supabase:', payload);
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
