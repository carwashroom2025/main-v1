
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Analytics
export async function getMonthlyUserRegistrations() {
    try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, orderBy('createdAt', 'asc'));
        const usersSnapshot = await getDocs(q);
        
        const monthlyData: { [key: string]: number } = {};

        usersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.createdAt && data.createdAt.toDate) {
                const date = data.createdAt.toDate();
                const month = date.toLocaleString('default', { month: 'long' });
                const year = date.getFullYear();
                const key = `${month} ${year}`;
                
                if (monthlyData[key]) {
                    monthlyData[key]++;
                } else {
                    monthlyData[key] = 1;
                }
            }
        });

        // Get last 6 months of data, including months with 0 users
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const today = new Date();
        const lastSixMonths = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = monthNames[d.getMonth()];
            const year = d.getFullYear();
            const key = `${month} ${year}`;
            lastSixMonths.push({
                month: month.slice(0,3),
                users: monthlyData[key] || 0
            });
        }
        
        return lastSixMonths;
    } catch(e) {
        console.error("Error fetching monthly user registrations:", e);
        return [];
    }
}
