
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSettings, updateSettings } from '@/lib/firebase/firestore';
import type { SecuritySettings, SeoSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const defaultSeoSettings: SeoSettings = {
    metaTitle: 'Carwashroom - Your Automotive Partner',
    metaDescription: 'A modern, professional, responsive automotive business directory website called Carwashroom.',
    metaKeywords: 'automotive, cars, business directory, car services',
    robotsTxt: 'User-agent: *\nAllow: /',
    siteTitle: 'Carwashroom',
};

const defaultSecuritySettings: SecuritySettings = {
    allowRegistration: true,
    defaultUserRole: 'User',
};

export default function SecuritySeoSettingsPage() {
    const { toast } = useToast();
    
    const [seoSettings, setSeoSettings] = useState<SeoSettings>(defaultSeoSettings);
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            try {
                const [securityData, seoData] = await Promise.all([
                    getSettings('security'),
                    getSettings('seo')
                ]);
                if (securityData) {
                    setSecuritySettings(securityData as SecuritySettings);
                } else {
                    // If no settings in DB, ensure it's enabled by default
                    setSecuritySettings(defaultSecuritySettings);
                }
                if (seoData) setSeoSettings(seoData as SeoSettings);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                toast({
                    title: 'Error',
                    description: 'Could not load settings from the database.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, [toast]);

    const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setSeoSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSecuritySettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSwitchChange = (id: keyof typeof securitySettings, checked: boolean) => {
        setSecuritySettings(prev => ({ ...prev, [id]: checked }));
    };

    const handleSelectChange = (id: keyof typeof securitySettings, value: string) => {
        setSecuritySettings(prev => ({...prev, [id]: value as SecuritySettings['defaultUserRole']}));
    }

    const handleSeoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateSettings('seo', seoSettings);
            toast({
                title: 'SEO Settings Saved',
                description: 'Your new SEO settings have been applied.',
            });
        } catch (error) {
             toast({ title: 'Error', description: 'Failed to save SEO settings.', variant: 'destructive'});
        }
    };

    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateSettings('security', securitySettings);
            toast({
                title: 'Security Settings Saved',
                description: 'Your new security settings have been applied.',
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save security settings.', variant: 'destructive'});
        }
    };

  if (loading) {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>SEO & Site Identity</CardTitle>
                <CardDescription>Manage site-wide search engine optimization and branding.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSeoSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="siteTitle">Site Title</Label>
                            <Input 
                                id="siteTitle" 
                                value={seoSettings.siteTitle}
                                onChange={handleSeoChange}
                            />
                        </div>
                    </div>
                     <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="metaTitle">Default Meta Title</Label>
                            <Input 
                                id="metaTitle" 
                                value={seoSettings.metaTitle}
                                onChange={handleSeoChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="metaKeywords">Meta Keywords</Label>
                            <Input 
                                id="metaKeywords" 
                                value={seoSettings.metaKeywords}
                                onChange={handleSeoChange}
                                placeholder="e.g., cars, automotive, repair"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="metaDescription">Default Meta Description</Label>
                        <Textarea 
                            id="metaDescription"
                            value={seoSettings.metaDescription}
                            onChange={handleSeoChange}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="robotsTxt">Robots.txt Content</Label>
                        <Textarea 
                            id="robotsTxt"
                            value={seoSettings.robotsTxt}
                            onChange={handleSeoChange}
                            rows={5}
                            className="font-mono"
                        />
                    </div>
                    <Button type="submit">Save SEO Settings</Button>
                </form>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage access and registration.</CardDescription>
            </CardHeader>
             <CardContent>
                 <form onSubmit={handleSecuritySubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">User Registration</h3>
                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <Label>Allow User Registration</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable or disable public user sign-ups.
                                </p>
                            </div>
                            <Switch
                                checked={securitySettings.allowRegistration}
                                onCheckedChange={(checked) => handleSwitchChange('allowRegistration', checked)}
                            />
                        </div>
                        <div className="w-full max-w-sm">
                            <Label htmlFor="defaultUserRole">Default Role for New Users</Label>
                            <Select 
                                value={securitySettings.defaultUserRole}
                                onValueChange={(value) => handleSelectChange('defaultUserRole', value)}
                                disabled={!securitySettings.allowRegistration}
                            >
                                <SelectTrigger id="defaultUserRole">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="User">User</SelectItem>
                                    <SelectItem value="Business Owner">Business Owner</SelectItem>
                                    <SelectItem value="Author">Author</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <Button type="submit">Save Security Settings</Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
