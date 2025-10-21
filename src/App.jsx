import React, { useState, useEffect } from 'react';
import { Music, LogOut, Smile, Frown, Meh, Heart, Cloud, Flame } from 'lucide-react';

// Deezer API - No authentication required!
const DEEZER_API = 'https://api.deezer.com';
const CORS_PROXY = 'https://corsproxy.io/?';

const moodQueries = {
  chill: { query: "chill lofi study", icon: Cloud, color: "from-purple-400 to-teal-400" },
  happy: { query: "happy pop upbeat", icon: Smile, color: "from-yellow-400 to-orange-500" },
  sad: { query: "sad emotional", icon: Frown, color: "from-blue-600 to-blue-900" },
  insecure: { query: "melancholy indie", icon: Meh, color: "from-teal-400 to-gray-600" },
  burnout: { query: "calm meditation ambient", icon: Cloud, color: "from-gray-700 to-yellow-800" },
  angst: { query: "rock alternative angry", icon: Flame, color: "from-black to-gray-600" }
};

export default function MoodTunes() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [tracks, setTracks] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);

  // In-memory user storage
  const [users, setUsers] = useState([
    { email: 'm@gmail.com', password: '12345', name: 'Demo User' }
  ]);

  // Load user session on mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('moodtunes_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setCurrentPage('app');
    }
  }, []);

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('❌ Please fill in all fields.');
      return;
    }
    if (users.find(u => u.email === email)) {
      alert('❌ Email already exists. Please login.');
      return;
    }
    setUsers([...users, { name, email, password }]);
    alert('✅ Signup successful! Please login.');
    setCurrentPage('login');
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem('moodtunes_user', JSON.stringify(foundUser));
      setCurrentPage('app');
      setEmail('');
      setPassword('');
    } else {
      alert('❌ Invalid credentials. Try: m@gmail.com / 12345');
    }
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('moodtunes_user');
    setCurrentPage('login');
    setSelectedMood('');
    setTracks([]);
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingTrackId(null);
    }
  };

  const sendResetOtp = () => {
    if (!resetEmail) {
      alert('❌ Please enter your email.');
      return;
    }
    const userExists = users.find(u => u.email === resetEmail);
    
    if (!userExists) {
      alert('❌ No account found with this email.');
      return;
    }
    
    const generatedCode = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(generatedCode);
    setOtpSent(true);
    alert(`🔑 Reset OTP (demo): ${generatedCode}`);
    console.log('Reset OTP:', generatedCode);
  };

  const verifyAndResetPassword = () => {
    if (otp !== String(generatedOtp)) {
      alert('❌ Incorrect OTP. Please try again.');
      return;
    }
    
    if (newPassword.length < 5) {
      alert('❌ Password must be at least 5 characters.');
      return;
    }
    
    setUsers(users.map(u => 
      u.email === resetEmail ? { ...u, password: newPassword } : u
    ));
    
    alert('✅ Password reset successful! You can now login.');
    setShowForgotPassword(false);
    setResetEmail('');
    setOtp('');
    setNewPassword('');
    setOtpSent(false);
    setGeneratedOtp(null);
  };

  const fetchPlaylist = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    setTracks([]);

    try {
      // Use Deezer API with CORS proxy
      const searchQuery = encodeURIComponent(moodQueries[mood].query);
      const response = await fetch(
        `${CORS_PROXY}${DEEZER_API}/search?q=${searchQuery}&limit=12`
      );

      if (!response.ok) {
        throw new Error('Deezer API error');
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        setTracks(data.data);
      } else {
        alert('No tracks found for this mood. Try another!');
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      alert('Failed to fetch tracks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const playPreview = (url, trackId) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingTrackId(null);
    }

    if (playingTrackId === trackId) {
      return;
    }

    const audio = new Audio(url);
    audio.play().catch(err => {
      console.error('Audio playback error:', err);
      alert('Unable to play preview. Try another track!');
    });
    
    setCurrentAudio(audio);
    setPlayingTrackId(trackId);

    audio.addEventListener('ended', () => {
      setCurrentAudio(null);
      setPlayingTrackId(null);
    });
  };

  const MoodIcon = selectedMood ? moodQueries[selectedMood].icon : Music;
  const moodGradient = selectedMood ? moodQueries[selectedMood].color : "from-purple-600 to-blue-600";

  // LOGIN PAGE
  if (currentPage === 'login') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${moodGradient} flex items-center justify-center p-6 transition-all duration-1000`}>
        <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full items-center">
          <div className="flex-1 text-white text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <Music size={64} />
            </div>
            <h1 className="text-5xl font-bold mb-3">MoodTunes</h1>
            <p className="text-lg opacity-90">Your soundtrack for every mood</p>
            <p className="text-sm opacity-75 mt-2">Powered by Deezer 🎵</p>
          </div>

          <div className="flex-1 w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h2>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={handleLogin}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Login
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-purple-600 text-sm hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p className="mb-2">Demo: <strong>m@gmail.com</strong> / <strong>12345</strong></p>
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setCurrentPage('signup')}
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
              
              {!otpSent ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Enter your email to receive a reset code</p>
                  <input
                    type="email"
                    placeholder="Email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    onClick={sendResetOtp}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                  >
                    Send Reset Code
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Reset code sent! (Check alert for demo)</p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    onClick={verifyAndResetPassword}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                  >
                    Reset Password
                  </button>
                </div>
              )}
              
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setOtpSent(false);
                  setResetEmail('');
                  setOtp('');
                  setNewPassword('');
                }}
                className="mt-4 w-full text-gray-600 py-2 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SIGNUP PAGE
  if (currentPage === 'signup') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${moodGradient} flex items-center justify-center p-6 transition-all duration-1000`}>
        <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full items-center">
          <div className="flex-1 text-white text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <Music size={64} />
            </div>
            <h1 className="text-5xl font-bold mb-3">MoodTunes</h1>
            <p className="text-lg opacity-90">Create your account & start listening</p>
          </div>

          <div className="flex-1 w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSignup(e)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={handleSignup}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Sign Up
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setCurrentPage('login')}
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div className={`min-h-screen bg-gradient-to-br ${moodGradient} p-6 transition-all duration-1000`}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MoodIcon size={40} className="text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">MoodTunes</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.name}! 🎵</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ✨ <strong>No setup required!</strong> Select a mood below to discover music instantly.
            </p>
          </div>
        </div>

        <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">How are you feeling?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(moodQueries).map(([mood, { icon: Icon }]) => (
              <button
                key={mood}
                onClick={() => fetchPlaylist(mood)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMood === mood
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-400'
                } cursor-pointer`}
              >
                <Icon size={32} className="mx-auto mb-2" />
                <p className="font-semibold capitalize">{mood}</p>
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your playlist...</p>
          </div>
        )}

        {!loading && tracks.length > 0 && (
          <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🎧 {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Playlist
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-all overflow-hidden border border-gray-100"
                >
                  <img
                    src={track.album.cover_medium || track.album.cover}
                    alt={track.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 truncate">{track.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 truncate">
                      {track.artist.name}
                    </p>
                    <div className="flex gap-2">
                      {track.preview && (
                        <button
                          onClick={() => playPreview(track.preview, track.id)}
                          className={`flex-1 py-2 rounded-lg font-semibold transition ${
                            playingTrackId === track.id
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {playingTrackId === track.id ? '⏸ Stop' : '▶ Preview'}
                        </button>
                      )}
                      <a
                        href={track.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-center transition"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
