
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Eye, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Vehicle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { CarForm } from './car-form';
import { deleteVehicle, deleteMultipleVehicles } from '@/lib/firebase/firestore';
import Link from 'next/link';
import { Checkbox } from '../ui/checkbox';

export function CarTable({ vehicles, onDataChange }: { vehicles: Vehicle[], onDataChange: () => void }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleteSelectedAlertOpen, setIsDeleteSelectedAlertOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const { toast } = useToast();

    const handleEdit = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setSelectedVehicle(null);
        setIsFormOpen(true);
    }

    const handleDeleteClick = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
        setIsAlertOpen(true);
    }

    const handleDeleteConfirm = async () => {
        if (!vehicleToDelete) return;
        try {
            await deleteVehicle(vehicleToDelete.id);
            toast({
                title: "Vehicle Deleted",
                description: `"${vehicleToDelete.name}" has been successfully deleted.`,
            });
            onDataChange();
        } catch (error) {
            console.error("Failed to delete vehicle:", error);
            toast({
                title: "Error",
                description: "Failed to delete vehicle. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAlertOpen(false);
            setVehicleToDelete(null);
        }
    }
    
    const handleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedIds(vehicles.map(v => v.id));
        } else {
            setSelectedIds([]);
        }
    }

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        try {
            await deleteMultipleVehicles(selectedIds);
            toast({
                title: `${selectedIds.length} Vehicles Deleted`,
                description: "The selected vehicles have been successfully deleted.",
            });
            setSelectedIds([]);
            onDataChange();
        } catch (error) {
            console.error("Failed to delete selected vehicles:", error);
            toast({
                title: "Error",
                description: "Failed to delete selected vehicles. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleteSelectedAlertOpen(false);
        }
    }

  return (
    <>
    <div className="flex justify-end mb-4 gap-2">
         {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={() => setIsDeleteSelectedAlertOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedIds.length})
            </Button>
        )}
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Vehicle
        </Button>
    </div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
             <TableHead className="w-12">
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length === vehicles.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Make</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} data-state={selectedIds.includes(vehicle.id) && "selected"}>
              <TableCell>
                  <Checkbox
                      checked={selectedIds.includes(vehicle.id)}
                      onCheckedChange={() => handleSelect(vehicle.id)}
                      aria-label="Select row"
                  />
              </TableCell>
              <TableCell className="font-medium">{vehicle.name}</TableCell>
              <TableCell>{vehicle.make}</TableCell>
              <TableCell>{vehicle.year}</TableCell>
              <TableCell>${vehicle.price?.toLocaleString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/cars/${vehicle.id}`} className="flex justify-between w-full" scroll={false}>
                            <span>View</span>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleEdit(vehicle)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDeleteClick(vehicle)} className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <CarForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        vehicle={selectedVehicle}
        onDataChange={onDataChange}
    />

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the vehicle
                "{vehicleToDelete?.name}" and remove its data from our servers.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
     <AlertDialog open={isDeleteSelectedAlertOpen} onOpenChange={setIsDeleteSelectedAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {selectedIds.length} selected vehicles.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
