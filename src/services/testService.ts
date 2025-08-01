import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc,
  getDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

export interface TestAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface TestResult {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  admissionNumber: string;
  branch: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number; // in seconds
  answers: TestAnswer[];
  completedAt: Date;
  status: 'completed' | 'in-progress' | 'abandoned';
}

export const testService = {
  // Sample test questions
  getTestQuestions: (): TestQuestion[] => [
    {
      id: '1',
      question: 'What is the primary purpose of a recruitment test?',
      options: [
        'To evaluate technical skills',
        'To assess overall competency and fit',
        'To test memory capacity',
        'To check attendance'
      ],
      correctAnswer: 1,
      category: 'General'
    },
    {
      id: '2',
      question: 'Which programming paradigm focuses on objects and classes?',
      options: [
        'Functional Programming',
        'Procedural Programming',
        'Object-Oriented Programming',
        'Logic Programming'
      ],
      correctAnswer: 2,
      category: 'Technical'
    },
    {
      id: '3',
      question: 'What does HTML stand for?',
      options: [
        'Hyper Text Markup Language',
        'High Tech Modern Language',
        'Home Tool Markup Language',
        'Hyperlink and Text Markup Language'
      ],
      correctAnswer: 0,
      category: 'Technical'
    },
    {
      id: '4',
      question: 'Which of the following is a version control system?',
      options: [
        'MySQL',
        'Git',
        'Apache',
        'Node.js'
      ],
      correctAnswer: 1,
      category: 'Technical'
    },
    {
      id: '5',
      question: 'What is the time complexity of binary search?',
      options: [
        'O(n)',
        'O(log n)',
        'O(n²)',
        'O(1)'
      ],
      correctAnswer: 1,
      category: 'Technical'
    },
    {
      id: '6',
      question: 'Which HTTP method is used to retrieve data?',
      options: [
        'POST',
        'PUT',
        'GET',
        'DELETE'
      ],
      correctAnswer: 2,
      category: 'Technical'
    },
    {
      id: '7',
      question: 'What does CSS stand for?',
      options: [
        'Computer Style Sheets',
        'Cascading Style Sheets',
        'Creative Style Sheets',
        'Colorful Style Sheets'
      ],
      correctAnswer: 1,
      category: 'Technical'
    },
    {
      id: '8',
      question: 'Which data structure follows LIFO principle?',
      options: [
        'Queue',
        'Array',
        'Stack',
        'Linked List'
      ],
      correctAnswer: 2,
      category: 'Technical'
    },
    {
      id: '9',
      question: 'What is the purpose of a database index?',
      options: [
        'To store data',
        'To improve query performance',
        'To backup data',
        'To encrypt data'
      ],
      correctAnswer: 1,
      category: 'Technical'
    },
    {
      id: '10',
      question: 'Which of the following is NOT a JavaScript framework?',
      options: [
        'React',
        'Angular',
        'Vue.js',
        'Laravel'
      ],
      correctAnswer: 3,
      category: 'Technical'
    }
  ],

  async submitTestResult(testResult: Omit<TestResult, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'testResults'), {
        ...testResult,
        completedAt: new Date()
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to submit test result');
    }
  },

  async getUserTestResults(userId: string): Promise<TestResult[]> {
    try {
      const q = query(
        collection(db, 'testResults'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const results: TestResult[] = [];
      
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        } as TestResult);
      });
      
      return results;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get test results');
    }
  },

  async getAllTestResults(): Promise<TestResult[]> {
    try {
      const q = query(
        collection(db, 'testResults'),
        orderBy('completedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const results: TestResult[] = [];
      
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        } as TestResult);
      });
      
      return results;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get all test results');
    }
  },

  calculateScore(answers: TestAnswer[]): { score: number; percentage: number } {
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    const totalQuestions = answers.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    return {
      score: correctAnswers,
      percentage
    };
  },

  getGradeFromPercentage(percentage: number): { grade: string; color: string; message: string } {
    if (percentage >= 90) {
      return {
        grade: 'A+',
        color: 'text-green-400',
        message: 'Outstanding Performance!'
      };
    } else if (percentage >= 80) {
      return {
        grade: 'A',
        color: 'text-green-400',
        message: 'Excellent Work!'
      };
    } else if (percentage >= 70) {
      return {
        grade: 'B+',
        color: 'text-blue-400',
        message: 'Good Performance!'
      };
    } else if (percentage >= 60) {
      return {
        grade: 'B',
        color: 'text-blue-400',
        message: 'Satisfactory!'
      };
    } else if (percentage >= 50) {
      return {
        grade: 'C',
        color: 'text-yellow-400',
        message: 'Needs Improvement!'
      };
    } else {
      return {
        grade: 'F',
        color: 'text-red-400',
        message: 'Better Luck Next Time!'
      };
    }
  }
};