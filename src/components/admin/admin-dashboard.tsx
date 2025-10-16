

'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Users, List, Briefcase, Car, FileText, Activity as ActivityIcon, MessageSquare } from 'lucide-react';
import {
  getUsersCount,
  getBusinessesCount,
  getCarsCount,
  getBlogPostsCount,
  getPendingListingsCount,
  getMonthlyUserRegistrations,
  getRecentActivities,
  getReviewsCount,
} from '@/lib/firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { Activity } from '@/lib/types';
import Link from 'next/link';
import { Button } from '../ui/button';

const chartConfig = {
  users: {
    label: 'New Users',
    color: 'hsl(var(--primary))',
  },
};

type StatCardProps = {
  title: string;
  icon: React.ElementType;
  value: number | null;
  description?: string;
  link?: string;
}

function StatCard({ title, icon: Icon, value, description, link }: StatCardProps) {
    const cardContent = (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="p-2 bg-muted rounded-full">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                {value === null ? (
                    <Skeleton className="h-7 w-20" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );
    
    return link ? <Link href={link}>{cardContent}</Link> : cardContent;
}

export function AdminDashboard() {
  const [stats, setStats] = useState({
    users: null,
    businesses: null,
    cars: null,
    blogPosts: null,
    pendingListings: null,
    reviews: null,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setStatsLoading(true);
      try {
        const [
          usersCount,
          businessesCount,
          carsCount,
          blogPostsCount,
          pendingListingsCount,
          reviewsCount,
        ] = await Promise.all([
          getUsersCount(),
          getBusinessesCount(),
          getCarsCount(),
          getBlogPostsCount(),
          getPendingListingsCount(),
          getReviewsCount(),
        ]);
        setStats({
          users: usersCount,
          businesses: businessesCount,
          cars: carsCount,
          blogPosts: blogPostsCount,
          pendingListings: pendingListingsCount,
          reviews: reviewsCount,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setStatsLoading(false);
      }
    }
    
    async function fetchChartData() {
        setChartLoading(true);
        try {
            const monthlyUsers = await getMonthlyUserRegistrations();
            if (monthlyUsers.length > 0) {
                setChartData(monthlyUsers);
            } else {
                setChartData([
                    { month: 'January', users: 0 },
                    { month: 'February', users: 0 },
                    { month: 'March', users: 0 },
                    { month: 'April', users: 0 },
                    { month: 'May', users: 0 },
                    { month: 'June', users: 0 },
                ]);
            }
        } catch (error) {
            console.error("Failed to fetch chart data:", error);
        } finally {
            setChartLoading(false);
        }
    }

    async function fetchActivities() {
        setActivitiesLoading(true);
        try {
            const activities = await getRecentActivities(5);
            setRecentActivities(activities);
        } catch (error) {
            console.error("Failed to fetch recent activities:", error);
        } finally {
            setActivitiesLoading(false);
        }
    }

    fetchStats();
    fetchChartData();
    fetchActivities();
  }, []);
  
  const getActivityLink = (activity: Activity) => {
    switch (activity.type) {
        case 'user':
            return '/admin/users';
        case 'business':
        case 'listing':
            return `/services/${activity.relatedId}`;
        case 'review':
            return '/admin/reviews';
        case 'blog':
             return `/blog/${activity.relatedId}`;
        case 'question':
            return `/forum/${activity.relatedId}`;
        default:
            return '/admin/activity';
    }
  }


  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="mt-2 text-lg text-muted-foreground">An overview of your platform's performance.</p>
            </div>
        </div>
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Users" icon={Users} value={stats.users} link="/admin/users" />
            <StatCard title="Businesses Listed" icon={Briefcase} value={stats.businesses} link="/admin/business" />
            <StatCard title="Cars Listed" icon={Car} value={stats.cars} link="/admin/cars" />
            <StatCard title="Blog Posts" icon={FileText} value={stats.blogPosts} link="/admin/blog" />
            <StatCard title="Pending Listings" icon={List} value={stats.pendingListings} link="/admin/listings" />
            <StatCard title="Total Reviews" icon={MessageSquare} value={stats.reviews} link="/admin/reviews" />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>User Registrations</CardTitle>
                <CardDescription>New user sign-ups over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                {chartLoading ? (
                    <Skeleton className="h-[250px] w-full" />
                ) : (
                 <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart
                        data={chartData}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                        />
                        <Area
                        dataKey="users"
                        type="natural"
                        fill="var(--color-users)"
                        fillOpacity={0.4}
                        stroke="var(--color-users)"
                        />
                    </AreaChart>
                </ChartContainer>
                )}
            </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A log of the latest events on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {activitiesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3">
                        <Skeleton className="h-4 w-4 rounded-full mt-1" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))
            ) : recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                    <Link href={getActivityLink(activity)} key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted">
                        <div className="flex-shrink-0 pt-1">
                            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                            </p>
                        </div>
                    </Link>
                ))
            ) : (
                <p className="text-sm text-muted-foreground p-3">No recent activity.</p>
            )}
             <Button variant="link" asChild className="p-3">
                <Link href="/admin/activity">View all activity</Link>
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
