
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where, updateDoc, deleteDoc, Timestamp, addDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Comment, Reply } from '../../types';
import { getCurrentUser } from '../auth';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from './activity';

// Comments
export async function getAllComments(): Promise<Comment[]> {
    const commentsCol = collection(db, 'comments');
    const snapshot = await getDocs(commentsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
}

export async function getComments(postId: string): Promise<Comment[]> {
    const commentsCol = collection(db, 'comments');
    const q = query(commentsCol, where('postId', '==', postId));
    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
    
    // Sort manually in the client
    return comments.sort((a, b) => b.date.toMillis() - a.date.toMillis());
}

export async function addComment(postId: string, text: string, parentCommentId?: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error("You must be logged in to comment.");
    }

    if (parentCommentId) {
        // This is a reply
        const reply: Reply = {
            id: uuidv4(),
            author: currentUser.name,
            authorId: currentUser.id,
            authorAvatarUrl: currentUser.avatarUrl,
            date: Timestamp.now(),
            text,
        };
        const commentRef = doc(db, 'comments', parentCommentId);
        const commentSnap = await getDoc(commentRef);
        if (commentSnap.exists()) {
            const commentData = commentSnap.data() as Comment;
            await logActivity(`User "${currentUser.name}" replied to a comment on a blog post.`, 'question', commentData.postId, currentUser.id);
            await updateDoc(commentRef, {
                replies: arrayUnion(reply)
            });
        }

    } else {
        // This is a top-level comment
        const comment: Omit<Comment, 'id'> = {
            postId,
            author: currentUser.name,
            authorId: currentUser.id,
            authorAvatarUrl: currentUser.avatarUrl,
            date: Timestamp.now(),
            text,
            replies: [],
        };
        const commentsCol = collection(db, 'comments');
        const docRef = await addDoc(commentsCol, comment);
        await logActivity(`User "${currentUser.name}" commented on a blog post.`, 'question', postId, currentUser.id);
    }
}

export async function deleteComment(commentId: string): Promise<void> {
    const commentRef = doc(db, 'comments', commentId);
    await deleteDoc(commentRef);
}

export async function deleteReply(commentId: string, reply: Reply): Promise<void> {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
        replies: arrayRemove(reply)
    });
}
