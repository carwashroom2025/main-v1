
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getUsers } from '@/lib/firebase/firestore';
import type { User } from '@/lib/types';
import { UserTable } from '@/components/admin/user-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ShieldCheck } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from '@/components/ui/pagination';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 10;
const roles = ['Owner', 'Admin', 'Author', 'Member', 'User'];
const statuses = ['Active', 'Suspended'];
const verifiedStatuses = ['Verified', 'Unverified'];

export default function ManageUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt-desc');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [verifiedFilter, setVerifiedFilter] = useState('all');
    const [finalSearchTerm, setFinalSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        const usersFromDb = await getUsers();
        setUsers(usersFromDb);
        setLoading(false);
    }

    useEffect(() => {
        fetchUsers();
    }, []);
    
    const adminUsers = useMemo(() => {
        return users.filter(user => ['Admin', 'Owner'].includes(user.role));
    }, [users]);

    const filteredAndSortedUsers = useMemo(() => {
        return users
            .filter(user => {
                const searchMatch = finalSearchTerm === '' || 
                                    user.name.toLowerCase().includes(finalSearchTerm.toLowerCase()) ||
                                    user.email.toLowerCase().includes(finalSearchTerm.toLowerCase());
                const roleMatch = roleFilter === 'all' || user.role === roleFilter;
                const statusMatch = statusFilter === 'all' || user.status === statusFilter;
                const verifiedMatch = verifiedFilter === 'all' || 
                                      (verifiedFilter === 'Verified' && user.verified) ||
                                      (verifiedFilter === 'Unverified' && !user.verified);
                return searchMatch && roleMatch && statusMatch && verifiedMatch;
            })
            .sort((a, b) => {
                if (sortBy === 'createdAt-desc') {
                    return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
                }
                if (sortBy === 'createdAt-asc') {
                    return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
                }
                return 0;
            });
    }, [users, finalSearchTerm, sortBy, roleFilter, statusFilter, verifiedFilter]);
    
    const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);

    const currentUsers = filteredAndSortedUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
      };

    const handleSearch = () => {
        setFinalSearchTerm(searchTerm);
        setCurrentPage(1);
    }

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <CardTitle>Administrators</CardTitle>
                    </div>
                    <CardDescription>
                        These users have elevated privileges to manage the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                         </div>
                    ) : adminUsers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {adminUsers.map(admin => (
                                <div key={admin.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                     <Avatar>
                                        <AvatarImage src={admin.avatarUrl} alt={admin.name} />
                                        <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{admin.name}</p>
                                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                                        <Badge variant="outline" className="mt-1">{admin.role}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No administrators found.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Manage All Users</CardTitle>
                    <CardDescription>
                    View, edit, and manage user accounts, roles, and permissions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="relative md:col-span-2 lg:col-span-1">
                                <Label htmlFor="search-user">Search by Name/Email</Label>
                                <Search className="absolute left-3 bottom-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="search-user"
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <div>
                                <Label htmlFor="role-filter">Role</Label>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger id="role-filter">
                                        <SelectValue placeholder="Filter by role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {roles.map(role => (
                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="status-filter">Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger id="status-filter">
                                        <SelectValue placeholder="Filter by status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {statuses.map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="verified-filter">Verification</Label>
                                <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                                    <SelectTrigger id="verified-filter">
                                        <SelectValue placeholder="Filter by verification..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {verifiedStatuses.map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
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
                        <UserTable users={currentUsers} onDataChange={fetchUsers} />
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
            </Card>
        </div>
    );
}
