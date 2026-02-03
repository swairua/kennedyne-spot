import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, RefreshCw } from 'lucide-react';

export default function AdminPayments() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      console.error('Failed to load transactions', err);
      toast({ title: 'Error', description: 'Failed to load mpesa transactions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-5 w-5" /> Payment History (M-Pesa)</h1>
          <div>
            <Button onClick={loadTransactions} disabled={loading} variant="outline" className="mr-2">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        <Card>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                    <TableCell>{tx.phone}</TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>{tx.account_reference}</TableCell>
                    <TableCell className={tx.status === 'pending' ? 'text-amber-400' : tx.status === 'success' ? 'text-green-500' : 'text-red-500'}>{tx.status}</TableCell>
                    <TableCell className="max-w-[320px] truncate">
                      <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(tx.response_payload || tx.callback_payload || {}, null, 2)}</pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
