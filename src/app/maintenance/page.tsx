
import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
      <Wrench className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-4xl font-bold mb-2">Under Maintenance</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        Our site is currently down for scheduled maintenance. We'll be back online shortly. Thank you for your patience!
      </p>
    </div>
  );
}
