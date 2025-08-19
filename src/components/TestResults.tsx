import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Target, Award, BarChart3, CheckCircle, XCircle, RotateCcw, LogOut } from 'lucide-react';
import { testService, TestResult } from '../services/testService';
import { authService } from '../services/authService';
import type { UserProfile } from '../lib/firebase';

interface TestResultsProps {
  user: any;
  userProfile: UserProfile;
  currentResult: TestResult;
  onBackToPortal: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({ user, userProfile, currentResult, onBackToPortal }) => {
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  useEffect(() => {
    loadUserResults();
  }, []);

  const loadUserResults = async () => {
    try {
      const results = await testService.getUserTestResults(user.uid);
      setAllResults(results);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const gradeInfo = testService.getGradeFromPercentage(currentResult.percentage);
  const questions = testService.getTestQuestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black bg-opacity-40 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Test Results</h1>
                <p className="text-xs sm:text-sm text-gray-300">Recruitment Examination</p>
              </div>
            </div>
            
            <button
              onClick={onBackToPortal}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-600 bg-opacity-20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-600 hover:bg-opacity-30 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Congratulations Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4 sm:mb-6">
            <Trophy className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Test Completed!
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-2 px-4">
            Congratulations, {userProfile.name}
          </p>
          <p className="text-base sm:text-lg text-gray-400 px-4">
            {gradeInfo.message}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Score */}
            <div className="text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Target className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                {currentResult.score}/{currentResult.totalQuestions}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">Questions Correct</p>
            </div>

            {/* Percentage */}
            <div className="text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                {currentResult.percentage}%
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">Score Percentage</p>
            </div>

            {/* Grade */}
            <div className="text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Award className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 ${gradeInfo.color}`}>
                {gradeInfo.grade}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">Grade Achieved</p>
            </div>

            {/* Time */}
            <div className="text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Clock className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                {formatTime(currentResult.timeSpent)}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">Time Taken</p>
            </div>
          </div>
        </div>

        {/* Detailed Results Toggle */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowDetailedResults(!showDetailedResults)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white hover:bg-gray-600 hover:border-gray-500 transition-all duration-300 text-sm sm:text-base w-full max-w-xs sm:max-w-none sm:w-auto"
          >
            {showDetailedResults ? 'Hide' : 'Show'} Detailed Results
          </button>
        </div>

        {/* Detailed Results */}
        {showDetailedResults && (
          <div className="bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-slide-up">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <span>Question-wise Analysis</span>
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              {questions.map((question, index) => {
                const userAnswer = currentResult.answers.find(a => a.questionId === question.id);
                const isCorrect = userAnswer?.isCorrect || false;
                const selectedAnswer = userAnswer?.selectedAnswer ?? -1;
                
                return (
                  <div key={question.id} className="bg-gray-800 bg-opacity-50 rounded-lg p-3 sm:p-4 border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 font-semibold text-sm sm:text-base">Q{index + 1}</span>
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={`text-xs sm:text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-purple-600 bg-opacity-30 border border-purple-500/30 rounded text-purple-300 text-xs w-fit">
                        {question.category}
                      </span>
                    </div>
                    
                    <p className="text-sm sm:text-base text-white mb-3">{question.question}</p>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 sm:p-3 rounded border text-xs sm:text-sm ${
                            optionIndex === question.correctAnswer
                              ? 'bg-green-600 bg-opacity-20 border-green-500 text-green-300'
                              : optionIndex === selectedAnswer && !isCorrect
                              ? 'bg-red-600 bg-opacity-20 border-red-500 text-red-300'
                              : 'bg-gray-700 bg-opacity-50 border-gray-600 text-gray-300'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <span className="font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>
                            <span className="flex-1">{option}</span>
                            {optionIndex === question.correctAnswer && (
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            )}
                            {optionIndex === selectedAnswer && optionIndex !== question.correctAnswer && (
                              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Previous Results */}
        {!loading && allResults.length > 1 && (
          <div className="bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4 sm:p-6 lg:p-8 animate-slide-up">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center space-x-3">
              <RotateCcw className="w-6 h-6 text-purple-400" />
              <span>Previous Attempts</span>
            </h3>
            
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-3 text-gray-300 font-semibold text-xs sm:text-sm px-2 sm:px-0">Date</th>
                    <th className="pb-3 text-gray-300 font-semibold text-xs sm:text-sm px-2 sm:px-0">Score</th>
                    <th className="pb-3 text-gray-300 font-semibold text-xs sm:text-sm px-2 sm:px-0">%</th>
                    <th className="pb-3 text-gray-300 font-semibold text-xs sm:text-sm px-2 sm:px-0">Grade</th>
                    <th className="pb-3 text-gray-300 font-semibold text-xs sm:text-sm px-2 sm:px-0">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {allResults.slice(0, 5).map((result, index) => {
                    const grade = testService.getGradeFromPercentage(result.percentage);
                    return (
                      <tr key={result.id} className="border-b border-gray-800">
                        <td className="py-2 sm:py-3 text-gray-300 text-xs sm:text-sm px-2 sm:px-0">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </td>
                        <td className="py-2 sm:py-3 text-white text-xs sm:text-sm px-2 sm:px-0">
                          {result.score}/{result.totalQuestions}
                        </td>
                        <td className="py-2 sm:py-3 text-white text-xs sm:text-sm px-2 sm:px-0">
                          {result.percentage}%
                        </td>
                        <td className={`py-2 sm:py-3 font-semibold text-xs sm:text-sm px-2 sm:px-0 ${grade.color}`}>
                          {grade.grade}
                        </td>
                        <td className="py-2 sm:py-3 text-gray-300 text-xs sm:text-sm px-2 sm:px-0">
                          {formatTime(result.timeSpent)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};

export default TestResults;