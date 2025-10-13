
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
import { MoreHorizontal, PlusCircle, Eye } from 'lucide-react';
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
import { deleteVehicle } from '@/lib/firebase/firestore';
import Link from 'next/link';

export function CarTable({ vehicles, onDataChange }: { vehicles: Vehicle[], onDataChange: () => void }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
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

  return (
    <>
    <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Vehicle
        </Button>
    </div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Make</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell className="font-medium">{vehicle.name}</TableCell>
              <TableCell>{vehicle.make}</TableCell>
              <TableCell>{vehicle.year}</TableCell>
              <TableCell>${vehicle.price?.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={vehicle.status === 'New' ? 'default' : 'secondary'}>
                  {vehicle.status}
                </Badge>
              </TableCell>
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
                        <Link href={`/cars/${vehicle.id}`} className="flex justify-between w-full">
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
    </>
  );
}
