
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getActivities, clearAllActivities } from '@/lib/firebase/firestore';
import type { Activity } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Activity as ActivityIcon, Trash2 } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from '@/components/ui/pagination';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


const ITEMS_PER_PAGE = 15;
const activityTypes = ['user', 'business', 'listing', 'review', 'data', 'blog'];

export default function ActivityLogPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const { toast } = useToast();

    const fetchActivities = async () => {
        setLoading(true);
        const { activities: fetchedActivities, totalCount: fetchedTotalCount } = await getActivities(currentPage, ITEMS_PER_PAGE, {
            type: typeFilter,
            searchTerm: searchTerm,
        });
        setActivities(fetchedActivities);
        setTotalCount(fetchedTotalCount);
        setLoading(false);
    }

    useEffect(() => {
        fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, typeFilter, searchTerm]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
    };
    
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            fetchActivities();
        }
    }

    const handleClearActivities = async () => {
        try {
            await clearAllActivities();
            toast({
                title: 'Activity Log Cleared',
                description: 'All activity records have been permanently deleted.',
            });
            fetchActivities(); // Refresh the list
        } catch (error) {
            console.error("Failed to clear activity log:", error);
            toast({
                title: "Error",
                description: "Could not clear the activity log.",
                variant: "destructive",
            });
        } finally {
            setIsAlertOpen(false);
        }
    };


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>
                        A log of all important events on the platform.
                    </CardDescription>
                </div>
                <Button variant="destructive" onClick={() => setIsAlertOpen(true)} disabled={activities.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Log
                </Button>
            </CardHeader>
            <CardContent>
                <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div className="relative">
                            <Label htmlFor="search-activity">Search Description</Label>
                            <Search className="absolute left-3 bottom-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="search-activity"
                                type="text"
                                placeholder="Search..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                        <div>
                             <Label htmlFor="type-filter">Activity Type</Label>
                            <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setCurrentPage(1); }}>
                                <SelectTrigger id="type-filter">
                                    <SelectValue placeholder="Filter by type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {activityTypes.map(type => (
                                        <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <>
                    {activities.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <h3 className="text-xl font-semibold">No Activities Found</h3>
                            <p className="text-muted-foreground mt-2">The activity log is currently empty.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {activities.map((activity) => (
                                    <TableRow key={activity.id}>
                                    <TableCell className="font-medium flex items-start gap-3">
                                        <ActivityIcon className="h-4 w-4 text-muted-foreground mt-1" />
                                        {activity.description}
                                    </TableCell>
                                    <TableCell><span className="capitalize">{activity.type}</span></TableCell>
                                    <TableCell>{format(activity.timestamp.toDate(), 'PPP p')}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination>
                                <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage - 1);
                                    }}
                                    />
                                </PaginationItem>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                    <PaginationLink
                                        href="#"
                                        isActive={currentPage === page}
                                        onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(page);
                                        }}
                                    >
                                        {page}
                                    </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage + 1);
                                    }}
                                    />
                                </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                    </>
                )}
            </CardContent>
             <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all
                        activity log entries from the database.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearActivities} className="bg-destructive hover:bg-destructive/90">
                        Clear Log
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
