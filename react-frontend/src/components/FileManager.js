import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';

const FileManager = () => {
  const [sources, setSources] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchSourcesApi = async () => {
    const response = await fetch('http://localhost:8000/rag/files');
    if (!response.ok) {
      throw new Error('Failed to fetch sources');
    }
    return response.json();
  };

  const { callApi: fetchSources, loading: loadingSources, error: errorSources } = useApi(fetchSourcesApi);

  useEffect(() => {
    const loadSources = async () => {
      try {
        const data = await fetchSources();
        setSources(data.sources);
      } catch (err) {
        console.error(err);
      }
    };
    loadSources();
  }, []); // Empty dependency array ensures this runs only once

  const handleFileUpload = async (event) => {
    setUploading(true);
    
    const uploadedFiles = Array.from(event.target.files);
    
    for (const file of uploadedFiles) {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await fetch('http://localhost:8000/rag/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Upload failed:', errorData.error);
          continue; // Skip to next file if this one failed
        }
  
        const data = await response.json();
        
        // Only add file to list after successful upload
        const newSource = file.name;
        
        setSources(prevSources => [...prevSources, newSource]);
  
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    
    setUploading(false);
  };

  const handleView = (fileName) => {
    // TODO: Implement file viewing logic
    console.log(`Viewing file: ${fileName}`);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>File Manager</h1>
        <div className="upload-btn-wrapper">
          <input
            type="file"
            id="fileInput"
            className="d-none"
            accept=".pdf"
            multiple
            onChange={handleFileUpload}
          />
          <button 
            className="btn btn-primary"
            onClick={() => document.getElementById('fileInput').click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      {loadingSources && <p>Loading sources...</p>}
      {errorSources && <p className="text-danger">{errorSources}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source, index) => (
            <tr key={index}>
              <td>{source}</td>
              <td>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleView(source)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileManager;