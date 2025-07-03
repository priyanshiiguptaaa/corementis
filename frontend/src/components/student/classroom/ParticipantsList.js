import React from 'react';

const ParticipantsList = ({ participants = [] }) => {
  // Sample participants data if none provided
  const defaultParticipants = [
    { id: 1, name: 'Dr. Smith', role: 'Teacher', isPresenting: true, hasCamera: true, hasMic: true, isActive: true },
    { id: 2, name: 'John Smith', role: 'Student', isPresenting: false, hasCamera: true, hasMic: true, isActive: false },
    { id: 3, name: 'Emily Johnson', role: 'Student', isPresenting: false, hasCamera: true, hasMic: false, isActive: false },
    { id: 4, name: 'Michael Brown', role: 'Student', isPresenting: false, hasCamera: false, hasMic: true, isActive: false },
    { id: 5, name: 'Sarah Davis', role: 'Student', isPresenting: false, hasCamera: true, hasMic: true, isActive: false },
    { id: 6, name: 'Alex Wilson', role: 'Student', isPresenting: false, hasCamera: false, hasMic: false, isActive: false },
    { id: 7, name: 'Jessica Lee', role: 'Student', isPresenting: false, hasCamera: true, hasMic: true, isActive: false },
  ];
  
  const displayParticipants = participants.length > 0 ? participants : defaultParticipants;
  
  // Separate instructors and students
  const instructors = displayParticipants.filter(p => p.role === 'Teacher');
  const students = displayParticipants.filter(p => p.role === 'Student');
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Instructors section */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2 px-2">Instructors ({instructors.length})</h3>
          <div className="space-y-2">
            {instructors.map((participant) => (
              <div 
                key={participant.id} 
                className="flex items-center justify-between p-2 bg-gray-700 rounded"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-intel-blue flex items-center justify-center mr-3">
                    <span>{participant.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-xs text-gray-400">Instructor</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {participant.hasCamera && <i className="fas fa-video text-gray-300"></i>}
                  {participant.hasMic && <i className="fas fa-microphone text-gray-300"></i>}
                  {participant.isActive && <span className="text-green-500">●</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Students section */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2 px-2">Students ({students.length})</h3>
          <div className="space-y-2">
            {students.map((participant) => (
              <div 
                key={participant.id} 
                className="flex items-center justify-between p-2 hover:bg-gray-700 rounded"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                    <span>{participant.name.charAt(0)}</span>
                  </div>
                  <p>{participant.name}</p>
                </div>
                <div className="flex space-x-1">
                  {participant.hasCamera && <i className="fas fa-video text-gray-300"></i>}
                  {!participant.hasMic && <i className="fas fa-microphone-slash text-gray-300"></i>}
                  {participant.hasMic && <i className="fas fa-microphone text-gray-300"></i>}
                  {participant.isActive && <span className="text-green-500">●</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsList;
