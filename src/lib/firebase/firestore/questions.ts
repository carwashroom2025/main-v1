

import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, getCountFromServer, addDoc, updateDoc, deleteDoc, Timestamp, startAfter, runTransaction, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Question, Answer } from '../../types';
import { getCurrentUser } from '../auth';
import { logActivity } from './activity';
import { v4 as uuidv4 } from 'uuid';

// Questions (FAQ)

// GET
export async function getQuestions(
    options: { 
        page?: number, 
        limit?: number, 
        sortBy?: 'Newest' | 'Oldest' | 'TopAnswers' | 'TopRated'
    } = {}
): Promise<{ questions: Question[], totalCount: number }> {
    const { page = 1, limit: itemsPerPage = 10, sortBy = 'Newest' } = options;
    const questionsCol = collection(db, 'questions');
    let q = query(questionsCol);

    let orderByField: 'createdAt' | 'answerCount' | 'upvotes' = 'createdAt';
    let orderByDirection: 'desc' | 'asc' = 'desc';

    if (sortBy === 'Oldest') {
        orderByDirection = 'asc';
    } else if (sortBy === 'TopAnswers') {
        orderByField = 'answerCount';
    } else if (sortBy === 'TopRated') {
        orderByField = 'upvotes';
    }

    const countSnapshot = await getCountFromServer(questionsCol);
    const totalCount = countSnapshot.data().count;

    q = query(q, orderBy(orderByField, orderByDirection));

    if (page > 1) {
        const lastVisibleDocQuery = query(questionsCol, orderBy(orderByField, orderByDirection), limit((page - 1) * itemsPerPage));
        const lastVisibleDocSnapshot = await getDocs(lastVisibleDocQuery);
        const lastVisible = lastVisibleDocSnapshot.docs[lastVisibleDocSnapshot.docs.length - 1];
        if (lastVisible) {
            q = query(q, startAfter(lastVisible));
        }
    }

    q = query(q, limit(itemsPerPage));
    
    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
    
    return { questions, totalCount };
}

export async function getQuestion(id: string): Promise<Question | null> {
    const questionDocRef = doc(db, 'questions', id);
    
    try {
        const questionDoc = await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(questionDocRef);
            if (!sfDoc.exists()) {
                return null;
            }
            transaction.update(questionDocRef, { views: increment(1) });
            return sfDoc;
        });

        if (questionDoc) {
             return { id: questionDoc.id, ...questionDoc.data() } as Question;
        }
        return null;

    } catch (e) {
        console.error("Transaction failed: ", e);
        // If the transaction fails, fall back to a non-incrementing read
        return getQuestionWithoutIncrementingViews(id);
    }
}

export async function getQuestionWithoutIncrementingViews(id: string): Promise<Question | null> {
    const questionDocRef = doc(db, 'questions', id);
    const questionDoc = await getDoc(questionDocRef);
    if (questionDoc.exists()) {
        return { id: questionDoc.id, ...questionDoc.data() } as Question;
    }
    return null;
}

// ADD
export async function addQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'views' | 'votes' | 'answers' | 'upvotedBy' | 'downvotedBy' | 'upvotes' | 'downvotes' | 'answerCount'>): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('You must be logged in to ask a question.');
    }
    
    const questionsCol = collection(db, 'questions');
    const docRef = await addDoc(questionsCol, {
        ...questionData,
        author: currentUser.name,
        authorId: currentUser.id,
        authorAvatarUrl: currentUser.avatarUrl || '',
        createdAt: Timestamp.now(),
        views: 0,
        upvotes: 0,
        downvotes: 0,
        answers: [],
        upvotedBy: [],
        downvotedBy: [],
        answerCount: 0,
    });

    await logActivity(`User "${currentUser.name}" asked a new question: "${questionData.title}".`, 'question', docRef.id, currentUser.id);

    return docRef.id;
}


export async function addAnswer(questionId: string, body: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to post an answer.');
    }
  
    const questionRef = doc(db, 'questions', questionId);
  
    const newAnswer: Omit<Answer, 'createdAt'> & { createdAt: Timestamp } = {
      id: uuidv4(),
      body: body,
      author: currentUser.name,
      authorId: currentUser.id,
      authorAvatarUrl: currentUser.avatarUrl || '',
      createdAt: Timestamp.now(),
      upvotes: 0,
      downvotes: 0,
      accepted: false,
      upvotedBy: [],
      downvotedBy: [],
    };
  
    await updateDoc(questionRef, {
      answers: arrayUnion(newAnswer),
      answerCount: increment(1)
    });
}

// UPDATE
export async function updateQuestion(id: string, questionData: Partial<Omit<Question, 'id'>>): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Moderator', 'Administrator', 'Author'].includes(currentUser.role)) {
        throw new Error('You do not have permission to update questions.');
    }
    const questionDocRef = doc(db, 'questions', id);
    await updateDoc(questionDocRef, {
        ...questionData,
    });
    await logActivity(`Moderator "${currentUser.name}" updated the question: "${questionData.title}".`, 'question', id, currentUser.id);
}

export async function toggleAnswerAccepted(questionId: string, answerId: string): Promise<void> {
    const currentUser = await getCurrentUser();
    const questionRef = doc(db, 'questions', questionId);
  
    await runTransaction(db, async (transaction) => {
      const questionDoc = await transaction.get(questionRef);
      if (!questionDoc.exists()) {
        throw new Error('Question does not exist!');
      }
  
      const questionData = questionDoc.data() as Question;
  
      if (currentUser?.id !== questionData.authorId && !['Moderator', 'Administrator', 'Author'].includes(currentUser?.role || '')) {
        throw new Error('Only the question author or a moderator can accept an answer.');
      }
  
      let isAlreadyAccepted = false;
      const newAnswers = questionData.answers.map((answer) => {
        if (answer.id === answerId) {
          if (answer.accepted) {
            isAlreadyAccepted = true;
            return { ...answer, accepted: false };
          } else {
            return { ...answer, accepted: true };
          }
        }
        return answer;
      });
  
      // if un-accepting, just update
      if (isAlreadyAccepted) {
        transaction.update(questionRef, { answers: newAnswers });
      } else {
        // if accepting, un-accept all others
        const finalAnswers = newAnswers.map(a => (a.id === answerId ? a : { ...a, accepted: false }));
        transaction.update(questionRef, { answers: finalAnswers });
      }
    });
}

export async function voteOnQuestion(questionId: string, userId: string, voteType: 'up' | 'down'): Promise<void> {
    const questionRef = doc(db, 'questions', questionId);

    await runTransaction(db, async (transaction) => {
        const questionDoc = await transaction.get(questionRef);
        if (!questionDoc.exists()) {
            throw new Error("Question not found");
        }
        const questionData = questionDoc.data() as Question;

        const upvotedBy = questionData.upvotedBy || [];
        const downvotedBy = questionData.downvotedBy || [];
        const isUpvoted = upvotedBy.includes(userId);
        const isDownvoted = downvotedBy.includes(userId);

        let newUpvotedBy = [...upvotedBy];
        let newDownvotedBy = [...downvotedBy];

        if (voteType === 'up') {
            if (isUpvoted) {
                newUpvotedBy = newUpvotedBy.filter(id => id !== userId);
            } else {
                newUpvotedBy.push(userId);
                newDownvotedBy = newDownvotedBy.filter(id => id !== userId);
            }
        } else { // voteType is 'down'
            if (isDownvoted) {
                newDownvotedBy = newDownvotedBy.filter(id => id !== userId);
            } else {
                newDownvotedBy.push(userId);
                newUpvotedBy = newUpvotedBy.filter(id => id !== userId);
            }
        }
        
        const newUpvotes = newUpvotedBy.length;
        const newDownvotes = newDownvotedBy.length;
        
        transaction.update(questionRef, {
            upvotedBy: newUpvotedBy,
            downvotedBy: newDownvotedBy,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
        });
    });
}

export async function voteOnAnswer(questionId: string, answerId: string, userId: string, voteType: 'up' | 'down'): Promise<void> {
    const questionRef = doc(db, 'questions', questionId);
    
    await runTransaction(db, async (transaction) => {
        const questionDoc = await transaction.get(questionRef);
        if (!questionDoc.exists()) {
            throw new Error("Question not found");
        }
        const questionData = questionDoc.data() as Question;
        const answers = questionData.answers || [];
        const answerIndex = answers.findIndex(a => a.id === answerId);

        if (answerIndex === -1) {
            throw new Error("Answer not found");
        }
        
        const answer = { ...answers[answerIndex] };
        const upvotedBy = answer.upvotedBy || [];
        const downvotedBy = answer.downvotedBy || [];
        const isUpvoted = upvotedBy.includes(userId);
        const isDownvoted = downvotedBy.includes(userId);

        let newUpvotedBy = [...upvotedBy];
        let newDownvotedBy = [...downvotedBy];

        if (voteType === 'up') {
            if (isUpvoted) {
                newUpvotedBy = newUpvotedBy.filter(id => id !== userId);
            } else {
                newUpvotedBy.push(userId);
                newDownvotedBy = newDownvotedBy.filter(id => id !== userId);
            }
        } else { // voteType is 'down'
            if (isDownvoted) {
                newDownvotedBy = newDownvotedBy.filter(id => id !== userId);
            } else {
                newDownvotedBy.push(userId);
                newUpvotedBy = newUpvotedBy.filter(id => id !== userId);
            }
        }

        answer.upvotedBy = newUpvotedBy;
        answer.downvotedBy = newDownvotedBy;
        answer.upvotes = newUpvotedBy.length;
        answer.downvotes = newDownvotedBy.length;
        
        const newAnswers = [...answers];
        newAnswers[answerIndex] = answer;

        transaction.update(questionRef, { answers: newAnswers });
    });
}

// DELETE
export async function deleteQuestion(id: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('You must be logged in.');

    const questionDocRef = doc(db, 'questions', id);
    const questionDoc = await getDoc(questionDocRef);
    if (!questionDoc.exists()) throw new Error('Question not found.');

    const questionData = questionDoc.data() as Question;
    const canDelete = currentUser.id === questionData.authorId || ['Moderator', 'Administrator'].includes(currentUser.role);
    if (!canDelete) {
        throw new Error('You do not have permission to delete this question.');
    }
    
    await deleteDoc(questionDocRef);
    await logActivity(`User "${currentUser.name}" deleted a question: "${questionData.title}".`, 'question', id, currentUser.id);
}

export async function deleteAnswer(questionId: string, answerId: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("You must be logged in.");

    const questionRef = doc(db, 'questions', questionId);
    
    await runTransaction(db, async (transaction) => {
        const questionDoc = await transaction.get(questionRef);
        if (!questionDoc.exists()) {
            throw new Error("Question not found");
        }
        
        const questionData = questionDoc.data() as Question;
        const answers = questionData.answers || [];
        const answerToDelete = answers.find(a => a.id === answerId);

        if (!answerToDelete) {
            throw new Error("Answer not found.");
        }

        const canDelete = currentUser.id === answerToDelete.authorId || ['Moderator', 'Administrator'].includes(currentUser.role);
        if (!canDelete) {
            throw new Error("You don't have permission to delete this answer.");
        }

        const updatedAnswers = answers.filter(a => a.id !== answerId);
        
        transaction.update(questionRef, {
            answers: updatedAnswers,
            answerCount: increment(-1)
        });
    });
    await logActivity(`User "${currentUser.name}" deleted an answer.`, 'question', questionId, currentUser.id);
}
