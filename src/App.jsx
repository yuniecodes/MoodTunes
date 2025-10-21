import React, { useState, useEffect } from 'react';
import { Music, LogOut, Smile, Frown, Meh, Heart, Cloud, Flame } from 'lucide-react';

// Hardcoded YouTube playlists (from your original code)
const moodPlaylists = {
  chill: [
    { id: 1, title: "Lofi Hip Hop", artist: "Chill Vibes", thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg", videoId: "jfKfPfyJRdk" },
    { id: 2, title: "Study Music", artist: "Focus Beats", thumbnail: "https://i.ytimg.com/vi/5qap5aO4i9A/mqdefault.jpg", videoId: "5qap5aO4i9A" },
    { id: 3, title: "Chill Playlist", artist: "Lofi Girl", thumbnail: "https://i.ytimg.com/vi/lTRiuFIWV54/mqdefault.jpg", videoId: "lTRiuFIWV54" },
    { id: 4, title: "Relaxing Vibes", artist: "Chillhop", thumbnail: "https://i.ytimg.com/vi/7NOSDKb0HlU/mqdefault.jpg", videoId: "7NOSDKb0HlU" },
    { id: 5, title: "Calm Study", artist: "Study MD", thumbnail: "https://i.ytimg.com/vi/DWcJFNfaw9c/mqdefault.jpg", videoId: "DWcJFNfaw9c" },
    { id: 6, title: "Coffee Shop", artist: "Lofi Cafe", thumbnail: "https://i.ytimg.com/vi/bmVKaAV_7-A/mqdefault.jpg", videoId: "bmVKaAV_7-A" }
  ],
  happy: [
    { id: 7, title: "Happy Pop", artist: "Feel Good Inc", thumbnail: "https://i.ytimg.com/vi/5pidokakU4I/mqdefault.jpg", videoId: "5pidokakU4I" },
    { id: 8, title: "Upbeat Music", artist: "Good Vibes", thumbnail: "https://i.ytimg.com/vi/ZbZSe6N_BXs/mqdefault.jpg", videoId: "ZbZSe6N_BXs" },
    { id: 9, title: "Feel Good Hits", artist: "Pop Central", thumbnail: "https://i.ytimg.com/vi/CevxZvSJLk8/mqdefault.jpg", videoId: "CevxZvSJLk8" },
    { id: 10, title: "Summer Vibes", artist: "Sunny Day", thumbnail: "https://i.ytimg.com/vi/fWNaR-rxAic/mqdefault.jpg", videoId: "fWNaR-rxAic" },
    { id: 11, title: "Dance Party", artist: "Party Mix", thumbnail: "https://i.ytimg.com/vi/IcrbM1l_BoI/mqdefault.jpg", videoId: "IcrbM1l_BoI" },
    { id: 12, title: "Good Mood", artist: "Happiness", thumbnail: "https://i.ytimg.com/vi/y6Sxv-sUYtM/mqdefault.jpg", videoId: "y6Sxv-sUYtM" }
  ],
  sad: [
    { id: 13, title: "Sad Songs", artist: "Melancholy", thumbnail: "https://i.ytimg.com/vi/NAEppFUWLfc/mqdefault.jpg", videoId: "NAEppFUWLfc" },
    { id: 14, title: "Emotional Playlist", artist: "Heartbreak", thumbnail: "https://i.ytimg.com/vi/SX_ViT4Ra7k/mqdefault.jpg", videoId: "SX_ViT4Ra7k" },
    { id: 15, title: "Rainy Day", artist: "Blue Mood", thumbnail: "https://i.ytimg.com/vi/1SiylvmFI_8/mqdefault.jpg", videoId: "1SiylvmFI_8" },
    { id: 16, title: "Crying Songs", artist: "Tears", thumbnail: "https://i.ytimg.com/vi/dhYOPzcsbGM/mqdefault.jpg", videoId: "dhYOPzcsbGM" },
    { id: 17, title: "Lonely Nights", artist: "Solo", thumbnail: "https://i.ytimg.com/vi/4NRXx6U8ABQ/mqdefault.jpg", videoId: "4NRXx6U8ABQ" },
    { id: 18, title: "Heartbreak Playlist", artist: "Lost Love", thumbnail: "https://i.ytimg.com/vi/CvBfHwUxHIk/mqdefault.jpg", videoId: "CvBfHwUxHIk" }
  ],
  insecure: [
    { id: 19, title: "Indie Feels", artist: "Indie Soul", thumbnail: "https://i.ytimg.com/vi/1L4heD7kMr4/mqdefault.jpg", videoId: "1L4heD7kMr4" },
    { id: 20, title: "Vulnerable", artist: "Soft Pop", thumbnail: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg", videoId: "fJ9rUzIMcZQ" },
    { id: 21, title: "Self Reflection", artist: "Indie Mix", thumbnail: "https://i.ytimg.com/vi/450p7goxZqg/mqdefault.jpg", videoId: "450p7goxZqg" },
    { id: 22, title: "Overthinking", artist: "Thought Music", thumbnail: "https://i.ytimg.com/vi/RBumgq5yVrA/mqdefault.jpg", videoId: "RBumgq5yVrA" },
    { id: 23, title: "Anxiety Relief", artist: "Calm Indie", thumbnail: "https://i.ytimg.com/vi/5yx6BWlEVcY/mqdefault.jpg", videoId: "5yx6BWlEVcY" },
    { id: 24, title: "Quiet Storm", artist: "Mellow", thumbnail: "https://i.ytimg.com/vi/L_XJ_s5IsQc/mqdefault.jpg", videoId: "L_XJ_s5IsQc" }
  ],
  burnout: [
    { id: 25, title: "Meditation Music", artist: "Peace", thumbnail: "https://i.ytimg.com/vi/lFcSrYw-ARY/mqdefault.jpg", videoId: "lFcSrYw-ARY" },
    { id: 26, title: "Ambient Sounds", artist: "Relaxation", thumbnail: "https://i.ytimg.com/vi/1ZYbU82GVz4/mqdefault.jpg", videoId: "1ZYbU82GVz4" },
    { id: 27, title: "Stress Relief", artist: "Calm", thumbnail: "https://i.ytimg.com/vi/rIbhGwiHc3s/mqdefault.jpg", videoId: "rIbhGwiHc3s" },
    { id: 28, title: "Deep Sleep", artist: "Tranquil", thumbnail: "https://i.ytimg.com/vi/SJcz4BdDPGo/mqdefault.jpg", videoId: "SJcz4BdDPGo" },
    { id: 29, title: "Nature Sounds", artist: "Zen", thumbnail: "https://i.ytimg.com/vi/eKFTSSKCzWA/mqdefault.jpg", videoId: "eKFTSSKCzWA" },
    { id: 30, title: "Recovery Music", artist: "Healing", thumbnail: "https://i.ytimg.com/vi/2OEL4P1Rz04/mqdefault.jpg", videoId: "2OEL4P1Rz04" }
  ],
  angst: [
    { id: 31, title: "Rock Anthems", artist: "Hard Rock", thumbnail: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg", videoId: "fJ9rUzIMcZQ" },
    { id: 32, title: "Alternative Hits", artist: "Alt Rock", thumbnail: "https://i.ytimg.com/vi/hTWKbfoikeg/mqdefault.jpg", videoId: "hTWKbfoikeg" },
    { id: 33, title: "Angry Music", artist: "Rage", thumbnail: "https://i.ytimg.com/vi/CSvFpBOe8eY/mqdefault.jpg", videoId: "CSvFpBOe8eY" },
    { id: 34, title: "Punk Rock", artist: "Rebel", thumbnail: "https://i.ytimg.com/vi/ZpUYjpKg9KY/mqdefault.jpg", videoId: "ZpUYjpKg9KY" },
    { id: 35, title: "Metal Mix", artist: "Heavy", thumbnail: "https://i.ytimg.com/vi/Nnjh-zp6pP4/mqdefault.jpg", videoId: "Nnjh-zp6pP4" },
    { id: 36, title: "Grunge Playlist", artist: "90s Rock", thumbnail: "https://i.ytimg.com/vi/hTWKbfoikeg/mqdefault.jpg", videoId: "hTWKbfoikeg" }
  ]
};

const moodConfig = {
  chill: { icon: Cloud, color: "from-purple-400 to-teal-400" },
  happy: { icon: Smile, color: "from-yellow-400 to-orange-500" },
  sad: { icon: Frown, color: "from-blue-600 to-blue-900" },
  insecure: { icon: Meh, color: "from-teal-400 to-gray-600" },
  burnout: { icon: Cloud, color: "from-gray-700 to-yellow-800" },
  angst: { icon: Flame, color: "from-black to-gray-600" }
};

export default function MoodTunes() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [tracks, setTracks] = useState([]);

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

  const getPlaylist = (mood) => {
    setSelectedMood(mood);
    setTracks(moodPlaylists[mood] || []);
  };

  const MoodIcon = selectedMood ? moodConfig[selectedMood].icon : Music;
  const moodGradient = selectedMood ? moodConfig[selectedMood].color : "from-purple-600 to-blue-600";

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
        </div>

        <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">How are you feeling?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(moodConfig).map(([mood, { icon: Icon }]) => (
              <button
                key={mood}
                onClick={() => getPlaylist(mood)}
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

        {tracks.length > 0 && (
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
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 truncate">{track.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 truncate">{track.artist}</p>
                    <a
                      href={`https://www.youtube.com/watch?v=${track.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-center transition"
                    >
                      ▶ Play on YouTube
                    </a>
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
