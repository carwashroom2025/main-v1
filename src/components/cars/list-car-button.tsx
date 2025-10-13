
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { CarForm } from '@/components/admin/car-form';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type ListCarButtonProps = {
  onCarListed: () => void;
};

export function ListCarButton({ onCarListed }: ListCarButtonProps) {
  const { user, loading } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return <Skeleton className="h-10 w-32" />;
  }

  const canListCar = user && ['Author', 'Admin', 'Owner'].includes(user.role);

  if (!canListCar) {
    return null;
  }

  const handleDataChange = () => {
    onCarListed();
    toast({
      title: 'Vehicle Added',
      description: 'Your new vehicle listing has been successfully created.',
    });
  };

  return (
    <>
      <Button onClick={() => setIsFormOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        List a Car
      </Button>

      <CarForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        vehicle={null}
        onDataChange={handleDataChange}
      />
    </>
  );
}
