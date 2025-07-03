import React, { useState } from 'react';

const ResourcesContent = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    course: '',
    description: '',
    type: 'document',
    file: null
  });

  // Sample courses for dropdown
  const courses = [
    { id: 1, title: 'Introduction to Artificial Intelligence' },
    { id: 2, title: 'Advanced Machine Learning' },
    { id: 3, title: 'Neural Networks and Deep Learning' }
  ];

  // Sample resources data
  const [resources, setResources] = useState([
    {
      id: 1,
      title: 'Introduction to AI Slides',
      course: 'Introduction to Artificial Intelligence',
      type: 'presentation',
      uploadDate: '2025-06-20',
      size: '2.4 MB',
      downloads: 24,
      icon: '📊'
    },
    {
      id: 2,
      title: 'Machine Learning Algorithms Cheatsheet',
      course: 'Advanced Machine Learning',
      type: 'document',
      uploadDate: '2025-06-25',
      size: '1.2 MB',
      downloads: 18,
      icon: '📄'
    },
    {
      id: 3,
      title: 'Neural Network Architecture Diagram',
      course: 'Neural Networks and Deep Learning',
      type: 'image',
      uploadDate: '2025-06-28',
      size: '3.7 MB',
      downloads: 15,
      icon: '🖼️'
    },
    {
      id: 4,
      title: 'Introduction to Deep Learning',
      course: 'Neural Networks and Deep Learning',
      type: 'video',
      uploadDate: '2025-06-30',
      size: '45.2 MB',
      downloads: 22,
      icon: '🎬'
    },
    {
      id: 5,
      title: 'AI Ethics Case Studies',
      course: 'Introduction to Artificial Intelligence',
      type: 'document',
      uploadDate: '2025-07-01',
      size: '1.8 MB',
      downloads: 12,
      icon: '📄'
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData({
      ...uploadData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setUploadData({
        ...uploadData,
        file: e.target.files[0]
      });
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    // In a real app, you would upload the file to a server here
    const newResource = {
      id: resources.length + 1,
      title: uploadData.title,
      course: uploadData.course,
      type: uploadData.type,
      uploadDate: new Date().toISOString().split('T')[0],
      size: uploadData.file ? `${(uploadData.file.size / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB',
      downloads: 0,
      icon: uploadData.type === 'document' ? '📄' : 
            uploadData.type === 'presentation' ? '📊' : 
            uploadData.type === 'video' ? '🎬' : 
            uploadData.type === 'image' ? '🖼️' : '📁'
    };
    
    setResources([...resources, newResource]);
    setUploadData({
      title: '',
      course: '',
      description: '',
      type: 'document',
      file: null
    });
    setShowUploadForm(false);
  };
  
  // Filter resources based on active tab
  const filteredResources = resources.filter(resource => {
    if (activeTab === 'all') return true;
    return resource.type === activeTab;
  });
  
  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-intel-dark-blue">Educational Resources</h1>
          <p className="text-intel-gray mt-1">Upload and manage learning materials for your courses</p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="bg-intel-blue hover:bg-intel-dark-blue text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <span className="mr-2">📤</span> Upload Resource
        </button>
      </div>

      {/* Upload form */}
      {showUploadForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-intel-blue">
          <h2 className="text-xl font-semibold text-intel-dark-blue mb-4">Upload Educational Resource</h2>
          <form onSubmit={handleUpload}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="title">
                  Resource Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={uploadData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="course">
                  Course
                </label>
                <select
                  id="course"
                  name="course"
                  value={uploadData.course}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.title}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={uploadData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="type">
                  Resource Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={uploadData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                >
                  <option value="document">Document</option>
                  <option value="presentation">Presentation</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="file">
                  File
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-intel-gray hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-intel-blue text-white rounded-md hover:bg-intel-dark-blue transition-colors"
              >
                Upload Resource
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs for filtering */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-intel-blue text-intel-blue' : 'border-transparent text-intel-gray hover:text-intel-dark-blue hover:border-gray-300'}`}
          >
            All Resources
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'document' ? 'border-intel-blue text-intel-blue' : 'border-transparent text-intel-gray hover:text-intel-dark-blue hover:border-gray-300'}`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('presentation')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'presentation' ? 'border-intel-blue text-intel-blue' : 'border-transparent text-intel-gray hover:text-intel-dark-blue hover:border-gray-300'}`}
          >
            Presentations
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'video' ? 'border-intel-blue text-intel-blue' : 'border-transparent text-intel-gray hover:text-intel-dark-blue hover:border-gray-300'}`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'image' ? 'border-intel-blue text-intel-blue' : 'border-transparent text-intel-gray hover:text-intel-dark-blue hover:border-gray-300'}`}
          >
            Images
          </button>
        </nav>
      </div>

      {/* Resources list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <li key={resource.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-3xl mr-4">
                    {resource.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-intel-dark-blue truncate">{resource.title}</h3>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-intel-gray">
                      <div className="flex flex-wrap gap-x-4">
                        <span>Course: {resource.course}</span>
                        <span>Size: {resource.size}</span>
                        <span>Uploaded: {resource.uploadDate}</span>
                      </div>
                      <div>
                        <span>{resource.downloads} downloads</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    <button className="text-intel-blue hover:text-intel-dark-blue" title="View">
                      <span className="text-lg">👁️</span>
                    </button>
                    <button className="text-intel-blue hover:text-intel-dark-blue" title="Edit">
                      <span className="text-lg">✏️</span>
                    </button>
                    <button className="text-red-600 hover:text-red-900" title="Delete">
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="p-8 text-center text-intel-gray">
              <p>No resources found matching the selected filter.</p>
              <button 
                onClick={() => setActiveTab('all')} 
                className="mt-2 text-intel-blue hover:underline"
              >
                View all resources
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ResourcesContent;
