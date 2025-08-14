import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, ExternalLink } from 'lucide-react';

interface SubscriptionStatusProps {
  user: any;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free');

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [user]);

  const fetchSubscriptionStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check subscription status from subscribers table
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription status:', error);
        return;
      }

      // Determine status based on subscribed flag and tier
      if (data?.subscribed && data?.subscription_tier) {
        setSubscriptionStatus('active');
      } else {
        setSubscriptionStatus('free');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Portal Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pro Active</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      default:
        return <Badge variant="outline">Free Plan</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Subscription Status
          {getStatusBadge(subscriptionStatus)}
        </CardTitle>
        <CardDescription>
          {subscriptionStatus === 'active' 
            ? 'You have unlimited access to all Pro features.'
            : 'Upgrade to Pro for unlimited posting and wider visibility.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscriptionStatus === 'active' && (
          <Button 
            variant="outline" 
            onClick={handleManageSubscription}
            disabled={portalLoading}
          >
            {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <ExternalLink className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
