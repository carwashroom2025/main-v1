
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
import type { Question } from '@/lib/types';
import { addQuestion, updateQuestion } from '@/lib/firebase/firestore';

type FaqFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  question: Question | null;
  onDataChange: () => void;
};

const initialFormData = {
  title: '',
  body: '',
  tags: [],
};

export function FaqForm({ isOpen, setIsOpen, question, onDataChange }: FaqFormProps) {
  const [formData, setFormData] = useState<{title: string, body: string, tags: string[]}>(initialFormData);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title,
        body: question.body,
        tags: question.tags,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [question, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({...prev, tags: value.split(',').map(tag => tag.trim())}));
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData
      };

      if (question) {
        await updateQuestion(question.id, dataToSave);
        toast({
          title: 'Question Updated',
          description: `The question has been successfully updated.`,
        });
      } else {
        await addQuestion(dataToSave as any); // Let firestore function handle author etc.
        toast({
          title: 'Question Added',
          description: `The question has been successfully added.`,
        });
      }
      onDataChange();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to save question:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save question. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? 'Edit Question' : 'Add New Question'}</DialogTitle>
          <DialogDescription>
            {question ? 'Update the details of the question.' : 'Fill in the details for the new question.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea id="body" name="body" value={formData.body} onChange={handleChange} required rows={6}/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" name="tags" value={formData.tags.join(', ')} onChange={handleTagsChange} />
            </div>
            
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
