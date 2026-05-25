import React from 'react';
import { Users, BookOpen, Award, Clock } from 'lucide-react';

const AboutPage: React.FC = () => {
  const stats = [
    { icon: Users, label: 'Active Students', value: '10,000+' },
    { icon: BookOpen, label: 'Courses', value: '500+' },
    { icon: Award, label: 'Expert Instructors', value: '100+' },
    { icon: Clock, label: 'Learning Hours', value: '50,000+' }
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About ClassPlus</h1>
          <p className="text-lg text-gray-600">
            Empowering learners worldwide through accessible, quality education
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              At ClassPlus, we believe in making quality education accessible to everyone. 
              Our platform connects passionate instructors with eager learners, creating 
              a vibrant community of knowledge sharing and growth.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              We envision a world where geographical and economic barriers no longer 
              limit access to education. Through technology and innovation, we're 
              building the future of learning.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
              <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;