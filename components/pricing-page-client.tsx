'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './toast-provider';

interface ProductInfo {
  id: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    interval: string;
  } | null;
}

export function PricingPageClient() {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        const response = await fetch('/api/stripe/product');
        if (response.ok) {
          const data = await response.json();
          setProductInfo(data);
        } else {
          showToast(t('pricing.errorFetchingProduct'), 'error');
        }
      } catch (error) {
        console.error('Error fetching product info:', error);
        showToast(t('pricing.errorFetchingProduct'), 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductInfo();
  }, [t, showToast]);

  const handleSubscribe = () => {
    // Get the payment link from environment variable
    // Note: This should be set as STRIPE_PAYMENT_LINK in the backend
    fetch('/api/stripe/payment-link')
      .then(response => response.json())
      .then(data => {
        if (data.paymentLink) {
          window.location.href = data.paymentLink;
        } else {
          showToast(t('pricing.errorRedirecting'), 'error');
        }
      })
      .catch(() => {
        showToast(t('pricing.errorRedirecting'), 'error');
      });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('pricing.title')}</h1>
        <p className="text-xl text-gray-600">{t('pricing.subtitle')}</p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {productInfo?.name || 'planYmeal Premium'}
            </h2>
            {productInfo?.price && (
              <div className="mb-4">
                <span className="text-4xl font-bold text-blue-600">
                  {formatPrice(productInfo.price.amount, productInfo.price.currency)}
                </span>
                <span className="text-lg text-gray-600 ml-2">
                  / {t(`pricing.interval.${productInfo.price.interval}`)}
                </span>
              </div>
            )}
            {productInfo?.description && (
              <p className="text-gray-600">{productInfo.description}</p>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing.features')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{t('pricing.feature.unlimitedMenus')}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleSubscribe}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {t('pricing.subscribe')}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            {t('pricing.cancelAnytime')}
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pricing.freeLimit.title')}</h3>
          <p className="text-gray-600">{t('pricing.freeLimit.description')}</p>
        </div>
      </div>
    </div>
  );
}