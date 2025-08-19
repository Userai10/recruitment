import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TestSettings {
  testStartTime: Date;
  testDuration: number; // in minutes
  maxTabSwitches: number;
  isTestActive: boolean;
}

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

export interface UserTestStatus {
  userId: string;
  hasSubmitted: boolean;
  submissionDate?: Date;
  tabSwitchCount: number;
  isTestCancelled: boolean;
  lastActivity: Date;
}

export const testService = {
  getTestSettings: (): TestSettings => ({
    testStartTime: new Date('2025-01-19T10:00:00'), // Fixed start time for all users
    testDuration: 60, // 1 hour in minutes
    maxTabSwitches: 2,
    isTestActive: true
  }),

  isTestAvailable: (): boolean => {
    const settings = testService.getTestSettings();
    return new Date() >= settings.testStartTime;
  },

  getTestEndTime: (): Date => {
    const settings = testService.getTestSettings();
    return new Date(settings.testStartTime.getTime() + settings.testDuration * 60 * 1000);
  },

  // Check if user can take the test (hasn't submitted before)
  async canUserTakeTest(userId: string): Promise<boolean> {
    try {
      const userStatus = await this.getUserTestStatus(userId);
      return !userStatus?.hasSubmitted && !userStatus?.isTestCancelled;
    } catch (error) {
      console.error('Error checking if user can take test:', error);
      return false;
    }
  },

  async getUserTestStatus(userId: string): Promise<UserTestStatus | null> {
    try {
      // First try to create the document if it doesn't exist
      const statusRef = doc(db, 'userTestStatus', userId);
      
      try {
        const statusDoc = await getDoc(statusRef);
        
        if (statusDoc.exists()) {
          const data = statusDoc.data();
          return {
            userId,
            hasSubmitted: data.hasSubmitted || false,
            submissionDate: data.submissionDate?.toDate(),
            tabSwitchCount: data.tabSwitchCount || 0,
            isTestCancelled: data.isTestCancelled || false,
            lastActivity: data.lastActivity?.toDate() || new Date()
          };
        } else {
          // Document doesn't exist, create it with default values
          const defaultStatus = {
            userId,
            hasSubmitted: false,
            tabSwitchCount: 0,
            isTestCancelled: false,
            lastActivity: new Date()
          };
          
          await setDoc(statusRef, defaultStatus);
          return defaultStatus;
        }
      } catch (docError: any) {
        // If we can't read the document, try to create it
        if (docError.code === 'permission-denied' || docError.code === 'not-found') {
          const defaultStatus = {
            userId,
            hasSubmitted: false,
            tabSwitchCount: 0,
            isTestCancelled: false,
            lastActivity: new Date()
          };
          
          await setDoc(doc(db, 'userTestStatus', userId), defaultStatus);
          return defaultStatus;
        }
        throw docError;
      }
      
    } catch (error: any) {
      console.error('Error in getUserTestStatus:', error);
      throw new Error(`Failed to get user test status: ${error.message}`);
    }
  },

  async updateUserTestStatus(userId: string, status: Partial<UserTestStatus>): Promise<void> {
    try {
      const statusRef = doc(db, 'userTestStatus', userId);
      await updateDoc(statusRef, {
        ...status,
        lastActivity: new Date()
      });
    } catch (error: any) {
      // If document doesn't exist, create it
      if (error.code === 'not-found') {
        await setDoc(doc(db, 'userTestStatus', userId), {
          userId,
          hasSubmitted: false,
          tabSwitchCount: 0,
          isTestCancelled: false,
          lastActivity: new Date(),
          ...status
        });
      } else {
        throw new Error(error.message || 'Failed to update user test status');
      }
    }
  },

  async markTestAsSubmitted(userId: string): Promise<void> {
    try {
      const statusRef = doc(db, 'userTestStatus', userId);
      const statusDoc = await getDoc(statusRef);
      
      if (statusDoc.exists()) {
        await updateDoc(statusRef, {
          hasSubmitted: true,
          submissionDate: new Date(),
          lastActivity: new Date()
        });
      } else {
        await setDoc(doc(db, 'userTestStatus', userId), {
          userId,
          hasSubmitted: true,
          submissionDate: new Date(),
          tabSwitchCount: 0,
          isTestCancelled: false,
          lastActivity: new Date()
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark test as submitted');
    }
  },

  async incrementTabSwitchCount(userId: string): Promise<number> {
    try {
      const statusRef = doc(db, 'userTestStatus', userId);
      const statusDoc = await getDoc(statusRef);
      
      let newCount = 1;
      
      if (statusDoc.exists()) {
        const currentCount = statusDoc.data().tabSwitchCount || 0;
        newCount = currentCount + 1;
        
        await updateDoc(statusRef, {
          tabSwitchCount: newCount,
          lastActivity: new Date()
        });
      } else {
        await setDoc(doc(db, 'userTestStatus', userId), {
          userId,
          hasSubmitted: false,
          tabSwitchCount: newCount,
          isTestCancelled: false,
          lastActivity: new Date()
        });
      }
      
      return newCount;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to increment tab switch count');
    }
  },

  async cancelTest(userId: string): Promise<void> {
    try {
      const statusRef = doc(db, 'userTestStatus', userId);
      const statusDoc = await getDoc(statusRef);
      
      if (statusDoc.exists()) {
        await updateDoc(statusRef, {
          isTestCancelled: true,
          lastActivity: new Date()
        });
      } else {
        await setDoc(doc(db, 'userTestStatus', userId), {
          userId,
          hasSubmitted: false,
          tabSwitchCount: 0,
          isTestCancelled: true,
          lastActivity: new Date()
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel test');
    }
  },

  // Sample test questions - removed correct answers visibility
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
      // Check if user has already submitted
      const userStatus = await this.getUserTestStatus(testResult.userId);
      if (userStatus?.hasSubmitted) {
        throw new Error('Test has already been submitted. Multiple submissions are not allowed.');
      }

      // Mark test as submitted first
      await this.markTestAsSubmitted(testResult.userId);
      
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
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const results: TestResult[] = [];
      
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        } as TestResult);
      });
      
      // Sort results by completedAt in descending order on client side
      return results.sort((a, b) => {
        const dateA = a.completedAt instanceof Date ? a.completedAt : a.completedAt.toDate();
        const dateB = b.completedAt instanceof Date ? b.completedAt : b.completedAt.toDate();
        return dateB.getTime() - dateA.getTime();
      });
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
  }

  // Removed getGradeFromPercentage function as per requirements
};