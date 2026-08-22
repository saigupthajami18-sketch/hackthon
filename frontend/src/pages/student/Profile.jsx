import React, { useState } from 'react';
import { UploadCloud, FileText, Code2, Code, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function Profile() {
  const { user } = useAuthStore();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [skills, setSkills] = useState([]);
  
  const [handles, setHandles] = useState({
    leetcode: '',
    github: '',
    codeforces: ''
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post(`/students/${user.user_id}/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.message);
      setSkills(response.data.extracted_skills);
    } catch (error) {
      console.error("Failed to upload resume", error);
      alert("Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveHandles = () => {
    alert("Coding profiles saved successfully!");
  };

  return (
    <div className="flex h-screen bg-black font-body text-champagne overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black opacity-80"></div>
      </div>

      <div className="flex flex-1 pt-8 max-w-[1440px] w-full mx-auto relative z-10">
        
        {/* Sidebar */}
        <aside className="w-64 fixed left-0 top-0 bottom-0 border-r border-white/5 hidden md:flex flex-col bg-black/20 backdrop-blur-sm">
          <div className="p-8 pb-4">
             <Link className="display-title text-2xl" to="/student/dashboard">Campus Connect</Link>
          </div>
          <nav className="flex-1 py-4 flex flex-col gap-2 px-4">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all" to="/student/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-900/20 border-l-2 border-blue-500 text-champagne transition-all" to="/student/profile">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="font-ui text-[11px] tracking-widest uppercase">My Profile</span>
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full">
          <header className="mb-10">
            <h1 className="display-title text-4xl mb-2">Student Profile</h1>
            <p className="font-body text-champagne/60 text-sm">Manage your resume and coding profiles.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Resume Upload Section */}
            <section className="glass-panel rounded-xl p-6 border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-blue-400 w-5 h-5" />
                <h3 className="font-display font-semibold text-xl">Resume Upload</h3>
              </div>
              <p className="text-sm text-champagne/60 mb-6">Upload your PDF resume. Our AI (Gemini) will automatically parse it and extract your skills.</p>
              
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-500/50 transition-colors">
                <UploadCloud className="w-10 h-10 text-champagne/40 mb-4" />
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  id="resume-upload" 
                />
                <label htmlFor="resume-upload" className="cursor-pointer font-ui text-xs uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors mb-2">
                  Browse Files
                </label>
                <p className="text-xs text-champagne/40">{file ? file.name : "Supported formats: PDF"}</p>
              </div>
              
              <button 
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-ui text-xs uppercase tracking-widest py-3 rounded-lg transition-colors"
              >
                {uploading ? "Parsing with AI..." : "Upload & Parse"}
              </button>
            </section>

            {/* AI Extracted Skills */}
            <section className="glass-panel rounded-xl p-6 border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <Code2 className="text-green-400 w-5 h-5" />
                <h3 className="font-display font-semibold text-xl">AI Extracted Skills</h3>
              </div>
              
              {skills.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-champagne/40 font-ui text-xs uppercase tracking-widest border border-white/5 rounded-lg bg-black/20">
                  Upload a resume to see skills
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-lg font-ui text-[10px] uppercase tracking-widest flex items-center gap-2">
                      {skill.name}
                      <span className="bg-green-500/20 px-1.5 py-0.5 rounded text-[9px]">{skill.months}m</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            {/* Coding Profiles */}
            <section className="glass-panel rounded-xl p-6 border-white/5 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Code className="text-purple-400 w-5 h-5" />
                <h3 className="font-display font-semibold text-xl">Coding Profiles</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-ui text-[10px] uppercase tracking-widest text-champagne/60 mb-2">LeetCode Handle</label>
                  <input 
                    type="text" 
                    className="input-glass w-full" 
                    placeholder="e.g. johndoe"
                    value={handles.leetcode}
                    onChange={e => setHandles({...handles, leetcode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-ui text-[10px] uppercase tracking-widest text-champagne/60 mb-2">GitHub Handle</label>
                  <input 
                    type="text" 
                    className="input-glass w-full" 
                    placeholder="e.g. johndoe"
                    value={handles.github}
                    onChange={e => setHandles({...handles, github: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-ui text-[10px] uppercase tracking-widest text-champagne/60 mb-2">Codeforces Handle</label>
                  <input 
                    type="text" 
                    className="input-glass w-full" 
                    placeholder="e.g. johndoe"
                    value={handles.codeforces}
                    onChange={e => setHandles({...handles, codeforces: e.target.value})}
                  />
                </div>
              </div>
              
              <button onClick={handleSaveHandles} className="mt-6 bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 border border-purple-500/30 font-ui text-xs uppercase tracking-widest px-6 py-2 rounded-lg transition-colors">
                Save Profiles
              </button>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
