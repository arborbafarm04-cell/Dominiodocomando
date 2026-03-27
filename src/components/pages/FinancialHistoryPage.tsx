import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import {
  getPlayerFinancialHistory,
  getPlayerFinancialSummary,
  verifyPlayerBalanceConsistency,
  getAllFinancialHistory,
} from '@/services/financialHistoryService';
import { FinancialHistory } from '@/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FinancialSummary {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  netChange: number;
  transactionsByType: Record<string, number>;
  transactionsByOrigin: Record<string, number>;
}

interface BalanceConsistency {
  isConsistent: boolean;
  totalTransactions: number;
  inconsistencies: Array<{
    index: number;
    expected: number;
    actual: number;
    transaction: FinancialHistory;
  }>;
}

export default function FinancialHistoryPage() {
  const player = usePlayerStore((state) => state.player);
  const [history, setHistory] = useState<FinancialHistory[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [consistency, setConsistency] = useState<BalanceConsistency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'summary' | 'consistency' | 'all'>('history');

  useEffect(() => {
    loadData();
  }, [player?._id]);

  const loadData = async () => {
    if (!player?._id) return;

    setIsLoading(true);
    try {
      const [historyData, summaryData, consistencyData] = await Promise.all([
        getPlayerFinancialHistory(player._id, 100),
        getPlayerFinancialSummary(player._id),
        verifyPlayerBalanceConsistency(player._id),
      ]);

      setHistory(historyData.items);
      setSummary(summaryData);
      setConsistency(consistencyData);
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllHistory = async () => {
    setIsLoading(true);
    try {
      const allData = await getAllFinancialHistory(500);
      setHistory(allData.items);
    } catch (error) {
      console.error('Failed to load all history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!player?._id) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96 px-4">
          <p className="text-foreground text-sm sm:text-base">Please log in to view financial history</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full max-w-full mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-6 sm:mb-8">Financial History</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            onClick={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'default' : 'outline'}
          >
            Transaction History
          </Button>
          <Button
            onClick={() => setActiveTab('summary')}
            variant={activeTab === 'summary' ? 'default' : 'outline'}
          >
            Summary
          </Button>
          <Button
            onClick={() => setActiveTab('consistency')}
            variant={activeTab === 'consistency' ? 'default' : 'outline'}
          >
            Balance Check
          </Button>
          <Button
            onClick={() => {
              setActiveTab('all');
              loadAllHistory();
            }}
            variant={activeTab === 'all' ? 'default' : 'outline'}
          >
            All Transactions (Admin)
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'history' && !isLoading && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Your Transactions</h2>
            {history.length === 0 ? (
              <Card className="p-6 bg-secondary/10">
                <p className="text-foreground">No transactions recorded yet</p>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary">
                      <th className="text-left p-3 text-secondary">Date</th>
                      <th className="text-left p-3 text-secondary">Type</th>
                      <th className="text-left p-3 text-secondary">Origin</th>
                      <th className="text-right p-3 text-secondary">Amount</th>
                      <th className="text-right p-3 text-secondary">Before</th>
                      <th className="text-right p-3 text-secondary">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((transaction, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-secondary/20 hover:bg-secondary/5"
                      >
                        <td className="p-3 text-foreground">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 text-foreground">{transaction.operationType}</td>
                        <td className="p-3 text-foreground">{transaction.actionOrigin}</td>
                        <td
                          className={`p-3 text-right font-bold ${
                            transaction.value > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {transaction.value > 0 ? '+' : ''}{transaction.value}
                        </td>
                        <td className="p-3 text-right text-foreground">
                          {transaction.balanceBefore}
                        </td>
                        <td className="p-3 text-right text-foreground">
                          {transaction.balanceAfter}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && !isLoading && summary && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Financial Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-6 bg-secondary/10">
                <p className="text-secondary text-sm">Total Transactions</p>
                <p className="text-3xl font-bold text-foreground">
                  {summary.totalTransactions}
                </p>
              </Card>
              <Card className="p-6 bg-green-500/10">
                <p className="text-green-400 text-sm">Total Income</p>
                <p className="text-3xl font-bold text-green-400">
                  +{summary.totalIncome}
                </p>
              </Card>
              <Card className="p-6 bg-red-500/10">
                <p className="text-red-400 text-sm">Total Expense</p>
                <p className="text-3xl font-bold text-red-400">
                  {summary.totalExpense}
                </p>
              </Card>
              <Card className="p-6 bg-secondary/10 md:col-span-2 lg:col-span-3">
                <p className="text-secondary text-sm">Net Change</p>
                <p
                  className={`text-3xl font-bold ${
                    summary.netChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {summary.netChange > 0 ? '+' : ''}{summary.netChange}
                </p>
              </Card>
            </div>

            {/* Transaction breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="p-6 bg-secondary/10">
                <h3 className="text-lg font-bold text-foreground mb-4">By Type</h3>
                <div className="space-y-2">
                  {Object.entries(summary.transactionsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-foreground">
                      <span>{type}</span>
                      <span className="text-secondary">{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6 bg-secondary/10">
                <h3 className="text-lg font-bold text-foreground mb-4">By Origin</h3>
                <div className="space-y-2">
                  {Object.entries(summary.transactionsByOrigin).map(([origin, count]) => (
                    <div key={origin} className="flex justify-between text-foreground">
                      <span>{origin}</span>
                      <span className="text-secondary">{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Balance Consistency Tab */}
        {activeTab === 'consistency' && !isLoading && consistency && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Balance Consistency Check</h2>
            <Card
              className={`p-6 ${
                consistency.isConsistent ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}
            >
              <p className={consistency.isConsistent ? 'text-green-400' : 'text-red-400'}>
                Status: {consistency.isConsistent ? '✓ Consistent' : '✗ Inconsistencies Found'}
              </p>
              <p className="text-foreground mt-2">
                Total Transactions: {consistency.totalTransactions}
              </p>
            </Card>

            {consistency.inconsistencies.length > 0 && (
              <Card className="p-6 bg-red-500/10">
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Found {consistency.inconsistencies.length} Inconsistencies
                </h3>
                <div className="space-y-3">
                  {consistency.inconsistencies.map((inc, idx: number) => (
                    <div key={idx} className="p-3 bg-red-500/20 rounded">
                      <p className="text-red-400 text-sm">
                        Transaction #{inc.index}: Expected balance {inc.expected}, got{' '}
                        {inc.actual}
                      </p>
                      <p className="text-foreground text-xs mt-1">
                        {inc.transaction.actionOrigin} - {inc.transaction.operationType}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* All Transactions Tab */}
        {activeTab === 'all' && !isLoading && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">All Transactions (Admin)</h2>
            <p className="text-secondary text-sm">
              Showing {history.length} transactions from all players
            </p>
            {history.length === 0 ? (
              <Card className="p-6 bg-secondary/10">
                <p className="text-foreground">No transactions recorded</p>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary">
                      <th className="text-left p-3 text-secondary">Player ID</th>
                      <th className="text-left p-3 text-secondary">Date</th>
                      <th className="text-left p-3 text-secondary">Type</th>
                      <th className="text-left p-3 text-secondary">Origin</th>
                      <th className="text-right p-3 text-secondary">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((transaction, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-secondary/20 hover:bg-secondary/5"
                      >
                        <td className="p-3 text-foreground text-xs">
                          {transaction.playerId}
                        </td>
                        <td className="p-3 text-foreground">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 text-foreground">{transaction.operationType}</td>
                        <td className="p-3 text-foreground">{transaction.actionOrigin}</td>
                        <td
                          className={`p-3 text-right font-bold ${
                            transaction.value > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {transaction.value > 0 ? '+' : ''}{transaction.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
