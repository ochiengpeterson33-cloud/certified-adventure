const fs = require('fs');
let code = fs.readFileSync('src/admin/HomepageManager.tsx', 'utf-8');

const replacement = `
  const experienceCards = [
    { id: 'nganya', title: 'Nganya Experience', hasVideo: true },
    { id: 'roadtrips', title: 'Road Trips & Adventures' },
    { id: 'weddings', title: 'Weddings & Ruracio Transport' },
    { id: 'safari', title: 'Safari Tours' },
    { id: 'coaster', title: 'Coaster & Group Hire' },
    { id: 'private', title: 'Private Car Hire' }
  ];

  const handleVideoUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = \`exp_vid_\${id}_\${Date.now()}.\${fileExt}\`;
    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage.from('website-assets').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(fileName);
      setExperiences(prev => ({ ...prev, [id + '_video']: publicUrl }));
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const renderExperiences = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Our Experiences Media</h3>
        <button onClick={() => handleSave('homepage-experiences', experiences)} disabled={isSaving} className="bg-[#FF6A00] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experienceCards.map(card => (
          <div key={card.id} className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-4">
            <h4 className="font-bold">{card.title}</h4>
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-500 mb-1">Image</label>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border border-gray-200 mb-2">
                  {experiences[card.id] ? (
                    <img src={experiences[card.id]} alt={card.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                    <Upload className="w-6 h-6 mr-2" /> Upload
                    <input type="file" accept="image/*" onChange={(e) => handleExperienceUpload(card.id, e)} className="hidden" />
                  </label>
                </div>
                <input type="text" placeholder="Image URL" value={experiences[card.id] || ''} onChange={(e) => setExperiences(prev => ({...prev, [card.id]: e.target.value}))} className="w-full border border-gray-200 rounded-lg p-2 text-sm" />
              </div>
              
              {card.hasVideo && (
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1">Video</label>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border border-gray-200 mb-2">
                    {experiences[card.id + '_video'] ? (
                      <video src={experiences[card.id + '_video']} className="w-full h-full object-cover" muted />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Video
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                      <Upload className="w-6 h-6 mr-2" /> Upload
                      <input type="file" accept="video/*" onChange={(e) => handleVideoUpload(card.id, e)} className="hidden" />
                    </label>
                  </div>
                  <input type="text" placeholder="Video URL" value={experiences[card.id + '_video'] || ''} onChange={(e) => setExperiences(prev => ({...prev, [card.id + '_video']: e.target.value}))} className="w-full border border-gray-200 rounded-lg p-2 text-sm" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
`;

code = code.replace(
  /const experienceCards = \[[\s\S]*?\n  const renderExperiences = \(\) => \([\s\S]*?\n  \);\n/g,
  replacement + "\n"
);

fs.writeFileSync('src/admin/HomepageManager.tsx', code);
