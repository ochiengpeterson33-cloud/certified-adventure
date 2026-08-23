import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { supabase } from '../lib/supabase';
import { 
  Upload, Image as ImageIcon, File, Folder, Search, 
  Trash2, Copy, Edit2, Filter, MoreVertical, X, CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BUCKETS = [
  'hero-images', 'gallery-images', 'destination-images', 
  'trip-images', 'package-images', 'team-images', 
  'blog-images', 'website-assets', 'logos', 'videos', 'documents'
];

interface MediaFile {
  id: string;
  file_name: string;
  bucket_name: string;
  public_url: string;
  width: number | null;
  height: number | null;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBucket, setSelectedBucket] = useState<string>('hero-images');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<{file: File, progress: number}[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('media_files')
        .select('*')
        .eq('bucket_name', selectedBucket)
        .order('created_at', { ascending: false });
        
      if (searchQuery) {
        query = query.ilike('file_name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedBucket, searchQuery]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads = acceptedFiles.map(file => ({ file, progress: 0 }));
    setUploadingFiles(prev => [...prev, ...newUploads]);

    for (const file of acceptedFiles) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(selectedBucket)
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(selectedBucket)
          .getPublicUrl(filePath);

        // Insert into database
        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            file_name: file.name,
            bucket_name: selectedBucket,
            public_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
          });

        if (dbError) throw dbError;

        setUploadingFiles(prev => prev.filter(p => p.file.name !== file.name));
        fetchFiles();
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploadingFiles(prev => prev.filter(p => p.file.name !== file.name));
      }
    }
  }, [selectedBucket]);

  const dropzoneOptions: any = { onDrop };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const handleDelete = async (file: MediaFile) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    
    try {
      // Assuming filename matches the storage path (simplification for this example)
      const pathParts = file.public_url.split('/');
      const storagePath = pathParts[pathParts.length - 1];
      
      await supabase.storage.from(file.bucket_name).remove([storagePath]);
      await supabase.from('media_files').delete().eq('id', file.id);
      
      setSelectedFile(null);
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("URL copied to clipboard!");
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden m-8">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all your website assets, images, and videos in one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search files..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#E67A3A] focus:border-transparent outline-none w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Buckets Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Storage Buckets</h3>
          <div className="space-y-1">
            {BUCKETS.map(bucket => (
              <button
                key={bucket}
                onClick={() => setSelectedBucket(bucket)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedBucket === bucket 
                    ? 'bg-[#E67A3A]/10 text-[#E67A3A]' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FolderOpen className={`w-4 h-4 ${selectedBucket === bucket ? 'text-[#E67A3A]' : 'text-gray-400'}`} />
                <span className="capitalize">{bucket.replace('-', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gray-50/50">
          {/* Dropzone */}
          <div className="p-6 pb-0">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-[#E67A3A] bg-[#E67A3A]/5' : 'border-gray-300 hover:border-[#E67A3A] bg-white'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-12 h-12 bg-[#E67A3A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-[#E67A3A]" />
              </div>
              <p className="text-sm font-medium text-gray-900">Drag & drop your files here, or click to browse</p>
              <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, WEBP, SVG, AVIF up to 10MB</p>
            </div>
            
            {/* Uploading progress */}
            {uploadingFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadingFiles.map((uf, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{uf.file.name}</span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E67A3A] animate-pulse w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gallery */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-4 border-[#E67A3A] border-t-transparent rounded-full"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                <p>No files found in {selectedBucket.replace('-', ' ')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-max">
                {files.map(file => (
                  <div 
                    key={file.id} 
                    onClick={() => setSelectedFile(file)}
                    className={`group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedFile?.id === file.id ? 'border-[#E67A3A]' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {file.mime_type?.startsWith('image/') ? (
                      <img src={file.public_url} alt={file.file_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <File className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium px-3 py-1.5 bg-black/50 rounded-lg">View Details</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white border-l border-gray-200 overflow-y-auto flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="font-bold text-gray-900">File Details</h3>
                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                  {selectedFile.mime_type?.startsWith('image/') ? (
                    <img src={selectedFile.public_url} alt={selectedFile.file_name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <File className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">File Name</label>
                    <p className="text-sm font-medium text-gray-900 break-all">{selectedFile.file_name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Uploaded On</label>
                      <p className="text-sm text-gray-900">{new Date(selectedFile.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">File Size</label>
                      <p className="text-sm text-gray-900">{(selectedFile.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Public URL</label>
                    <div className="flex mt-1">
                      <input 
                        type="text" 
                        readOnly 
                        value={selectedFile.public_url} 
                        className="flex-1 text-xs border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 outline-none"
                      />
                      <button 
                        onClick={() => copyToClipboard(selectedFile.public_url)}
                        className="px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-2">
                  <button 
                    onClick={() => handleDelete(selectedFile)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete File</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
