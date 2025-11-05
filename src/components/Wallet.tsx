import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, Copy, Check, Wallet as WalletIcon, Eye, EyeOff, Shield } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import type { UserData } from '../App';
import { projectId } from '../utils/supabase/info';
import logoImage from 'figma:asset/b0a59305518defb1f7d865f6ef70ea53d1f4706f.png';

interface WalletProps {
  userData: UserData;
  session: any;
  refreshData: () => void;
}

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  status: string;
}

export function Wallet({ userData, session, refreshData }: WalletProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sending, setSending] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/transactions`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setTransactions(result.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(userData.walletAddress);
    setCopiedAddress(true);
    toast.success('Wallet address copied!');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const copyPrivateKey = () => {
    navigator.clipboard.writeText(userData.privateKey);
    toast.success('Private key copied! Keep it safe!');
  };

  const handleSend = async () => {
    if (!sendAmount || !recipientAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    if (amount > userData.tsrBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setSending(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/send-tsr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toAddress: recipientAddress,
          amount,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Successfully sent ${amount} TSR!`);
        setShowSendDialog(false);
        setSendAmount('');
        setRecipientAddress('');
        refreshData();
        fetchTransactions();
      } else {
        toast.error(result.error || 'Failed to send TSR');
      }
    } catch (error) {
      console.error('Send TSR error:', error);
      toast.error('Failed to send TSR. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getTransactionType = (tx: Transaction) => {
    if (tx.from === userData.userId) return 'sent';
    if (tx.to === userData.userId) return 'received';
    return 'unknown';
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
          <WalletIcon className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-white text-2xl">My Wallet</h1>
          <p className="text-slate-400 text-sm">Manage your assets</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="space-y-4 mb-6">
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <img src={logoImage} alt="TSR" className="w-8 h-8" />
            <span className="text-amber-950">Trustora Token</span>
          </div>
          <h2 className="text-4xl text-white mb-1">{userData.tsrBalance.toFixed(6)} TSR</h2>
          <p className="text-amber-950">≈ ${(userData.tsrBalance * 1.25).toFixed(2)} USD</p>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400">T</span>
            </div>
            <span className="text-slate-400">Trust Points</span>
          </div>
          <h3 className="text-3xl text-white mb-1">{userData.trustPoints.toFixed(2)}</h3>
          <p className="text-slate-400">{(20 - (userData.trustPoints % 20)).toFixed(2)} more to convert to TSR</p>
        </Card>
      </div>

      {/* Wallet Address */}
      <Card className="bg-slate-800 border-slate-700 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-400 text-sm">Wallet Address</p>
          <Button
            onClick={copyAddress}
            variant="ghost"
            size="sm"
            className="text-amber-400 hover:text-amber-300 h-auto p-1"
          >
            {copiedAddress ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <code className="text-white text-sm break-all block">
          {userData.walletAddress}
        </code>
      </Card>

      {/* Private Key */}
      <Card className="bg-slate-800 border-slate-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            <p className="text-slate-400 text-sm">Private Key</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white h-auto p-1"
            >
              {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            {showPrivateKey && (
              <Button
                onClick={copyPrivateKey}
                variant="ghost"
                size="sm"
                className="text-amber-400 hover:text-amber-300 h-auto p-1"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <code className="text-white text-sm break-all block">
          {showPrivateKey ? userData.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
        </code>
        <p className="text-red-400 text-xs mt-2">⚠️ Never share your private key with anyone!</p>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button 
          onClick={() => setShowSendDialog(true)}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Send
        </Button>
        <Button 
          onClick={() => setShowReceiveDialog(true)}
          variant="outline" 
          className="border-slate-700 text-white hover:bg-slate-800"
        >
          <ArrowDownLeft className="w-4 h-4 mr-2" />
          Receive
        </Button>
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        <h3 className="text-white mb-3">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">No transactions yet</p>
          </Card>
        ) : (
          transactions.map((tx) => {
            const type = getTransactionType(tx);
            return (
              <Card key={tx.id} className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    type === 'sent' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {type === 'sent' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white capitalize">{type}</h4>
                    <p className="text-slate-400 text-sm">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={type === 'sent' ? 'text-red-400' : 'text-green-400'}>
                      {type === 'sent' ? '-' : '+'}{tx.amount.toFixed(6)} TSR
                    </p>
                    <p className="text-slate-400 text-sm capitalize">{tx.status}</p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Send TSR</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient" className="text-white">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-2"
              />
            </div>
            <div>
              <Label htmlFor="amount" className="text-white">Amount (TSR)</Label>
              <Input
                id="amount"
                type="number"
                step="0.000001"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-2"
              />
              <p className="text-slate-400 text-sm mt-1">
                Available: {userData.tsrBalance.toFixed(6)} TSR
              </p>
            </div>
            <Button
              onClick={handleSend}
              disabled={sending}
              className="w-full bg-amber-500 hover:bg-amber-600"
            >
              {sending ? 'Sending...' : 'Send TSR'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Receive TSR</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">Share this address to receive TSR tokens</p>
            <div className="bg-slate-700 rounded-lg p-4">
              <code className="text-white text-sm break-all block mb-4">
                {userData.walletAddress}
              </code>
              <Button
                onClick={copyAddress}
                variant="outline"
                className="w-full border-slate-600 text-white hover:bg-slate-600"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
