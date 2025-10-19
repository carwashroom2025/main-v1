
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import type { BlogPost } from '../../types';
import { getCurrentUser } from '../auth';
import { logActivity } from './activity';

// Blog Posts
export async function getBlogPosts({ category, tag }: { category?: string | null, tag?: string | null } = {}): Promise<BlogPost[]> {
    const postsCol = collection(db, 'blogPosts');
    const q = query(postsCol, orderBy('date', 'desc'));

    const postsSnapshot = await getDocs(q);
    let postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));

    if (category) {
        postsList = postsList.filter(post => post.category === category);
    }
    if (tag) {
        postsList = postsList.filter(post => post.tags.includes(tag));
    }

    return postsList;
}

export async function getRelatedBlogPosts(currentPost: BlogPost, count: number): Promise<BlogPost[]> {
    if (!currentPost) return [];

    const postsCol = collection(db, 'blogPosts');
    const allPostsSnapshot = await getDocs(postsCol);
    const allPosts = allPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost))
        .filter(p => p.id !== currentPost.id); // Exclude the current post

    const relatedScores: { [postId: string]: number } = {};

    allPosts.forEach(post => {
        let score = 0;
        if (post.author === currentPost.author) {
            score += 3;
        }
        if (post.category === currentPost.category) {
            score += 2;
        }
        
        const commonTags = post.tags?.filter(tag => currentPost.tags?.includes(tag)) || [];
        score += commonTags.length;

        if (score > 0) {
            relatedScores[post.id] = score;
        }
    });

    const sortedRelatedPostIds = Object.keys(relatedScores).sort((a, b) => relatedScores[b] - relatedScores[a]);
    
    const relatedPosts = sortedRelatedPostIds
        .map(id => allPosts.find(p => p.id === id))
        .filter((p): p is BlogPost => !!p)
        .slice(0, count);

    return relatedPosts;
}

export async function getRecentBlogPosts(count: number): Promise<BlogPost[]> {
    const postsCol = collection(db, 'blogPosts');
    const q = query(postsCol, orderBy('date', 'desc'), limit(count));
    const postsSnapshot = await getDocs(q);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    return postsList;
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    const postsCol = collection(db, 'blogPosts');
    const q = query(postsCol, where('slug', '==', slug));
    const postSnapshot = await getDocs(q);
    if (postSnapshot.empty) {
        return null;
    }
    const postDoc = postSnapshot.docs[0];
    return { id: postDoc.id, ...postDoc.data() } as BlogPost;
}

export async function addBlogPost(postData: Omit<BlogPost, 'id'>): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Author', 'Moderator', 'Administrator'].includes(currentUser.role)) {
        throw new Error('You do not have permission to add blog posts.');
    }
    const postsCol = collection(db, 'blogPosts');
    const docRef = await addDoc(postsCol, {
        ...postData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    await logActivity(`User "${currentUser.name}" created a new blog post: "${postData.title}".`, 'blog', docRef.id, currentUser.id);
    return docRef.id;
}

export async function updateBlogPost(id: string, postData: Partial<BlogPost>): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('You must be logged in to update a post.');
    
    const postDocRef = doc(db, 'blogPosts', id);
    const postDoc = await getDoc(postDocRef);
    if (!postDoc.exists()) throw new Error('Post not found.');

    const originalPost = postDoc.data() as BlogPost;

    const isAdmin = ['Moderator', 'Administrator'].includes(currentUser.role);
    const isAuthor = currentUser.id === originalPost.authorId;

    if (!isAdmin && !isAuthor) {
        throw new Error('You do not have permission to update this post.');
    }

    await updateDoc(postDocRef, {
        ...postData,
        updatedAt: Timestamp.now(),
    });
    await logActivity(`User "${currentUser.name}" updated the blog post: "${postData.title}".`, 'blog', id, currentUser.id);
}

export async function deleteBlogPost(id: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('You must be logged in to delete a post.');

    const postDocRef = doc(db, 'blogPosts', id);
    const postDoc = await getDoc(postDocRef);
    if (!postDoc.exists()) throw new Error('Post not found.');
    
    const originalPost = postDoc.data() as BlogPost;

    const isAdmin = ['Moderator', 'Administrator'].includes(currentUser.role);
    const isAuthor = currentUser.id === originalPost.authorId;

    if (!isAdmin && !isAuthor) {
        throw new Error('You do not have permission to delete this post.');
    }
    
    await deleteDoc(postDocRef);
    // Note: This does not delete associated images from storage.
    await logActivity(`User "${currentUser.name}" deleted a blog post.`, 'blog', id, currentUser.id);
}

export async function getPopularTags(count: number): Promise<string[]> {
    const posts = await getBlogPosts();
    const tagCounts: { [key: string]: number } = {};

    posts.forEach(post => {
        post.tags?.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    const sortedTags = Object.entries(tagCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([tag]) => tag);

    return sortedTags.slice(0, count);
}
