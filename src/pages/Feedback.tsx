import React, { useState } from 'react';
import { useFreshData } from '@/hooks/useFreshData';
import { Loader2, MessageSquare, Star } from 'lucide-react';
import adminApi, { Feedback as IFeedback } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const Feedback = () => {
  const [feedback, setFeedback] = useState<IFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.feedback.getAll();
      setFeedback(data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to fetch feedback' });
    } finally {
      setIsLoading(false);
    }
  };

  useFreshData(fetchFeedback, 30000);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6" /> Website Feedback
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View user feedback and ratings.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No feedback found.
                    </TableCell>
                  </TableRow>
                ) : (
                  feedback.map((item) => (
                    <TableRow key={item._id} className="hover:bg-muted/20">
                      <TableCell>
                        {item.user ? (
                          <>
                            <p className="font-semibold">{item.user.name}</p>
                            <p className="text-xs text-muted-foreground">{item.user.email}</p>
                          </>
                        ) : (
                          <Badge variant="outline">Anonymous</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.rating} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-[400px] whitespace-pre-wrap">{item.message}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-muted-foreground max-w-[200px] truncate" title={item.device || 'N/A'}>
                          {item.device || 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
