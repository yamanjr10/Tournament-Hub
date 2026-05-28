const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Initialize Firebase Admin SDK
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
let db;
let auth;

try {
  const serviceAccount = require('./config/service-account-key.json');
  initializeApp({
    credential: cert(serviceAccount)
  });
  db = getFirestore();
  auth = getAuth();
  console.log('✅ Firebase Admin initialized with service account');
} catch (error) {
  console.log('⚠️ No service account found, using local fallback mode');
  
  const inMemoryStore = {
    users: [],
    tournaments: [],
    matches: []
  };
  
  db = {
    collection: (name) => ({
      add: async (data) => {
        const id = Date.now().toString();
        inMemoryStore[name].push({ id, ...data });
        return { id };
      },
      get: async () => ({
        docs: inMemoryStore[name].map(doc => ({
          id: doc.id,
          data: () => {
            const { id, ...data } = doc;
            return data;
          },
          exists: true
        }))
      }),
      doc: (id) => ({
        get: async () => ({
          exists: true,
          data: () => inMemoryStore[name].find(d => d.id === id)
        }),
        update: async (data) => {
          const index = inMemoryStore[name].findIndex(d => d.id === id);
          if (index !== -1) {
            inMemoryStore[name][index] = { ...inMemoryStore[name][index], ...data };
          }
        },
        delete: async () => {
          const index = inMemoryStore[name].findIndex(d => d.id === id);
          if (index !== -1) {
            inMemoryStore[name].splice(index, 1);
          }
        }
      }),
      where: (field, operator, value) => ({
        get: async () => ({
          docs: inMemoryStore[name]
            .filter(doc => doc[field] === value)
            .map(doc => ({
              id: doc.id,
              data: () => {
                const { id, ...data } = doc;
                return data;
              }
            }))
        })
      }),
      orderBy: () => ({
        get: async () => ({
          docs: inMemoryStore[name].map(doc => ({
            id: doc.id,
            data: () => {
              const { id, ...data } = doc;
              return data;
            }
          }))
        })
      })
    })
  };
  
  auth = {
    createUser: async ({ email, password, displayName }) => {
      const uid = Date.now().toString();
      return { uid };
    }
  };
}

// ============ AUTH ROUTES ============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('📝 Registration attempt:', { username, email });
    
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const usersRef = db.collection('users');
    const emailQuery = await usersRef.where('email', '==', email).get();
    
    if (!emailQuery.empty) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const usernameQuery = await usersRef.where('username', '==', username).get();
    if (!usernameQuery.empty) {
      return res.status(400).json({ success: false, message: 'Username taken' });
    }
    
    let uid;
    try {
      const userRecord = await auth.createUser({ email, password, displayName: username });
      uid = userRecord.uid;
    } catch (authError) {
      uid = Date.now().toString();
    }
    
    const userData = {
      uid,
      username,
      email,
      password,
      role: 'user',
      tournamentsJoined: [],
      wins: 0,
      losses: 0,
      totalMatches: 0,
      createdAt: new Date().toISOString()
    };
    
    await db.collection('users').add(userData);
    
    console.log('✅ User created successfully:', username);
    
    res.status(201).json({
      success: true,
      uid,
      username,
      email,
      role: 'user',
      tournamentsJoined: [],
      wins: 0,
      losses: 0,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { email });
    
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).get();
    
    if (querySnapshot.empty) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    let userData = null;
    querySnapshot.forEach(doc => {
      userData = { id: doc.id, ...doc.data() };
    });
    
    if (userData.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log('✅ Login successful:', userData.username);
    
    res.json({
      success: true,
      uid: userData.uid,
      username: userData.username,
      email: userData.email,
      role: userData.role || 'user',
      tournamentsJoined: userData.tournamentsJoined || [],
      wins: userData.wins || 0,
      losses: userData.losses || 0
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ TOURNAMENT ROUTES ============

app.get('/api/tournaments', async (req, res) => {
  try {
    const tournamentsRef = db.collection('tournaments');
    const snapshot = await tournamentsRef.get();
    
    const tournaments = [];
    snapshot.forEach(doc => {
      tournaments.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(tournaments);
  } catch (error) {
    console.error('❌ Get tournaments error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/tournaments/:id', async (req, res) => {
  try {
    const tournamentRef = db.collection('tournaments').doc(req.params.id);
    const doc = await tournamentRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('❌ Get tournament error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tournaments/create', async (req, res) => {
  try {
    const { title, game, description, prize, maxPlayers, startDate, imageUrl } = req.body;
    
    const tournament = {
      title,
      game,
      description,
      prize: prize || '$0',
      maxPlayers: parseInt(maxPlayers) || 16,
      players: [],
      status: 'upcoming',
      startDate: startDate ? new Date(startDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('tournaments').add(tournament);
    
    console.log('✅ Tournament created:', title);
    
    res.status(201).json({ id: docRef.id, ...tournament });
  } catch (error) {
    console.error('❌ Create tournament error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tournaments/join/:id', async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }
    
    const tournamentRef = db.collection('tournaments').doc(tournamentId);
    const tournamentDoc = await tournamentRef.get();
    
    if (!tournamentDoc.exists) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const tournament = tournamentDoc.data();
    
    if (tournament.players && tournament.players.includes(userId)) {
      return res.status(400).json({ message: 'Already joined' });
    }
    
    if (tournament.players && tournament.players.length >= tournament.maxPlayers) {
      return res.status(400).json({ message: 'Tournament is full' });
    }
    
    const updatedPlayers = [...(tournament.players || []), userId];
    await tournamentRef.update({ players: updatedPlayers });
    
    const usersRef = db.collection('users');
    const userQuery = await usersRef.where('uid', '==', userId).get();
    
    if (!userQuery.empty) {
      userQuery.forEach(async (userDoc) => {
        const userData = userDoc.data();
        const updatedTournaments = [...(userData.tournamentsJoined || []), tournamentId];
        await usersRef.doc(userDoc.id).update({ tournamentsJoined: updatedTournaments });
      });
    }
    
    console.log('✅ User joined tournament:', userId, tournamentId);
    
    res.json({ message: 'Successfully joined tournament' });
  } catch (error) {
    console.error('❌ Join tournament error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/tournaments/:id', async (req, res) => {
  try {
    const tournamentRef = db.collection('tournaments').doc(req.params.id);
    const updateData = req.body;
    delete updateData.id;
    
    await tournamentRef.update(updateData);
    res.json({ message: 'Tournament updated successfully' });
  } catch (error) {
    console.error('❌ Update tournament error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/tournaments/:id', async (req, res) => {
  try {
    const tournamentRef = db.collection('tournaments').doc(req.params.id);
    await tournamentRef.delete();
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('❌ Delete tournament error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============ MATCH ROUTES ============

app.get('/api/matches', async (req, res) => {
  try {
    const { tournamentId } = req.query;
    let matchesRef = db.collection('matches');
    
    if (tournamentId) {
      const query = await matchesRef.where('tournamentId', '==', tournamentId).get();
      const matches = [];
      query.forEach(doc => {
        matches.push({ id: doc.id, ...doc.data() });
      });
      return res.json(matches);
    }
    
    const snapshot = await matchesRef.get();
    const matches = [];
    snapshot.forEach(doc => {
      matches.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(matches);
  } catch (error) {
    console.error('❌ Get matches error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/matches/generate', async (req, res) => {
  try {
    const { tournamentId, players } = req.body;
    
    console.log(`🎮 Generating matches for tournament: ${tournamentId}`);
    
    const existingMatches = await db.collection('matches').where('tournamentId', '==', tournamentId).get();
    const deletePromises = [];
    existingMatches.forEach(doc => {
      deletePromises.push(db.collection('matches').doc(doc.id).delete());
    });
    await Promise.all(deletePromises);
    
    const matches = [];
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      if (i + 1 < shuffledPlayers.length) {
        const match = {
          tournamentId,
          player1: shuffledPlayers[i],
          player2: shuffledPlayers[i + 1],
          winner: null,
          round: 1,
          status: 'pending',
          score: { player1Score: 0, player2Score: 0 },
          createdAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('matches').add(match);
        matches.push({ id: docRef.id, ...match });
      }
    }
    
    await db.collection('tournaments').doc(tournamentId).update({ status: 'ongoing' });
    
    console.log(`✅ Generated ${matches.length} matches`);
    res.json({ success: true, message: `${matches.length} matches generated`, matches });
  } catch (error) {
    console.error('❌ Generate matches error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/matches/:id/result', async (req, res) => {
  try {
    const { winnerId, score1, score2 } = req.body;
    const matchId = req.params.id;
    
    const matchRef = db.collection('matches').doc(matchId);
    const matchDoc = await matchRef.get();
    
    if (!matchDoc.exists) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    const match = matchDoc.data();
    
    await matchRef.update({
      winner: winnerId,
      status: 'completed',
      score: { player1Score: parseInt(score1) || 0, player2Score: parseInt(score2) || 0 },
      completedAt: new Date().toISOString()
    });
    
    // Update winner stats
    const winnerQuery = await db.collection('users').where('uid', '==', winnerId).get();
    if (!winnerQuery.empty) {
      winnerQuery.forEach(async (doc) => {
        const userData = doc.data();
        await db.collection('users').doc(doc.id).update({
          wins: (userData.wins || 0) + 1,
          totalMatches: (userData.totalMatches || 0) + 1
        });
      });
    }
    
    // Update loser stats
    const loserId = match.player1 === winnerId ? match.player2 : match.player1;
    const loserQuery = await db.collection('users').where('uid', '==', loserId).get();
    if (!loserQuery.empty) {
      loserQuery.forEach(async (doc) => {
        const userData = doc.data();
        await db.collection('users').doc(doc.id).update({
          losses: (userData.losses || 0) + 1,
          totalMatches: (userData.totalMatches || 0) + 1
        });
      });
    }
    
    res.json({ success: true, message: 'Match result updated' });
  } catch (error) {
    console.error('❌ Update match result error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN ROUTES ============

app.get('/api/admin/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        uid: userData.uid,
        username: userData.username,
        email: userData.email,
        role: userData.role || 'user',
        wins: userData.wins || 0,
        losses: userData.losses || 0,
        tournamentsJoined: userData.tournamentsJoined || []
      });
    });
    res.json(users);
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const userRef = db.collection('users').doc(req.params.id);
    await userRef.update({ role });
    res.json({ success: true, message: 'User role updated' });
  } catch (error) {
    console.error('❌ Update role error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/stats', async (req, res) => {
  try {
    const { wins, losses, totalMatches } = req.body;
    const userId = req.params.id;
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await userRef.update({
      wins: parseInt(wins) || 0,
      losses: parseInt(losses) || 0,
      totalMatches: parseInt(totalMatches) || (parseInt(wins) + parseInt(losses))
    });
    
    res.json({ success: true, message: 'User stats updated' });
  } catch (error) {
    console.error('❌ Update stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users/:id/boost-rank', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    const currentWins = userData.wins || 0;
    const newWins = currentWins + 10;
    
    await userRef.update({
      wins: newWins,
      totalMatches: (userData.totalMatches || 0) + 10
    });
    
    res.json({ success: true, message: `Rank boosted! +10 wins added` });
  } catch (error) {
    console.error('❌ Boost rank error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users/:id/kick', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // Remove from tournaments
    const tournamentsSnapshot = await db.collection('tournaments').get();
    for (const doc of tournamentsSnapshot.docs) {
      const tournament = doc.data();
      if (tournament.players && tournament.players.includes(userData.uid)) {
        const updatedPlayers = tournament.players.filter(p => p !== userData.uid);
        await db.collection('tournaments').doc(doc.id).update({ players: updatedPlayers });
      }
    }
    
    await userRef.update({ role: 'banned' });
    
    res.json({ success: true, message: `User ${userData.username} has been kicked` });
  } catch (error) {
    console.error('❌ Kick user error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/tournament/:id', async (req, res) => {
  try {
    const tournamentRef = db.collection('tournaments').doc(req.params.id);
    
    const matchesSnapshot = await db.collection('matches').where('tournamentId', '==', req.params.id).get();
    for (const doc of matchesSnapshot.docs) {
      await db.collection('matches').doc(doc.id).delete();
    }
    
    await tournamentRef.delete();
    res.json({ success: true, message: 'Tournament deleted' });
  } catch (error) {
    console.error('❌ Delete tournament error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/reset-all', async (req, res) => {
  try {
    const matchesSnapshot = await db.collection('matches').get();
    for (const doc of matchesSnapshot.docs) {
      await db.collection('matches').doc(doc.id).delete();
    }
    
    const tournamentsSnapshot = await db.collection('tournaments').get();
    for (const doc of tournamentsSnapshot.docs) {
      await db.collection('tournaments').doc(doc.id).delete();
    }
    
    const usersSnapshot = await db.collection('users').get();
    for (const doc of usersSnapshot.docs) {
      await db.collection('users').doc(doc.id).update({
        tournamentsJoined: [],
        wins: 0,
        losses: 0,
        totalMatches: 0
      });
    }
    
    res.json({ success: true, message: 'All data reset' });
  } catch (error) {
    console.error('❌ Reset error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/export-data', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const tournamentsSnapshot = await db.collection('tournaments').get();
    const matchesSnapshot = await db.collection('matches').get();
    
    const users = [];
    usersSnapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
    
    const tournaments = [];
    tournamentsSnapshot.forEach(doc => tournaments.push({ id: doc.id, ...doc.data() }));
    
    const matches = [];
    matchesSnapshot.forEach(doc => matches.push({ id: doc.id, ...doc.data() }));
    
    res.json({ users, tournaments, matches });
  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ CREATE SAMPLE DATA ============

async function createSampleData() {
  try {
    const tournamentsSnapshot = await db.collection('tournaments').get();
    
    if (tournamentsSnapshot.empty) {
      console.log('📦 Creating sample tournament data...');
      
      const sampleTournaments = [
        {
          title: 'Valorant Champions Cup',
          game: 'Valorant',
          description: 'The biggest Valorant tournament of the year!',
          prize: '$10,000',
          maxPlayers: 32,
          players: [],
          status: 'upcoming',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500',
          createdAt: new Date().toISOString()
        },
        {
          title: 'League of Legends Masters',
          game: 'League of Legends',
          description: '5v5 competitive action with amazing rewards',
          prize: '$5,000',
          maxPlayers: 64,
          players: [],
          status: 'upcoming',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500',
          createdAt: new Date().toISOString()
        }
      ];
      
      for (const tournament of sampleTournaments) {
        await db.collection('tournaments').add(tournament);
      }
      
      console.log('✅ Sample tournaments created!');
    }
  } catch (error) {
    console.log('⚠️ Could not create sample data:', error.message);
  }
}

createSampleData();

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('🎮 ====================================');
  console.log('🚀 Tournament Platform Backend Running');
  console.log('====================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  console.log(`🏆 Tournaments: http://localhost:${PORT}/api/tournaments`);
  console.log('====================================');
  console.log('');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

module.exports = app;