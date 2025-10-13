

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { addVehicle, updateVehicle } from '@/lib/firebase/firestore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Checkbox } from '../ui/checkbox';
import { X } from 'lucide-react';
import { vehicleBrands, vehicleTypes } from '@/lib/car-data';

type CarFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  vehicle: Vehicle | null;
  onDataChange: () => void;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear + 3 - i);

const featureOptions = {
    exteriorFeatures: ['LED Headlights', 'Fog Lights', 'Alloy Wheels', 'Sunroof / Moonroof', 'Roof Rails', 'Power Tailgate', 'Daytime Running Lights (DRL)', 'Rear Spoiler', 'Heated Side Mirrors', 'Parking Sensor'],
    interiorFeatures: ['Leather Seats', 'Fabric Seats', 'Power Adjustable Seats', 'Heated / Ventilated Seats', 'Ambient Lighting', 'Multi-Function Steering Wheel', 'Digital Cockpit', 'Push Start Button', 'Rear AC Vents', 'Folding Rear Seats'],
    comfortAndConvenience: ['Keyless Entry', 'Cruise Control', 'Automatic Climate Control', 'Wireless Charging', 'Navigation System', 'Infotainment', 'Apple CarPlay / Android Auto', 'Voice Command', 'Parking Sensors', '360° Camera / Rearview Camera', 'Power Windows & Mirrors'],
    safetyFeatures: ['Airbags (Front / Side / Curtain)', 'Anti-lock Braking System (ABS)', 'Electronic Brakeforce Distribution (EBD)', 'Electronic Stability Control (ESC)', 'Traction Control', 'Lane Keep Assist', 'Blind Spot Monitoring', 'Adaptive Cruise Control', 'Tyre Pressure Monitoring System (TPMS)', 'Hill Start Assist', 'Rear Cross Traffic Alert'],
};

const initialFormData: Omit<Vehicle, 'id' | 'createdAt'> = {
    name: '',
    make: '',
    model: '',
    year: currentYear,
    price: 0,
    bodyType: '',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    driveType: 'FWD',
    description: '',
    engine: '',
    displacement: '',
    cylinders: 4,
    horsepower: '',
    torque: '',
    brakeSpec: '',
    tireSpec: '',
    acceleration: '',
    topSpeed: '',
    suspension: '',
    length: 0,
    width: 0,
    height: 0,
    wheelbase: 0,
    groundClearance: 0,
    vehicleWeight: 0,
    maxPayload: 0,
    bootSpace: 0,
    dragCoefficient: 0,
    doors: 4,
    seats: 5,
    airbags: 2,
    variants: [],
    exteriorFeatures: [],
    interiorFeatures: [],
    infotainment: [],
    comfortAndConvenience: [],
    safetyFeatures: [],
    imageUrls: [],
};

export function CarForm({ isOpen, setIsOpen, vehicle, onDataChange }: CarFormProps) {
  const [formData, setFormData] = useState<Vehicle>(initialFormData as Vehicle);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [newVariant, setNewVariant] = useState('');
  const [imageUrlsText, setImageUrlsText] = useState('');


  useEffect(() => {
    if (vehicle) {
      setFormData({
        ...initialFormData,
        ...vehicle,
      });
      setImageUrlsText(vehicle.imageUrls?.join('\n') || '');
    } else {
      setFormData(initialFormData as Vehicle);
      setImageUrlsText('');
    }
  }, [vehicle, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSelectChange = (name: keyof Vehicle, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category: keyof typeof featureOptions, feature: string, checked: boolean) => {
      setFormData(prev => {
          const currentFeatures = prev[category as keyof Vehicle] as string[] || [];
          const newFeatures = checked
              ? [...currentFeatures, feature]
              : currentFeatures.filter(f => f !== feature);
          return { ...prev, [category]: newFeatures };
      });
  };

  const handleAddVariant = () => {
    if (newVariant.trim()) {
        setFormData(prev => ({
            ...prev,
            variants: [...(prev.variants || []), newVariant.trim()]
        }));
        setNewVariant('');
    }
  };

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
        ...prev,
        variants: (prev.variants || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleImageUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImageUrlsText(e.target.value);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedFormData = {
        ...formData,
        name: `${formData.make} ${formData.model} ${formData.year}`,
        imageUrls: imageUrlsText.split('\n').map(url => url.trim()).filter(url => url),
    };

    try {
      if (vehicle) {
        await updateVehicle(vehicle.id, updatedFormData);
        toast({
          title: 'Vehicle Updated',
          description: `"${updatedFormData.name}" has been successfully updated.`,
        });
      } else {
        await addVehicle(updatedFormData as Omit<Vehicle, 'id' | 'createdAt'>);
        toast({
          title: 'Vehicle Added',
          description: `"${updatedFormData.name}" has been successfully added.`,
        });
      }
      onDataChange();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to save vehicle. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCheckboxes = (category: keyof typeof featureOptions) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {featureOptions[category].map(feature => (
            <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                    id={`${category}-${feature.replace(/\s+/g, '-')}`}
                    checked={(formData[category as keyof Vehicle] as string[])?.includes(feature)}
                    onCheckedChange={(checked) => handleCheckboxChange(category, feature, !!checked)}
                />
                <label htmlFor={`${category}-${feature.replace(/\s+/g, '-')}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {feature}
                </label>
            </div>
        ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          <DialogDescription>
            {vehicle ? 'Update the details of the vehicle listing.' : 'Fill in the details for the new vehicle listing.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-6">
            <Accordion type="multiple" defaultValue={['basic-info']} className="w-full">
                <AccordionItem value="basic-info">
                    <AccordionTrigger>📘 Overview</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Make</Label>
                                <Select name="make" value={formData.make} onValueChange={(v) => handleSelectChange('make', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{vehicleBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Model</Label><Input name="model" value={formData.model} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Year</Label><Select name="year" value={String(formData.year)} onValueChange={(v) => handleSelectChange('year', Number(v))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label>Price ($)</Label><Input type="number" name="price" value={formData.price} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Body Type</Label><Select name="bodyType" value={formData.bodyType} onValueChange={(v) => handleSelectChange('bodyType', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{vehicleTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label>Drive Type</Label><Select name="driveType" value={formData.driveType} onValueChange={(v) => handleSelectChange('driveType', v as Vehicle['driveType'])}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['FWD', 'RWD', 'AWD/4WD'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label>Fuel Type</Label><Select name="fuelType" value={formData.fuelType} onValueChange={(v) => handleSelectChange('fuelType', v as Vehicle['fuelType'])}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['Petrol', 'Diesel', 'Hybrid', 'Electric'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label>Doors</Label><Input type="number" name="doors" value={formData.doors} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Seats</Label><Input type="number" name="seats" value={formData.seats} onChange={handleChange} /></div>
                         </div>
                         <div className="space-y-2">
                            <Label>Variants</Label>
                            <div className="space-y-2">
                                {(formData.variants || []).map((variant, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input value={variant} readOnly/>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveVariant(index)}><X className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <Input value={newVariant} onChange={(e) => setNewVariant(e.target.value)} placeholder="Add a new variant"/>
                                <Button type="button" onClick={handleAddVariant}>Add Variant</Button>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="performance-safety">
                    <AccordionTrigger>⚙️ Performance & Safety</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Engine</Label><Input name="engine" value={formData.engine} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Transmission</Label><Select name="transmission" value={formData.transmission} onValueChange={(v) => handleSelectChange('transmission', v as Vehicle['transmission'])}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['Manual', 'Automatic', 'CVT', 'DCT'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label>Displacement</Label><Input name="displacement" value={formData.displacement} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Cylinders</Label><Input type="number" name="cylinders" value={formData.cylinders} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Horsepower</Label><Input name="horsepower" value={formData.horsepower} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Torque</Label><Input name="torque" value={formData.torque} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Brake Spec</Label><Input name="brakeSpec" value={formData.brakeSpec} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Tire Spec</Label><Input name="tireSpec" value={formData.tireSpec} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Airbags</Label><Input type="number" name="airbags" value={formData.airbags} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Acceleration (0-60mph)</Label><Input name="acceleration" value={formData.acceleration} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Top Speed</Label><Input name="topSpeed" value={formData.topSpeed} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Suspension</Label><Input name="suspension" value={formData.suspension} onChange={handleChange} /></div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="description">
                    <AccordionTrigger>📝 Description</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2"><Label>Description</Label><Textarea name="description" value={formData.description} onChange={handleChange} rows={5} /></div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="features">
                    <AccordionTrigger>✨ Features</AccordionTrigger>
                    <AccordionContent className="space-y-6 pt-4">
                        <div className="space-y-2"><h4 className="font-medium">Exterior Features</h4>{renderCheckboxes('exteriorFeatures')}</div>
                        <div className="space-y-2"><h4 className="font-medium">Interior Features</h4>{renderCheckboxes('interiorFeatures')}</div>
                        <div className="space-y-2"><h4 className="font-medium">Comfort & Convenience</h4>{renderCheckboxes('comfortAndConvenience')}</div>
                        <div className="space-y-2"><h4 className="font-medium">Safety Features</h4>{renderCheckboxes('safetyFeatures')}</div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tech-specs">
                    <AccordionTrigger>📏 Technical Specification</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2"><Label>Length (mm)</Label><Input type="number" name="length" value={formData.length} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Width (mm)</Label><Input type="number" name="width" value={formData.width} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Height (mm)</Label><Input type="number" name="height" value={formData.height} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Wheelbase (mm)</Label><Input type="number" name="wheelbase" value={formData.wheelbase} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Ground Clearance (mm)</Label><Input type="number" name="groundClearance" value={formData.groundClearance} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Vehicle Weight (kg)</Label><Input type="number" name="vehicleWeight" value={formData.vehicleWeight} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Max Payload (kg)</Label><Input type="number" name="maxPayload" value={formData.maxPayload} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Boot Space (L)</Label><Input type="number" name="bootSpace" value={formData.bootSpace} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Drag Coefficient</Label><Input type="number" step="0.01" name="dragCoefficient" value={formData.dragCoefficient} onChange={handleChange} /></div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="media">
                    <AccordionTrigger>🖼️ Media</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                         <div className="space-y-2">
                            <Label htmlFor="imageUrls">Image URLs (one per line)</Label>
                            <Textarea id="imageUrls" value={imageUrlsText} onChange={handleImageUrlsChange} rows={5} placeholder="https://example.com/image1.jpg\nhttps://example.com/image2.jpg"/>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
