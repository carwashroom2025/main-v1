
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
import type { Question } from '@/lib/types';
import { deleteQuestion } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { FaqForm } from './faq-form';
import { format } from 'date-fns';
import Link from 'next/link';

type FaqTableProps = {
  questions: Question[];
  onDataChange: () => void;
};

export function FaqTable({ questions, onDataChange }: FaqTableProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
    const { toast } = useToast();

    const handleEdit = (question: Question) => {
        setSelectedQuestion(question);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setSelectedQuestion(null);
        setIsFormOpen(true);
    }

    const handleDeleteClick = (question: Question) => {
        setQuestionToDelete(question);
        setIsAlertOpen(true);
    }

    const handleDeleteConfirm = async () => {
        if (!questionToDelete) return;
        try {
            await deleteQuestion(questionToDelete.id);
            toast({
                title: "Question Deleted",
                description: `The question has been successfully deleted.`,
            });
            onDataChange();
        } catch (error) {
            console.error("Failed to delete question:", error);
            toast({
                title: "Error",
                description: "Failed to delete question. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAlertOpen(false);
            setQuestionToDelete(null);
        }
    }

  return (
    <>
    <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Question
        </Button>
    </div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Answers</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell className="font-medium">{question.title}</TableCell>
              <TableCell>{question.author}</TableCell>
              <TableCell>{format(question.createdAt.toDate(), 'PPP')}</TableCell>
              <TableCell>{question.answers.length}</TableCell>
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
                        <Link href={`/faq/${question.id}`} className="flex justify-between w-full">
                            <span>View</span>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleEdit(question)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDeleteClick(question)} className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <FaqForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        question={selectedQuestion}
        onDataChange={onDataChange}
    />

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the question
                "{questionToDelete?.title}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
