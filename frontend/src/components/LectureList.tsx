import React, { useEffect, useState } from 'react';
import { getLectures } from '../services/api';

interface Lecture {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
}

interface LectureListProps {
  classId: string;
}

const LectureList: React.FC<LectureListProps> = ({ classId }) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    fetchLectures();
  }, [classId]);

  const fetchLectures = async () => {
    try {
      const response = await getLectures(classId);
      setLectures(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch lectures');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading lectures...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Course Lectures</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {lectures.map((lecture) => (
            <div
              key={lecture._id}
              className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                selectedLecture?._id === lecture._id ? 'bg-blue-50 border-blue-500' : ''
              }`}
              onClick={() => setSelectedLecture(lecture)}
            >
              <h3 className="font-semibold">{lecture.title}</h3>
              <p className="text-sm text-gray-600">{lecture.description}</p>
              <p className="text-sm text-gray-500">Duration: {lecture.duration}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          {selectedLecture ? (
            <div>
              <h3 className="text-xl font-bold mb-2">{selectedLecture.title}</h3>
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <iframe
                  src={selectedLecture.videoUrl}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
              <p className="text-gray-700">{selectedLecture.description}</p>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Select a lecture to start learning
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LectureList;
