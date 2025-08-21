'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

interface SubscriptionStatus {
  subscription: {
    status: string | null;
    isActive: boolean;
  };
  menuCount: number;
  menuLimit: number;
  canCreateMenu: boolean;
}

export function AccountPageClient() {
  const { data: session } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionStatus(data);
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'trial':
        return 'text-blue-600 bg-blue-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string | null) => {
    if (!status) return t('account.subscription.free');
    return t(`account.subscription.${status}`);
  };

  const handleManageSubscription = () => {
    // Open Stripe customer portal
    window.open('https://billing.stripe.com/p/login/test_00000000000000', '_blank');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('account.title')}</h1>
        <p className="text-gray-600">{t('account.subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('account.profile.title')}</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {session?.user?.image && (
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-gray-600">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Information */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('account.subscription.title')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('account.subscription.status')}
              </label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscriptionStatus?.subscription.status || null)}`}>
                {getStatusText(subscriptionStatus?.subscription.status || null)}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('account.subscription.menuUsage')}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${subscriptionStatus?.subscription.isActive ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{
                      width: subscriptionStatus?.subscription.isActive 
                        ? '100%' 
                        : `${Math.min(100, (subscriptionStatus?.menuCount || 0) / (subscriptionStatus?.menuLimit || 10) * 100)}%`
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {subscriptionStatus?.menuCount || 0}
                  {!subscriptionStatus?.subscription.isActive && ` / ${subscriptionStatus?.menuLimit || 10}`}
                </span>
              </div>
              {!subscriptionStatus?.subscription.isActive && (
                <p className="text-sm text-gray-500 mt-1">
                  {t('account.subscription.freeLimit')}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              {subscriptionStatus?.subscription.isActive ? (
                <button
                  onClick={handleManageSubscription}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {t('account.subscription.manage')}
                </button>
              ) : (
                <a
                  href="/pricing"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
                >
                  {t('account.subscription.upgrade')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}